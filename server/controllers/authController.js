const OtpVerification = require("../models/OtpVerification");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { generateOTP, hashOTP, verifyOTP, normalizeMobile, isValidIndianMobile } = require("../utils/otp");
const { signAuthToken, signVerificationToken, verifyVerificationToken, getAuthCookieOptions } = require("../utils/jwt");
const { sendOTPEmail } = require("../services/emailService");
const { ALLOWED_ROLES } = require("../constants/roles");
const { ALLOWED_SKILLS } = require("../constants/labourSkills");
const { ALLOWED_PRODUCTS } = require("../constants/dealerProducts");
const { NODE_ENV } = require("../config/env");

// ─── Configuration constants ──────────────────────────────────────────────
const OTP_EXPIRY_MS = 5 * 60 * 1000;       // 5 minutes
const OTP_MAX_ATTEMPTS = 5;
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;  // 60 seconds

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Validate and normalize Step 1 data — shared between registration and resend */
const validateStep1 = (body) => {
  const { firstName, lastName, email, mobile, role, experienceYears } = body;
  const errors = [];

  if (!firstName || typeof firstName !== "string" || !firstName.trim()) errors.push("First name is required.");
  if (!lastName || typeof lastName !== "string" || !lastName.trim()) errors.push("Last name is required.");
  if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim())) errors.push("Valid email is required.");
  if (!mobile) errors.push("Mobile number is required.");
  if (!role || !ALLOWED_ROLES.includes(role)) errors.push("Role must be one of: farmer, labour, dealer.");

  const normalizedMobile = normalizeMobile(String(mobile || ""));
  if (!isValidIndianMobile(normalizedMobile)) errors.push("Please provide a valid 10-digit Indian mobile number.");

  if (role === "labour") {
    if (experienceYears === undefined || experienceYears === null || experienceYears === "") {
      errors.push("Experience in agricultural labour is required.");
    } else {
      const exp = Number(experienceYears);
      if (!Number.isInteger(exp) || exp < 0 || exp > 60) {
        errors.push("Experience must be a whole number between 0 and 60.");
      }
    }
  }

  if (errors.length > 0) return { valid: false, errors };

  return {
    valid: true,
    data: {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim().toLowerCase(),
      mobile: normalizedMobile,
      role,
      experienceYears: role === "labour" ? Number(experienceYears) : undefined,
    },
  };
};

// ─── REGISTRATION: Step 1 — Request OTP ──────────────────────────────────

const requestOTP = async (req, res, next) => {
  try {
    const validation = validateStep1(req.body);
    if (!validation.valid) {
      return next(new AppError(validation.errors[0], 400));
    }

    const { firstName, lastName, email, mobile, role, experienceYears } = validation.data;

    // Check for duplicate email or mobile in existing users
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return next(new AppError("An account with this email already exists.", 409));

    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) return next(new AppError("An account with this mobile number already exists.", 409));

    // Check resend cooldown on existing OTP session
    const existingSession = await OtpVerification.findOne({ email, type: "registration" });
    if (existingSession) {
      const cooldownRemaining = OTP_RESEND_COOLDOWN_MS - (Date.now() - existingSession.lastSentAt.getTime());
      if (cooldownRemaining > 0) {
        return next(new AppError(`Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before requesting a new OTP.`, 429));
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    // Upsert OTP session (replace any existing one for this email)
    await OtpVerification.findOneAndReplace(
      { email, type: "registration" },
      {
        type: "registration",
        email,
        mobile,
        firstName,
        lastName,
        role,
        experienceYears,
        otpHash,
        otpExpiresAt,
        attempts: 0,
        lastSentAt: new Date(),
        verified: false,
      },
      { upsert: true, new: true }
    );

    // Send email (OTP is generated above, used here, then discarded)
    await sendOTPEmail({ to: email, firstName, otp });

    // NEVER return the OTP in the response
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your email.",
      data: { email },
    });
  } catch (err) {
    next(err);
  }
};

// ─── REGISTRATION: Step 2 — Verify OTP ───────────────────────────────────

const verifyOTPHandler = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) return next(new AppError("Email and OTP are required.", 400));

    const cleanEmail = email.trim().toLowerCase();
    const cleanOTP = String(otp).trim();

    const session = await OtpVerification.findOne({ email: cleanEmail, type: "registration" });

    if (!session) return next(new AppError("No OTP session found. Please request a new OTP.", 400));
    if (session.verified) return next(new AppError("OTP already verified.", 400));

    // Check attempt limit BEFORE verifying
    if (session.attempts >= OTP_MAX_ATTEMPTS) {
      await OtpVerification.deleteOne({ _id: session._id });
      return next(new AppError("Too many attempts. Please request a new OTP.", 429));
    }

    // Increment attempt count immediately (prevents timing attacks via repeated attempts)
    session.attempts += 1;
    await session.save();

    // Check expiry
    if (new Date() > session.otpExpiresAt) {
      await OtpVerification.deleteOne({ _id: session._id });
      return next(new AppError("OTP has expired. Please request a new OTP.", 400));
    }

    // Verify OTP hash
    const isValid = await verifyOTP(cleanOTP, session.otpHash);
    if (!isValid) {
      const attemptsLeft = OTP_MAX_ATTEMPTS - session.attempts;
      if (attemptsLeft <= 0) {
        await OtpVerification.deleteOne({ _id: session._id });
        return next(new AppError("Too many attempts. Please request a new OTP.", 429));
      }
      return next(new AppError(`Invalid OTP. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`, 400));
    }

    // Mark as verified
    session.verified = true;
    session.verifiedAt = new Date();
    await session.save();

    // Issue short-lived verification token (proves OTP was verified)
    // This token must accompany the Step 3 registration request.
    const verificationToken = signVerificationToken(cleanEmail, session.role);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      data: {
        verificationToken,
        email: cleanEmail,
        role: session.role,
        firstName: session.firstName,
        lastName: session.lastName,
        mobile: session.mobile,
        experienceYears: session.experienceYears,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── REGISTRATION: Step 3 — Final Registration ───────────────────────────

const register = async (req, res, next) => {
  try {
    const { verificationToken, address, farmerProfile, labourProfile, dealerProfile } = req.body;

    // 1. Validate verificationToken — backend enforces OTP was verified
    if (!verificationToken) {
      return next(new AppError("Verification token is required.", 400));
    }

    let tokenPayload;
    try {
      tokenPayload = verifyVerificationToken(verificationToken);
    } catch {
      return next(new AppError("Invalid or expired verification token. Please restart registration.", 401));
    }

    const { email, role } = tokenPayload;

    // 2. Confirm OTP session still exists and is verified
    const session = await OtpVerification.findOne({ email, type: "registration", verified: true });
    if (!session) {
      return next(new AppError("OTP verification not found or expired. Please restart registration.", 401));
    }

    // 3. Check duplicate (in case another registration slipped in)
    const existingEmail = await User.findOne({ email });
    if (existingEmail) return next(new AppError("An account with this email already exists.", 409));

    const existingMobile = await User.findOne({ mobile: session.mobile });
    if (existingMobile) return next(new AppError("An account with this mobile number already exists.", 409));

    // 4. Validate and build role-specific profile
    let farmerData, labourData, dealerData;

    if (role === "farmer") {
      if (!farmerProfile) return next(new AppError("Farmer profile is required.", 400));
      const { stateId, state, districtId, district, talukaId, taluka, villageId, village, gatNo } = farmerProfile;
      if (!stateId || !state || !districtId || !district || !talukaId || !taluka || !villageId || !village || !gatNo) {
        return next(new AppError("All location fields and Gat No are required.", 400));
      }
      farmerData = {
        stateId: stateId.trim(),
        state: state.trim(),
        districtId: districtId.trim(),
        district: district.trim(),
        talukaId: talukaId.trim(),
        taluka: taluka.trim(),
        villageId: villageId.trim(),
        village: village.trim(),
        gatNo: String(gatNo).trim(),
      };
    }

    if (role === "labour") {
      if (!labourProfile) return next(new AppError("Labour profile is required.", 400));
      const { skills } = labourProfile;

      // experienceYears comes from the verified session (trusted server-side data)
      const expYears = session.experienceYears;
      if (expYears === undefined || expYears === null) {
        return next(new AppError("Experience years not found in session.", 400));
      }

      // Validate submitted skills against authoritative list
      const submittedSkills = Array.isArray(skills) ? skills : [];
      const invalidSkills = submittedSkills.filter((s) => !ALLOWED_SKILLS.includes(s));
      if (invalidSkills.length > 0) {
        return next(new AppError(`Invalid skill(s): ${invalidSkills.join(", ")}.`, 400));
      }

      labourData = {
        experienceYears: expYears,
        skills: submittedSkills,
      };
    }

    if (role === "dealer") {
      if (!dealerProfile) return next(new AppError("Dealer profile is required.", 400));
      const { products } = dealerProfile;

      const submittedProducts = Array.isArray(products) ? products : [];
      const invalidProducts = submittedProducts.filter((p) => !ALLOWED_PRODUCTS.includes(p));
      if (invalidProducts.length > 0) {
        return next(new AppError(`Invalid product(s): ${invalidProducts.join(", ")}.`, 400));
      }

      dealerData = { products: submittedProducts };
    }

    // 5. Create user
    const userData = {
      firstName: session.firstName,
      lastName: session.lastName,
      email,
      mobile: session.mobile,
      role,
      status: "active",
    };

    if (address && (role === "labour" || role === "dealer")) {
      userData.address = address.trim();
    }
    if (farmerData) userData.farmerProfile = farmerData;
    if (labourData) userData.labourProfile = labourData;
    if (dealerData) userData.dealerProfile = dealerData;

    const user = await User.create(userData);

    // 6. Clean up OTP session
    await OtpVerification.deleteOne({ _id: session._id });

    // 7. Issue auth JWT and set HTTP-only cookie
    const authToken = signAuthToken(user._id, user.role);
    res.cookie("authToken", authToken, getAuthCookieOptions(NODE_ENV));

    // 8. Return safe user data (never return OTP, never return sensitive fields)
    return res.status(201).json({
      success: true,
      message: "Registration completed successfully. Welcome to KrishiDhara!",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN: Step 1 — Request OTP ─────────────────────────────────────────

const loginRequestOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return next(new AppError("Valid email is required.", 400));
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find user
    let user = await User.findOne({ email: cleanEmail });
    
    // Auto-create admin user if not exists
    if (!user && cleanEmail === "krishidhara00@gmail.com") {
      user = await User.create({
        firstName: "Admin",
        lastName: "KrishiDhara",
        email: cleanEmail,
        mobile: "0000000000",
        role: "admin",
        status: "active"
      });
    }

    if (!user) {
      return next(new AppError("Account not found. Please register first.", 404));
    }

    if (user.status === "inactive") {
      return next(new AppError("Your account is currently inactive. Please contact the administrator.", 403));
    }

    const successMessage = "OTP sent successfully. Please check your email.";

    // Check resend cooldown
    const existingSession = await OtpVerification.findOne({ email: cleanEmail, type: "login" });
    if (existingSession) {
      const cooldownRemaining = OTP_RESEND_COOLDOWN_MS - (Date.now() - existingSession.lastSentAt.getTime());
      if (cooldownRemaining > 0) {
        return next(new AppError(`Please wait ${Math.ceil(cooldownRemaining / 1000)} seconds before requesting a new OTP.`, 429));
      }
    }

    const otp = generateOTP();
    const otpHash = await hashOTP(otp);

    await OtpVerification.findOneAndReplace(
      { email: cleanEmail, type: "login" },
      {
        type: "login",
        email: cleanEmail,
        otpHash,
        otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        attempts: 0,
        lastSentAt: new Date(),
        verified: false,
      },
      { upsert: true, new: true }
    );

    await sendOTPEmail({ to: cleanEmail, firstName: user.firstName, otp });

    return res.status(200).json({ success: true, message: successMessage, data: { email: cleanEmail } });
  } catch (err) {
    next(err);
  }
};

// ─── LOGIN: Step 2 — Verify OTP ──────────────────────────────────────────

const loginVerifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return next(new AppError("Email and OTP are required.", 400));

    const cleanEmail = email.trim().toLowerCase();
    const cleanOTP = String(otp).trim();

    const session = await OtpVerification.findOne({ email: cleanEmail, type: "login" });
    if (!session) return next(new AppError("No OTP session found. Please request a new OTP.", 400));

    if (session.attempts >= OTP_MAX_ATTEMPTS) {
      await OtpVerification.deleteOne({ _id: session._id });
      return next(new AppError("Too many attempts. Please request a new OTP.", 429));
    }

    session.attempts += 1;
    await session.save();

    if (new Date() > session.otpExpiresAt) {
      await OtpVerification.deleteOne({ _id: session._id });
      return next(new AppError("OTP has expired. Please request a new OTP.", 400));
    }

    const isValid = await verifyOTP(cleanOTP, session.otpHash);
    if (!isValid) {
      const attemptsLeft = OTP_MAX_ATTEMPTS - session.attempts;
      if (attemptsLeft <= 0) {
        await OtpVerification.deleteOne({ _id: session._id });
        return next(new AppError("Too many attempts. Please request a new OTP.", 429));
      }
      return next(new AppError(`Invalid OTP. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`, 400));
    }

    // Find user
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return next(new AppError("Account not found.", 404));

    if (user.status === "inactive") {
      return next(new AppError("Your account is currently inactive. Please contact the administrator.", 403));
    }

    await OtpVerification.deleteOne({ _id: session._id });

    const authToken = signAuthToken(user._id, user.role);
    res.cookie("authToken", authToken, getAuthCookieOptions(NODE_ENV));

    return res.status(200).json({
      success: true,
      message: "Logged in successfully.",
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

// ─── LOGOUT ───────────────────────────────────────────────────────────────

const logout = (req, res) => {
  res.cookie("authToken", "", {
    httpOnly: true,
    expires: new Date(0), // Immediately expire the cookie
    path: "/",
  });
  return res.status(200).json({ success: true, message: "Logged out successfully." });
};

// ─── GET ME ───────────────────────────────────────────────────────────────

const getMe = async (req, res, next) => {
  try {
    // req.user is populated by optionalAuthenticateUser middleware
    const user = req.user;
    
    if (!user) {
      return res.status(200).json({
        success: true,
        data: { user: null },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
          address: user.address,
          farmerProfile: user.farmerProfile,
          labourProfile: user.labourProfile,
          dealerProfile: user.dealerProfile,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  requestOTP,
  verifyOTPHandler,
  register,
  loginRequestOTP,
  loginVerifyOTP,
  logout,
  getMe,
};

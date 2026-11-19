const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { ALLOWED_SKILLS } = require("../constants/labourSkills");
const { ALLOWED_PRODUCTS } = require("../constants/dealerProducts");
const { normalizeMobile, isValidIndianMobile } = require("../utils/otp");

/**
 * GET /api/users/labours
 * Query params:
 *   skills (optional) — comma-separated skill names, e.g. "Plowing,Harvesting"
 *                       If provided, only labours who have ANY of those skills are returned.
 *
 * Only accessible to authenticated users (farmer, dealer, etc.)
 */
const getLabours = async (req, res, next) => {
  try {
    const { skills } = req.query;

    // Build the base filter: role = labour, status = active
    const filter = { role: "labour", status: "active" };

    // Skill filter — validate and apply if provided
    if (skills && skills.trim()) {
      const requestedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      // Silently ignore unknown skills
      const validSkills = requestedSkills.filter((s) => ALLOWED_SKILLS.includes(s));

      if (validSkills.length > 0) {
        // $in = labour has AT LEAST ONE of the requested skills
        filter["labourProfile.skills"] = { $in: validSkills };
      }
    }

    const labours = await User.find(filter)
      .select(
        "firstName lastName mobile address labourProfile profilePicture createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: labours.length,
      data: { labours },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/dealers
 * Query params:
 *   products (optional) — comma-separated product names, e.g. "Wheat,Rice / Paddy"
 *                         If provided, only dealers who deal ANY of those products are returned.
 *
 * Only accessible to authenticated users.
 */
const getDealers = async (req, res, next) => {
  try {
    const { products } = req.query;

    // Base filter: role = dealer, status = active
    const filter = { role: "dealer", status: "active" };

    // Product filter — validate and apply if provided
    if (products && products.trim()) {
      const requestedProducts = products
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const validProducts = requestedProducts.filter((p) => ALLOWED_PRODUCTS.includes(p));

      if (validProducts.length > 0) {
        filter["dealerProfile.products"] = { $in: validProducts };
      }
    }

    const dealers = await User.find(filter)
      .select("firstName lastName mobile address dealerProfile profilePicture createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: dealers.length,
      data: { dealers },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile-picture
 * Handles uploading or updating the authenticated user's profile picture.
 */
const updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError("Please provide an image file to upload.", 400));
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    // If user already had a custom profile picture stored locally, delete the old file
    if (user.profilePicture && user.profilePicture.startsWith("/uploads/avatars/")) {
      const oldFilename = path.basename(user.profilePicture);
      const oldFilePath = path.join(__dirname, "..", "uploads", "avatars", oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (unlinkErr) {
          console.warn("Could not delete old avatar file:", unlinkErr.message);
        }
      }
    }

    // Set new profile picture path
    const relativePath = `/uploads/avatars/${req.file.filename}`;
    user.profilePicture = relativePath;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture updated successfully.",
      data: {
        profilePicture: user.profilePicture,
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
          profilePicture: user.profilePicture,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/users/profile-picture
 * Removes the authenticated user's profile picture.
 */
const deleteProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    if (user.profilePicture && user.profilePicture.startsWith("/uploads/avatars/")) {
      const oldFilename = path.basename(user.profilePicture);
      const oldFilePath = path.join(__dirname, "..", "uploads", "avatars", oldFilename);
      if (fs.existsSync(oldFilePath)) {
        try {
          fs.unlinkSync(oldFilePath);
        } catch (unlinkErr) {
          console.warn("Could not delete avatar file:", unlinkErr.message);
        }
      }
    }

    user.profilePicture = "";
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile picture removed successfully.",
      data: {
        profilePicture: "",
        user: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobile: user.mobile,
          role: user.role,
          status: user.status,
          profilePicture: "",
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/profile
 * Returns the currently authenticated user's profile.
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-__v");
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/profile
 * Updates the currently authenticated user's profile.
 * Validates editable fields according to role, checks mobile/email uniqueness,
 * prevents modification of protected fields (role, status, _id),
 * and preserves dealer products / labour skills unless explicitly changed.
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    const {
      firstName,
      lastName,
      email,
      mobile,
      address,
      profilePicture,
      farmerProfile,
      dealerProfile,
      labourProfile,
    } = req.body;

    // ─── 1. Common Personal Details Validation ──────────────────────

    if (firstName !== undefined) {
      if (typeof firstName !== "string" || !firstName.trim()) {
        return next(new AppError("First name cannot be empty.", 400));
      }
      if (firstName.trim().length > 50) {
        return next(new AppError("First name cannot exceed 50 characters.", 400));
      }
      user.firstName = firstName.trim();
    }

    if (lastName !== undefined) {
      if (typeof lastName !== "string" || !lastName.trim()) {
        return next(new AppError("Last name cannot be empty.", 400));
      }
      if (lastName.trim().length > 50) {
        return next(new AppError("Last name cannot exceed 50 characters.", 400));
      }
      user.lastName = lastName.trim();
    }

    if (mobile !== undefined) {
      const normalizedMobile = normalizeMobile(String(mobile || ""));
      if (!isValidIndianMobile(normalizedMobile)) {
        return next(
          new AppError(
            "Please provide a valid 10-digit Indian mobile number.",
            400
          )
        );
      }
      // Check uniqueness against other users
      if (normalizedMobile !== user.mobile) {
        const existingMobile = await User.findOne({
          mobile: normalizedMobile,
          _id: { $ne: user._id },
        });
        if (existingMobile) {
          return next(
            new AppError("An account with this mobile number already exists.", 409)
          );
        }
        user.mobile = normalizedMobile;
      }
    }

    if (email !== undefined) {
      const cleanEmail = String(email || "").trim().toLowerCase();
      if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail)) {
        return next(new AppError("Please provide a valid email address.", 400));
      }
      // Check uniqueness against other users
      if (cleanEmail !== user.email) {
        const existingEmail = await User.findOne({
          email: cleanEmail,
          _id: { $ne: user._id },
        });
        if (existingEmail) {
          return next(
            new AppError("An account with this email already exists.", 409)
          );
        }
        user.email = cleanEmail;
      }
    }

    if (address !== undefined) {
      const cleanAddress = String(address || "").trim();
      if (cleanAddress.length > 300) {
        return next(new AppError("Address cannot exceed 300 characters.", 400));
      }
      user.address = cleanAddress;
    }

    if (profilePicture !== undefined) {
      user.profilePicture = String(profilePicture || "").trim();
    }

    // ─── 2. Role-specific Updates ───────────────────────────────────

    // Farmer
    if (user.role === "farmer" && farmerProfile) {
      if (!user.farmerProfile) user.farmerProfile = {};

      if (farmerProfile.gatNo !== undefined) {
        const gat = String(farmerProfile.gatNo || "").trim();
        if (!gat) {
          return next(new AppError("Gat number cannot be empty.", 400));
        }
        if (gat.length > 50) {
          return next(new AppError("Gat number cannot exceed 50 characters.", 400));
        }
        user.farmerProfile.gatNo = gat;
      }

      if (farmerProfile.stateId !== undefined) user.farmerProfile.stateId = String(farmerProfile.stateId).trim();
      if (farmerProfile.state !== undefined) user.farmerProfile.state = String(farmerProfile.state).trim();
      if (farmerProfile.districtId !== undefined) user.farmerProfile.districtId = String(farmerProfile.districtId).trim();
      if (farmerProfile.district !== undefined) user.farmerProfile.district = String(farmerProfile.district).trim();
      if (farmerProfile.talukaId !== undefined) user.farmerProfile.talukaId = String(farmerProfile.talukaId).trim();
      if (farmerProfile.taluka !== undefined) user.farmerProfile.taluka = String(farmerProfile.taluka).trim();
      if (farmerProfile.villageId !== undefined) user.farmerProfile.villageId = String(farmerProfile.villageId).trim();
      if (farmerProfile.village !== undefined) user.farmerProfile.village = String(farmerProfile.village).trim();
    }

    // Dealer
    if (user.role === "dealer" && dealerProfile) {
      if (!user.dealerProfile) user.dealerProfile = { products: [] };

      if (dealerProfile.businessName !== undefined) {
        const bName = String(dealerProfile.businessName || "").trim();
        if (bName.length > 100) {
          return next(new AppError("Business name cannot exceed 100 characters.", 400));
        }
        user.dealerProfile.businessName = bName;
      }

      if (dealerProfile.stateId !== undefined) user.dealerProfile.stateId = String(dealerProfile.stateId).trim();
      if (dealerProfile.state !== undefined) user.dealerProfile.state = String(dealerProfile.state).trim();
      if (dealerProfile.districtId !== undefined) user.dealerProfile.districtId = String(dealerProfile.districtId).trim();
      if (dealerProfile.district !== undefined) user.dealerProfile.district = String(dealerProfile.district).trim();
      if (dealerProfile.talukaId !== undefined) user.dealerProfile.talukaId = String(dealerProfile.talukaId).trim();
      if (dealerProfile.taluka !== undefined) user.dealerProfile.taluka = String(dealerProfile.taluka).trim();
      if (dealerProfile.villageId !== undefined) user.dealerProfile.villageId = String(dealerProfile.villageId).trim();
      if (dealerProfile.village !== undefined) user.dealerProfile.village = String(dealerProfile.village).trim();

      // Preserve existing products unless explicitly provided as valid array
      if (Array.isArray(dealerProfile.products)) {
        const invalidProducts = dealerProfile.products.filter(
          (p) => !ALLOWED_PRODUCTS.includes(p)
        );
        if (invalidProducts.length > 0) {
          return next(
            new AppError(`Invalid product(s): ${invalidProducts.join(", ")}.`, 400)
          );
        }
        user.dealerProfile.products = dealerProfile.products;
      }
    }

    // Labour / Worker
    if (user.role === "labour" && labourProfile) {
      if (!user.labourProfile) user.labourProfile = { skills: [], experienceYears: 0 };

      if (labourProfile.experienceYears !== undefined && labourProfile.experienceYears !== "") {
        const exp = Number(labourProfile.experienceYears);
        if (isNaN(exp) || !Number.isInteger(exp) || exp < 0 || exp > 60) {
          return next(
            new AppError("Experience must be a whole number between 0 and 60.", 400)
          );
        }
        user.labourProfile.experienceYears = exp;
      }

      if (Array.isArray(labourProfile.skills)) {
        const invalidSkills = labourProfile.skills.filter(
          (s) => !ALLOWED_SKILLS.includes(s)
        );
        if (invalidSkills.length > 0) {
          return next(
            new AppError(`Invalid skill(s): ${invalidSkills.join(", ")}.`, 400)
          );
        }
        user.labourProfile.skills = labourProfile.skills;
      }

      if (
        labourProfile.expectedWage !== undefined &&
        labourProfile.expectedWage !== null &&
        labourProfile.expectedWage !== ""
      ) {
        const wage = Number(labourProfile.expectedWage);
        if (isNaN(wage) || wage < 0) {
          return next(new AppError("Expected wage must be a non-negative number.", 400));
        }
        user.labourProfile.expectedWage = wage;
      }

      if (labourProfile.availability !== undefined) {
        const avail = String(labourProfile.availability || "").trim().toLowerCase();
        const allowedAvail = ["available", "busy", "part-time", "any", ""];
        if (!allowedAvail.includes(avail)) {
          return next(new AppError("Invalid availability status.", 400));
        }
        user.labourProfile.availability = avail;
      }

      if (labourProfile.stateId !== undefined) user.labourProfile.stateId = String(labourProfile.stateId).trim();
      if (labourProfile.state !== undefined) user.labourProfile.state = String(labourProfile.state).trim();
      if (labourProfile.districtId !== undefined) user.labourProfile.districtId = String(labourProfile.districtId).trim();
      if (labourProfile.district !== undefined) user.labourProfile.district = String(labourProfile.district).trim();
      if (labourProfile.talukaId !== undefined) user.labourProfile.talukaId = String(labourProfile.talukaId).trim();
      if (labourProfile.taluka !== undefined) user.labourProfile.taluka = String(labourProfile.taluka).trim();
      if (labourProfile.villageId !== undefined) user.labourProfile.villageId = String(labourProfile.villageId).trim();
      if (labourProfile.village !== undefined) user.labourProfile.village = String(labourProfile.village).trim();
    }

    // ─── 3. Save Changes & Send Response ───────────────────────────
    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
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
          profilePicture: user.profilePicture || "",
          farmerProfile: user.farmerProfile,
          labourProfile: user.labourProfile,
          dealerProfile: user.dealerProfile,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getLabours,
  getDealers,
  updateProfilePicture,
  deleteProfilePicture,
  getProfile,
  updateProfile,
};

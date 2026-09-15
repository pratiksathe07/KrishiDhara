const jwt = require("jsonwebtoken");
const {
  JWT_SECRET,
  JWT_EXPIRES_IN,
  VERIFICATION_TOKEN_SECRET,
  VERIFICATION_TOKEN_EXPIRES_IN,
} = require("../config/env");

/**
 * Sign an authentication JWT (stored in HTTP-only cookie).
 * Payload: { userId, role }
 */
const signAuthToken = (userId, role) => {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify an authentication JWT.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 */
const verifyAuthToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

/**
 * Sign a short-lived verification token issued after OTP success.
 * Used to prove OTP was verified before allowing final registration.
 * Payload: { email, role, type: 'registration-verified' }
 */
const signVerificationToken = (email, role) => {
  return jwt.sign(
    { email, role, type: "registration-verified" },
    VERIFICATION_TOKEN_SECRET,
    { expiresIn: VERIFICATION_TOKEN_EXPIRES_IN }
  );
};

/**
 * Verify a registration verification token.
 * Throws if invalid or expired.
 */
const verifyVerificationToken = (token) => {
  const payload = jwt.verify(token, VERIFICATION_TOKEN_SECRET);
  if (payload.type !== "registration-verified") {
    throw new Error("Invalid token type.");
  }
  return payload;
};

/**
 * Get cookie options for the auth JWT.
 * Secure + SameSite=Strict in production.
 */
const getAuthCookieOptions = (nodeEnv) => {
  const isProduction = nodeEnv === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    path: "/",
  };
};

module.exports = {
  signAuthToken,
  verifyAuthToken,
  signVerificationToken,
  verifyVerificationToken,
  getAuthCookieOptions,
};

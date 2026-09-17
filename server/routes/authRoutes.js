const express = require("express");
const rateLimit = require("express-rate-limit");
const {
  requestOTP,
  verifyOTPHandler,
  register,
  loginRequestOTP,
  loginVerifyOTP,
  logout,
  getMe,
} = require("../controllers/authController");
const { authenticateUser, optionalAuthenticateUser } = require("../middleware/authenticate");

const router = express.Router();

// ─── OTP-specific rate limiters ───────────────────────────────────────────

/** Limit OTP request to 5 per 15 minutes per IP */
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 5 : 1000,
  message: { success: false, message: "Too many OTP requests. Please try again after 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

/** Limit OTP verification to 10 per 15 minutes per IP */
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "production" ? 10 : 1000,
  message: { success: false, message: "Too many verification attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Registration routes ──────────────────────────────────────────────────
router.post("/request-otp", otpRequestLimiter, requestOTP);
router.post("/verify-otp", otpVerifyLimiter, verifyOTPHandler);
router.post("/register", register);

// ─── Login routes ─────────────────────────────────────────────────────────
router.post("/login/request-otp", otpRequestLimiter, loginRequestOTP);
router.post("/login/verify-otp", otpVerifyLimiter, loginVerifyOTP);

// ─── Session routes ───────────────────────────────────────────────────────
router.post("/logout", logout);
router.get("/me", optionalAuthenticateUser, getMe);

module.exports = router;

const mongoose = require("mongoose");
const { ALLOWED_ROLES } = require("../constants/roles");

/**
 * Stores OTP sessions for both registration and login flows.
 * `type` distinguishes the two flows.
 *
 * Security notes:
 * - Only the hashed OTP is stored (never plaintext)
 * - TTL index auto-deletes documents after 30 minutes
 * - Attempts are tracked server-side (cannot be reset by frontend)
 */
const otpVerificationSchema = new mongoose.Schema(
  {
    // ── Flow type ────────────────────────────────────────────────────────
    type: {
      type: String,
      enum: ["registration", "login"],
      required: true,
    },

    // ── Contact ──────────────────────────────────────────────────────────
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    // ── Step 1 data (registration only, persisted so Step 3 is pre-populated) ──
    mobile: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    role: {
      type: String,
      enum: ALLOWED_ROLES,
    },
    // Only for labor registration
    experienceYears: { type: Number },

    // ── OTP ──────────────────────────────────────────────────────────────
    otpHash: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },

    // ── Attempt tracking ─────────────────────────────────────────────────
    attempts: {
      type: Number,
      default: 0,
    },
    lastSentAt: {
      type: Date,
      default: Date.now,
    },

    // ── Verification state ───────────────────────────────────────────────
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
// TTL index: MongoDB auto-deletes documents 30 minutes after createdAt
otpVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1800 });

// For fast lookups during OTP verification
otpVerificationSchema.index({ email: 1, type: 1 });

const OtpVerification = mongoose.model("OtpVerification", otpVerificationSchema);
module.exports = OtpVerification;

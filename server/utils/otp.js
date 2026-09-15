const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const OTP_LENGTH = 6;
const BCRYPT_ROUNDS = 10;

/**
 * Generate a cryptographically secure 6-digit OTP.
 * Uses crypto.randomInt which is CSPRNG-backed.
 * Never use Math.random() for OTPs.
 *
 * @returns {string} Zero-padded 6-digit OTP string e.g. "048271"
 */
const generateOTP = () => {
  // randomInt(min, max) is exclusive of max, so 0–999999
  const otp = crypto.randomInt(0, 10 ** OTP_LENGTH);
  return otp.toString().padStart(OTP_LENGTH, "0");
};

/**
 * Hash an OTP using bcrypt before storing it.
 * This ensures the plaintext OTP is never persisted.
 *
 * @param {string} otp - Plaintext OTP
 * @returns {Promise<string>} bcrypt hash
 */
const hashOTP = async (otp) => {
  return bcrypt.hash(otp, BCRYPT_ROUNDS);
};

/**
 * Verify a plaintext OTP against a stored bcrypt hash.
 * bcrypt.compare is timing-safe.
 *
 * @param {string} plainOTP - The OTP entered by the user
 * @param {string} hash - The stored bcrypt hash
 * @returns {Promise<boolean>}
 */
const verifyOTP = async (plainOTP, hash) => {
  return bcrypt.compare(plainOTP, hash);
};

/**
 * Normalize an Indian mobile number to a consistent 10-digit format.
 * Strips leading +91 or 91 prefix and non-digit characters.
 *
 * @param {string} mobile
 * @returns {string} 10-digit normalized mobile
 */
const normalizeMobile = (mobile) => {
  // Remove all non-digit characters
  let digits = mobile.replace(/\D/g, "");
  // Strip country code if present
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits;
};

/**
 * Validate Indian mobile number format.
 * Valid: 10-digit numbers starting with 6, 7, 8, or 9.
 *
 * @param {string} mobile - Already normalized 10-digit string
 * @returns {boolean}
 */
const isValidIndianMobile = (mobile) => {
  return /^[6-9]\d{9}$/.test(mobile);
};

module.exports = {
  generateOTP,
  hashOTP,
  verifyOTP,
  normalizeMobile,
  isValidIndianMobile,
};

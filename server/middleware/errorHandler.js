const { NODE_ENV } = require("../config/env");

/**
 * Centralized error handler middleware.
 * All errors thrown anywhere in the application end up here.
 * In production: no stack traces, no internal details exposed.
 */
const errorHandler = (err, req, res, next) => {
  // Mongoose duplicate key error (e.g. unique email/mobile)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const fieldLabel = field === "email" ? "email address" : field === "mobile" ? "mobile number" : field;
    return res.status(409).json({
      success: false,
      message: `An account with this ${fieldLabel} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: messages[0] || "Validation failed.",
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token has expired." });
  }

  // Multer errors (file size limit, unexpected field, etc.)
  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size exceeds the 5MB limit. Please choose a smaller image.",
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error.",
    });
  }

  // Operational errors (thrown intentionally via AppError)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unexpected / programming errors — don't leak details in production
  if (NODE_ENV === "production") {
    console.error("UNEXPECTED ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }

  // Development: include stack for debugging
  console.error(err);
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
};

module.exports = errorHandler;

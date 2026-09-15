/**
 * Custom application error class.
 * Allows controllers to throw structured errors that the
 * centralized error handler can convert into clean API responses.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Distinguishes our errors from unexpected crashes
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

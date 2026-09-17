const { verifyAuthToken } = require("../utils/jwt");
const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * authenticateUser middleware.
 * Reads the auth JWT from HTTP-only cookie, verifies it,
 * fetches the user from DB, and attaches to req.user.
 *
 * Rejects with 401 if:
 * - No cookie present
 * - Token is invalid or expired
 * - User not found in DB
 * - User is inactive
 */
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;

    if (!token) {
      return next(new AppError("Authentication required. Please log in.", 401));
    }

    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.userId).select("-__v");

    if (!user) {
      return next(new AppError("User not found. Please log in again.", 401));
    }

    if (user.status === "inactive") {
      return next(
        new AppError(
          "Your account is currently inactive. Please contact the administrator.",
          403
        )
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err); // JWT errors handled by centralized error handler
  }
};

/**
 * optionalAuthenticateUser middleware.
 * Like authenticateUser, but doesn't throw 401 if not authenticated.
 * Attaches req.user = null instead.
 */
const optionalAuthenticateUser = async (req, res, next) => {
  try {
    const token = req.cookies?.authToken;
    if (!token) {
      req.user = null;
      return next();
    }
    
    const payload = verifyAuthToken(token);
    const user = await User.findById(payload.userId).select("-__v");
    
    if (!user || user.status === "inactive") {
      req.user = null;
      return next();
    }
    
    req.user = user;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

module.exports = { authenticateUser, optionalAuthenticateUser };

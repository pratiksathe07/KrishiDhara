const AppError = require("../utils/AppError");

/**
 * authorizeRoles middleware factory.
 * Must be used AFTER authenticateUser.
 *
 * Example usage:
 *   router.get('/farmer-only', authenticateUser, authorizeRoles('farmer'), handler)
 *   router.get('/multi', authenticateUser, authorizeRoles('farmer', 'dealer'), handler)
 *
 * Returns 403 Forbidden if the authenticated user's role is not in the allowed list.
 *
 * @param {...string} roles - Allowed roles for this route
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Authentication required.", 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          "You do not have permission to access this resource.",
          403
        )
      );
    }

    next();
  };
};

module.exports = { authorizeRoles };

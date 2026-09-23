const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * @desc    Get dashboard statistics
 * @route   GET /api/admin/stats
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [farmersCount, laboursCount, dealersCount, activeUsersCount] = await Promise.all([
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "labour" }),
      User.countDocuments({ role: "dealer" }),
      User.countDocuments({ status: "active" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        farmers: farmersCount,
        labours: laboursCount,
        dealers: dealersCount,
        activeUsers: activeUsersCount,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all users with optional filtering
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { role, status, search } = req.query;
    
    let filter = {};
    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { mobile: { $regex: search, $options: "i" } },
      ];
    }

    const users = await User.find(filter)
      .select("-password") // Ensure we don't send passwords if they exist
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      data: { users },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update user status
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!["active", "inactive"].includes(status)) {
      return next(new AppError("Invalid status. Must be active or inactive.", 400));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: `User status updated to ${status}`,
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return next(new AppError("User not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "User successfully deleted.",
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
};

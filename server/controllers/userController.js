const path = require("path");
const fs = require("fs");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const { ALLOWED_SKILLS } = require("../constants/labourSkills");
const { ALLOWED_PRODUCTS } = require("../constants/dealerProducts");

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

module.exports = {
  getLabours,
  getDealers,
  updateProfilePicture,
  deleteProfilePicture,
};

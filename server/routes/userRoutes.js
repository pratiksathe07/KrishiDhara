const express = require("express");
const {
  getLabours,
  getDealers,
  updateProfilePicture,
  deleteProfilePicture,
} = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authenticate");
const { uploadAvatar } = require("../middleware/uploadMiddleware");

const router = express.Router();

// GET /api/users/labours?skills=Plowing,Harvesting
// Returns all registered labour users with their profiles.
// Requires authentication (farmer must be logged in).
router.get("/labours", authenticateUser, getLabours);

// GET /api/users/dealers?products=Wheat,Rice / Paddy
// Returns all registered dealer users with their profiles.
router.get("/dealers", authenticateUser, getDealers);

// PUT /api/users/profile-picture
// Upload or update profile picture for the logged-in user.
router.put(
  "/profile-picture",
  authenticateUser,
  uploadAvatar.single("profilePicture"),
  updateProfilePicture
);

// DELETE /api/users/profile-picture
// Remove profile picture for the logged-in user.
router.delete("/profile-picture", authenticateUser, deleteProfilePicture);

module.exports = router;

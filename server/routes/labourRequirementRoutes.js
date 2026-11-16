const express = require("express");
const {
  createRequirement,
  getMyRequirements,
  getAllRequirements,
  getRequirementById,
  updateRequirement,
  updateRequirementStatus,
  deleteRequirement,
} = require("../controllers/labourRequirementController");
const { authenticateUser } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorize");

const router = express.Router();

// ─── Public / Marketplace view (Any authenticated user) ─────────────────────
// Labourers, farmers, dealers, and admins can view active labour requirements
router.get("/", authenticateUser, getAllRequirements);

// ─── Farmer-specific management ─────────────────────────────────────────────
// Get requirements created by the logged-in farmer (or admin testing)
router.get("/my", authenticateUser, authorizeRoles("farmer", "admin"), getMyRequirements);

// Get single requirement by ID
router.get("/:id", authenticateUser, getRequirementById);

// Create a new labour requirement
router.post("/", authenticateUser, authorizeRoles("farmer", "admin"), createRequirement);

// Update a requirement
router.put("/:id", authenticateUser, authorizeRoles("farmer", "admin"), updateRequirement);

// Update status (active, completed, cancelled)
router.patch("/:id/status", authenticateUser, authorizeRoles("farmer", "admin"), updateRequirementStatus);

// Delete a requirement
router.delete("/:id", authenticateUser, authorizeRoles("farmer", "admin"), deleteRequirement);

module.exports = router;

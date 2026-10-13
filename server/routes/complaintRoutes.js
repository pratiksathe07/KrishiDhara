const express = require("express");
const {
  createComplaint,
  getAllComplaints,
  getComplaintStats,
  updateComplaint,
} = require("../controllers/complaintController");
const { authenticateUser, authorizeRoles } = require("../middleware/authenticate");

const router = express.Router();

// ─── POST /api/complaints ──────────────────────────────────────────────────
// Any logged-in user can file a complaint or report
router.post("/", authenticateUser, createComplaint);

// ─── GET /api/complaints/stats ─────────────────────────────────────────────
// Admin only: Summary statistics for complaints
router.get("/stats", authenticateUser, authorizeRoles("admin"), getComplaintStats);

// ─── GET /api/complaints ───────────────────────────────────────────────────
// Admin only: List all complaints with filters and search
router.get("/", authenticateUser, authorizeRoles("admin"), getAllComplaints);

// ─── PATCH /api/complaints/:id ─────────────────────────────────────────────
// Admin only: Update status, priority, and admin notes
router.patch("/:id", authenticateUser, authorizeRoles("admin"), updateComplaint);

module.exports = router;

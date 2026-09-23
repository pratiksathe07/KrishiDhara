const express = require("express");
const { 
  getDashboardStats, 
  getAllUsers, 
  updateUserStatus, 
  deleteUser 
} = require("../controllers/adminController");
const { authenticateUser, authorizeRoles } = require("../middleware/authenticate");

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateUser, authorizeRoles("admin"));

// GET /api/admin/stats
router.get("/stats", getDashboardStats);

// GET /api/admin/users
router.get("/users", getAllUsers);

// PATCH /api/admin/users/:id/status
router.patch("/users/:id/status", updateUserStatus);

// DELETE /api/admin/users/:id
router.delete("/users/:id", deleteUser);

module.exports = router;

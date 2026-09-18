const express = require("express");
const { getLabours, getDealers } = require("../controllers/userController");
const { authenticateUser } = require("../middleware/authenticate");

const router = express.Router();

// GET /api/users/labours?skills=Plowing,Harvesting
// Returns all registered labour users with their profiles.
// Requires authentication (farmer must be logged in).
router.get("/labours", authenticateUser, getLabours);

// GET /api/users/dealers?products=Wheat,Rice / Paddy
// Returns all registered dealer users with their profiles.
router.get("/dealers", authenticateUser, getDealers);

module.exports = router;

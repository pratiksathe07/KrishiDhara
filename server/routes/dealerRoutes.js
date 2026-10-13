const express = require("express");
const {
  getRequirements,
  getActiveDealerRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
} = require("../controllers/dealerController");
const { authenticateUser } = require("../middleware/authenticate");
const { authorizeRoles } = require("../middleware/authorize");

const router = express.Router();

// ─── Requirements Discovery (Farmers & Authenticated Users) ────────────────
// Accessible to any authenticated user (farmer, dealer, admin)
router.get("/active-requirements", authenticateUser, getActiveDealerRequirements);
router.get("/public-requirements", authenticateUser, getActiveDealerRequirements);

// GET /api/dealer/requirements
// If dealer -> returns dealer's own requirements with slot limits and registered crops
// If non-dealer (e.g. farmer) -> returns active requirements with dealer display info
router.get("/requirements", authenticateUser, (req, res, next) => {
  if (req.user.role === "dealer") {
    return getRequirements(req, res, next);
  }
  return getActiveDealerRequirements(req, res, next);
});

// ─── Dealer Management (Dealer Only) ───────────────────────────────────────
// Creating, modifying, or deleting requirements strictly requires the dealer role
router.post("/requirements", authenticateUser, authorizeRoles("dealer"), createRequirement);
router.put("/requirements/:id", authenticateUser, authorizeRoles("dealer"), updateRequirement);
router.delete("/requirements/:id", authenticateUser, authorizeRoles("dealer"), deleteRequirement);

module.exports = router;


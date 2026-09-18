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
        "firstName lastName mobile address labourProfile createdAt"
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
      .select("firstName lastName mobile address dealerProfile createdAt")
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

module.exports = { getLabours, getDealers };

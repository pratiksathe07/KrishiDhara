const PurchaseRequirement = require("../models/PurchaseRequirement");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const VALID_QUANTITY_UNITS = ["Ton", "Quintal", "Kilogram (kg)"];
const VALID_PRICE_UNITS = ["Per ton", "Per quintal", "Per kg"];

/**
 * GET /api/dealer/requirements
 * Get all active purchase requirements for the authenticated dealer,
 * along with their registered crops and slot limit status.
 */
const getRequirements = async (req, res, next) => {
  try {
    const dealerId = req.user._id;

    // Fetch the freshest user data to ensure registered crops are accurate
    const dealer = await User.findById(dealerId).select("firstName lastName email mobile address dealerProfile");
    const registeredCrops = dealer?.dealerProfile?.products || [];

    const requirements = await PurchaseRequirement.find({
      dealerId,
      status: "active",
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: {
        requirements,
        count: requirements.length,
        maxAllowed: 3,
        canAddMore: requirements.length < 3,
        registeredCrops,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/dealer/requirements
 * Create a new purchase requirement for one of the dealer's registered crops.
 * Backend strictly enforces:
 *  1. Authenticated user is a dealer.
 *  2. Crop must be present in the dealer's registered crops list (dealerProfile.products).
 *  3. Maximum of 3 active requirements per dealer.
 *  4. No duplicate active requirement for the same crop.
 *  5. Valid quantities and price values.
 */
const createRequirement = async (req, res, next) => {
  try {
    const dealerId = req.user._id;
    const {
      crop,
      quantity,
      quantityUnit,
      expectedPrice,
      priceUnit,
      deliveryLocation,
      qualityGrade,
      notes,
    } = req.body;

    // 1. Fetch user to verify registered crops
    const dealer = await User.findById(dealerId);
    if (!dealer || dealer.role !== "dealer") {
      return next(new AppError("Only registered dealers can create purchase requirements.", 403));
    }

    const registeredCrops = dealer.dealerProfile?.products || [];
    if (!crop || typeof crop !== "string" || !registeredCrops.includes(crop.trim())) {
      return next(
        new AppError(
          `Crop "${crop}" is not in your registered crops. You can only configure requirements for crops selected during registration.`,
          400
        )
      );
    }
    const cleanCrop = crop.trim();

    // 2. Enforce 3 active requirements limit
    const activeCount = await PurchaseRequirement.countDocuments({
      dealerId,
      status: "active",
    });

    if (activeCount >= 3) {
      return next(
        new AppError(
          "Maximum limit of 3 active crop purchase requirements reached. Please edit or delete an existing requirement.",
          400
        )
      );
    }

    // 3. Prevent duplicate active requirement for the same crop
    const existing = await PurchaseRequirement.findOne({
      dealerId,
      crop: cleanCrop,
      status: "active",
    });

    if (existing) {
      return next(
        new AppError(
          `An active purchase requirement for "${cleanCrop}" already exists. You can edit your existing requirement.`,
          400
        )
      );
    }

    // 4. Validate quantity and unit
    const numQty = Number(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      return next(new AppError("Required quantity must be a positive number.", 400));
    }
    if (!VALID_QUANTITY_UNITS.includes(quantityUnit)) {
      return next(
        new AppError(
          `Quantity unit must be one of: ${VALID_QUANTITY_UNITS.join(", ")}.`,
          400
        )
      );
    }

    // 5. Validate price and unit
    const numPrice = Number(expectedPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      return next(new AppError("Expected purchase price must be a positive number.", 400));
    }
    if (!VALID_PRICE_UNITS.includes(priceUnit)) {
      return next(
        new AppError(
          `Price unit must be one of: ${VALID_PRICE_UNITS.join(", ")}.`,
          400
        )
      );
    }

    // 6. Create document
    const requirement = await PurchaseRequirement.create({
      dealerId,
      crop: cleanCrop,
      quantity: numQty,
      quantityUnit,
      expectedPrice: numPrice,
      priceUnit,
      deliveryLocation: typeof deliveryLocation === "string" ? deliveryLocation.trim() : "",
      qualityGrade: typeof qualityGrade === "string" ? qualityGrade.trim() : "",
      notes: typeof notes === "string" ? notes.trim() : "",
      status: "active",
    });

    return res.status(201).json({
      success: true,
      message: `Purchase requirement for ${cleanCrop} created successfully.`,
      data: { requirement },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/dealer/requirements/:id
 * Update an existing purchase requirement.
 * Only the owner dealer can update it.
 */
const updateRequirement = async (req, res, next) => {
  try {
    const dealerId = req.user._id;
    const { id } = req.params;
    const {
      quantity,
      quantityUnit,
      expectedPrice,
      priceUnit,
      deliveryLocation,
      qualityGrade,
      notes,
      status,
    } = req.body;

    const requirement = await PurchaseRequirement.findOne({
      _id: id,
      dealerId,
    });

    if (!requirement) {
      return next(
        new AppError(
          "Purchase requirement not found or you are not authorized to modify it.",
          404
        )
      );
    }

    // Validate quantity if provided
    if (quantity !== undefined) {
      const numQty = Number(quantity);
      if (isNaN(numQty) || numQty <= 0) {
        return next(new AppError("Required quantity must be a positive number.", 400));
      }
      requirement.quantity = numQty;
    }

    if (quantityUnit !== undefined) {
      if (!VALID_QUANTITY_UNITS.includes(quantityUnit)) {
        return next(
          new AppError(
            `Quantity unit must be one of: ${VALID_QUANTITY_UNITS.join(", ")}.`,
            400
          )
        );
      }
      requirement.quantityUnit = quantityUnit;
    }

    // Validate expected price if provided
    if (expectedPrice !== undefined) {
      const numPrice = Number(expectedPrice);
      if (isNaN(numPrice) || numPrice <= 0) {
        return next(new AppError("Expected purchase price must be a positive number.", 400));
      }
      requirement.expectedPrice = numPrice;
    }

    if (priceUnit !== undefined) {
      if (!VALID_PRICE_UNITS.includes(priceUnit)) {
        return next(
          new AppError(
            `Price unit must be one of: ${VALID_PRICE_UNITS.join(", ")}.`,
            400
          )
        );
      }
      requirement.priceUnit = priceUnit;
    }

    if (status !== undefined) {
      if (!["active", "inactive"].includes(status)) {
        return next(new AppError("Status must be either active or inactive.", 400));
      }
      if (status === "active" && requirement.status !== "active") {
        const activeCount = await PurchaseRequirement.countDocuments({
          dealerId,
          status: "active",
        });
        if (activeCount >= 3) {
          return next(
            new AppError(
              "Maximum limit of 3 active crop purchase requirements reached.",
              400
            )
          );
        }
      }
      requirement.status = status;
    }

    if (deliveryLocation !== undefined) {
      requirement.deliveryLocation = typeof deliveryLocation === "string" ? deliveryLocation.trim() : "";
    }

    if (qualityGrade !== undefined) {
      requirement.qualityGrade = typeof qualityGrade === "string" ? qualityGrade.trim() : "";
    }

    if (notes !== undefined) {
      requirement.notes = typeof notes === "string" ? notes.trim() : "";
    }

    await requirement.save();

    return res.status(200).json({
      success: true,
      message: `Purchase requirement for ${requirement.crop} updated successfully.`,
      data: { requirement },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/dealer/active-requirements
 * GET /api/dealer/public-requirements
 * Returns all active purchase requirements posted by active dealers,
 * populated with public dealer information.
 * Supports filtering by crop, quantityUnit, location/deliveryLocation, and text search.
 * Accessible to authenticated users (farmers, dealers, admin).
 */
const getActiveDealerRequirements = async (req, res, next) => {
  try {
    const { crop, quantityUnit, location, deliveryLocation, search } = req.query;

    const query = { status: "active" };

    if (crop && typeof crop === "string" && crop.trim()) {
      query.crop = crop.trim();
    }

    if (quantityUnit && typeof quantityUnit === "string" && quantityUnit.trim()) {
      query.quantityUnit = quantityUnit.trim();
    }

    const locFilter = (location || deliveryLocation || "").trim();
    if (locFilter) {
      query.deliveryLocation = { $regex: locFilter, $options: "i" };
    }

    // Fetch requirements with dealer info
    let requirements = await PurchaseRequirement.find(query)
      .populate({
        path: "dealerId",
        select: "firstName lastName email mobile address dealerProfile profilePicture status",
      })
      .sort({ createdAt: -1 })
      .lean();

    // Only include requirements where dealer exists and is active
    requirements = requirements.filter(
      (r) => r.dealerId && r.dealerId.status === "active"
    );

    // Apply search filter if provided
    if (search && typeof search === "string" && search.trim()) {
      const q = search.trim().toLowerCase();
      requirements = requirements.filter((r) => {
        const dealerName = `${r.dealerId?.firstName || ""} ${r.dealerId?.lastName || ""}`.toLowerCase();
        const cropMatch = r.crop?.toLowerCase().includes(q);
        const nameMatch = dealerName.includes(q);
        const locMatch = r.deliveryLocation?.toLowerCase().includes(q);
        const gradeMatch = r.qualityGrade?.toLowerCase().includes(q);
        const notesMatch = r.notes?.toLowerCase().includes(q);
        return cropMatch || nameMatch || locMatch || gradeMatch || notesMatch;
      });
    }

    // Format response ensuring no sensitive fields are present and both dealer / dealerId are convenient
    const formatted = requirements.map((r) => {
      const dealerObj = {
        _id: r.dealerId._id,
        firstName: r.dealerId.firstName,
        lastName: r.dealerId.lastName,
        name: `${r.dealerId.firstName} ${r.dealerId.lastName}`.trim(),
        email: r.dealerId.email,
        mobile: r.dealerId.mobile,
        address: r.dealerId.address || "",
        profilePicture: r.dealerId.profilePicture || "",
        registeredCrops: r.dealerId.dealerProfile?.products || [],
      };

      return {
        _id: r._id,
        crop: r.crop,
        quantity: r.quantity,
        quantityUnit: r.quantityUnit,
        expectedPrice: r.expectedPrice,
        priceUnit: r.priceUnit,
        deliveryLocation: r.deliveryLocation || "",
        qualityGrade: r.qualityGrade || "",
        notes: r.notes || "",
        status: r.status,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
        dealerId: r.dealerId._id,
        dealer: dealerObj,
      };
    });

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: {
        requirements: formatted,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/dealer/requirements/:id
 * Delete a purchase requirement, freeing up a slot.
 * Only the owner dealer can delete it.
 */
const deleteRequirement = async (req, res, next) => {
  try {
    const dealerId = req.user._id;
    const { id } = req.params;

    const requirement = await PurchaseRequirement.findOne({
      _id: id,
      dealerId,
    });

    if (!requirement) {
      return next(
        new AppError(
          "Purchase requirement not found or you are not authorized to delete it.",
          404
        )
      );
    }

    const cropName = requirement.crop;
    await PurchaseRequirement.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: `Purchase requirement for ${cropName} deleted successfully. A requirement slot has been freed.`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getRequirements,
  getActiveDealerRequirements,
  createRequirement,
  updateRequirement,
  deleteRequirement,
};

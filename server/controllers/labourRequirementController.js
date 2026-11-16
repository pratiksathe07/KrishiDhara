const mongoose = require("mongoose");
const LabourRequirement = require("../models/LabourRequirement");
const User = require("../models/User");
const AppError = require("../utils/AppError");

/**
 * @desc    Create a new labour requirement (Farmer or Admin)
 * @route   POST /api/labour-requirements
 * @access  Private (Farmer, Admin)
 */
const createRequirement = async (req, res, next) => {
  try {
    const farmerId = req.user._id;

    // Verify user is a farmer or admin
    if (req.user.role !== "farmer" && req.user.role !== "admin") {
      return next(new AppError("Only farmers can post labour requirements.", 403));
    }

    const {
      title,
      workType,
      laboursNeeded,
      wagePerDay,
      wageUnit,
      startDate,
      durationDays,
      location,
      description,
      urgency,
    } = req.body;

    const resolvedWorkType = (workType && workType.trim()) || "Harvesting";
    const parsedLabours = parseInt(laboursNeeded, 10);
    const resolvedLabours = isNaN(parsedLabours) || parsedLabours < 1 ? 1 : parsedLabours;
    const resolvedTitle =
      title && title.trim()
        ? title.trim()
        : `${resolvedWorkType} - ${resolvedLabours} Labour${resolvedLabours > 1 ? "s" : ""} Needed`;

    const parsedWage = parseFloat(wagePerDay);
    const resolvedWage = isNaN(parsedWage) || parsedWage <= 0 ? 400 : parsedWage;

    let parsedStartDate = startDate ? new Date(startDate) : new Date();
    if (isNaN(parsedStartDate.getTime())) {
      parsedStartDate = new Date();
    }

    const parsedDuration = durationDays ? parseInt(durationDays, 10) : 1;
    const resolvedDuration = isNaN(parsedDuration) || parsedDuration < 1 ? 1 : parsedDuration;

    // Resolve location: use provided location or fall back to farmer's profile
    const farmer = await User.findById(farmerId).select("farmerProfile firstName lastName mobile");
    const farmerLoc = farmer?.farmerProfile || {};

    const resolvedLocation = {
      state: location?.state?.trim() || farmerLoc.state || "",
      district: location?.district?.trim() || farmerLoc.district || "",
      taluka: location?.taluka?.trim() || farmerLoc.taluka || "",
      village: location?.village?.trim() || farmerLoc.village || "",
      gatNo: location?.gatNo?.trim() || farmerLoc.gatNo || "",
      landmark: location?.landmark?.trim() || "",
    };

    const resolvedDescription =
      description && description.trim()
        ? description.trim()
        : `Need ${resolvedLabours} labour${resolvedLabours > 1 ? "s" : ""} for ${resolvedWorkType} work. Daily wage: ₹${resolvedWage}.`;

    const newRequirement = await LabourRequirement.create({
      farmerId,
      title: resolvedTitle,
      workType: resolvedWorkType,
      laboursNeeded: resolvedLabours,
      wagePerDay: resolvedWage,
      wageUnit: wageUnit?.trim() || "Per day",
      startDate: parsedStartDate,
      durationDays: resolvedDuration,
      location: resolvedLocation,
      description: resolvedDescription,
      urgency: urgency === "urgent" ? "urgent" : "normal",
      status: "active",
    });

    const populated = await LabourRequirement.findById(newRequirement._id).populate(
      "farmerId",
      "firstName lastName mobile email farmerProfile profilePicture"
    );

    return res.status(201).json({
      success: true,
      message: "Labour requirement posted successfully.",
      data: { requirement: populated },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all labour requirements posted by the logged-in farmer
 * @route   GET /api/labour-requirements/my
 * @access  Private (Farmer, Admin)
 */
const getMyRequirements = async (req, res, next) => {
  try {
    const farmerId = req.user._id;
    const { status } = req.query;

    const filter = { farmerId };
    if (status && ["active", "completed", "cancelled"].includes(status)) {
      filter.status = status;
    }

    const requirements = await LabourRequirement.find(filter)
      .sort({ createdAt: -1 })
      .populate("farmerId", "firstName lastName mobile email farmerProfile profilePicture");

    const totalCount = await LabourRequirement.countDocuments({ farmerId });
    const activeCount = await LabourRequirement.countDocuments({ farmerId, status: "active" });
    const completedCount = await LabourRequirement.countDocuments({ farmerId, status: "completed" });

    return res.status(200).json({
      success: true,
      data: {
        requirements,
        stats: {
          total: totalCount,
          active: activeCount,
          completed: completedCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all active labour requirements (Marketplace / Public for authenticated users)
 * @route   GET /api/labour-requirements
 * @access  Private (Authenticated users: Labours, Farmers, Dealers, Admins)
 */
const getAllRequirements = async (req, res, next) => {
  try {
    const { workType, district, status = "active", search, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (status && ["active", "completed", "cancelled", "all"].includes(status)) {
      if (status !== "all") {
        filter.status = status;
      }
    } else {
      filter.status = "active";
    }

    if (workType && workType !== "All") {
      filter.workType = { $regex: new RegExp(`^${workType}$`, "i") };
    }

    if (district && district !== "All") {
      filter["location.district"] = { $regex: new RegExp(`^${district}$`, "i") };
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { workType: { $regex: q, $options: "i" } },
        { "location.village": { $regex: q, $options: "i" } },
        { "location.taluka": { $regex: q, $options: "i" } },
        { "location.district": { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [requirements, total] = await Promise.all([
      LabourRequirement.find(filter)
        .sort({ urgency: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate("farmerId", "firstName lastName mobile email farmerProfile profilePicture"),
      LabourRequirement.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        requirements,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get requirement by ID
 * @route   GET /api/labour-requirements/:id
 * @access  Private
 */
const getRequirementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid requirement ID format.", 400));
    }

    const requirement = await LabourRequirement.findById(id).populate(
      "farmerId",
      "firstName lastName mobile email farmerProfile profilePicture"
    );

    if (!requirement) {
      return next(new AppError("Labour requirement not found.", 404));
    }

    return res.status(200).json({
      success: true,
      data: { requirement },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update a labour requirement (Owner farmer or Admin)
 * @route   PUT /api/labour-requirements/:id
 * @access  Private (Farmer, Admin)
 */
const updateRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid requirement ID.", 400));
    }

    const requirement = await LabourRequirement.findById(id);
    if (!requirement) {
      return next(new AppError("Labour requirement not found.", 404));
    }

    // Check ownership
    if (requirement.farmerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new AppError("You do not have permission to edit this requirement.", 403));
    }

    const {
      title,
      workType,
      laboursNeeded,
      wagePerDay,
      wageUnit,
      startDate,
      durationDays,
      location,
      description,
      urgency,
      status,
    } = req.body;

    if (title && title.trim()) requirement.title = title.trim();
    if (workType && workType.trim()) requirement.workType = workType.trim();
    if (laboursNeeded !== undefined) {
      const num = parseInt(laboursNeeded, 10);
      if (!isNaN(num) && num >= 1) requirement.laboursNeeded = num;
    }
    if (wagePerDay !== undefined) {
      const wage = parseFloat(wagePerDay);
      if (!isNaN(wage) && wage > 0) requirement.wagePerDay = wage;
    }
    if (wageUnit) requirement.wageUnit = wageUnit.trim();
    if (startDate) {
      const date = new Date(startDate);
      if (!isNaN(date.getTime())) requirement.startDate = date;
    }
    if (durationDays !== undefined) {
      const dur = parseInt(durationDays, 10);
      if (!isNaN(dur) && dur >= 1) requirement.durationDays = dur;
    }
    if (location) {
      requirement.location = {
        state: location.state !== undefined ? location.state.trim() : requirement.location.state,
        district: location.district !== undefined ? location.district.trim() : requirement.location.district,
        taluka: location.taluka !== undefined ? location.taluka.trim() : requirement.location.taluka,
        village: location.village !== undefined ? location.village.trim() : requirement.location.village,
        gatNo: location.gatNo !== undefined ? location.gatNo.trim() : requirement.location.gatNo,
        landmark: location.landmark !== undefined ? location.landmark.trim() : requirement.location.landmark,
      };
    }
    if (description !== undefined) requirement.description = description.trim();
    if (urgency && ["normal", "urgent"].includes(urgency)) requirement.urgency = urgency;
    if (status && ["active", "completed", "cancelled"].includes(status)) requirement.status = status;

    await requirement.save();

    const updated = await LabourRequirement.findById(requirement._id).populate(
      "farmerId",
      "firstName lastName mobile email farmerProfile profilePicture"
    );

    return res.status(200).json({
      success: true,
      message: "Labour requirement updated successfully.",
      data: { requirement: updated },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Toggle or set requirement status (active, completed, cancelled)
 * @route   PATCH /api/labour-requirements/:id/status
 * @access  Private (Farmer, Admin)
 */
const updateRequirementStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid requirement ID.", 400));
    }

    if (!status || !["active", "completed", "cancelled"].includes(status)) {
      return next(new AppError("Valid status (active, completed, or cancelled) is required.", 400));
    }

    const requirement = await LabourRequirement.findById(id);
    if (!requirement) {
      return next(new AppError("Labour requirement not found.", 404));
    }

    if (requirement.farmerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new AppError("You do not have permission to change this requirement's status.", 403));
    }

    requirement.status = status;
    await requirement.save();

    return res.status(200).json({
      success: true,
      message: `Labour requirement marked as ${status}.`,
      data: { requirement },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a labour requirement
 * @route   DELETE /api/labour-requirements/:id
 * @access  Private (Farmer, Admin)
 */
const deleteRequirement = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid requirement ID.", 400));
    }

    const requirement = await LabourRequirement.findById(id);
    if (!requirement) {
      return next(new AppError("Labour requirement not found.", 404));
    }

    if (requirement.farmerId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return next(new AppError("You do not have permission to delete this requirement.", 403));
    }

    await LabourRequirement.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Labour requirement deleted successfully.",
      data: { id },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createRequirement,
  getMyRequirements,
  getAllRequirements,
  getRequirementById,
  updateRequirement,
  updateRequirementStatus,
  deleteRequirement,
};

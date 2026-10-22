const mongoose = require("mongoose");
const Complaint = require("../models/Complaint");
const AppError = require("../utils/AppError");

/**
 * @desc    Create a new complaint or report
 * @route   POST /api/complaints
 * @access  Private (Any authenticated user)
 */
const createComplaint = async (req, res, next) => {
  try {
    const { type, category, subject, description, againstUser, priority } = req.body;

    if (!subject || !subject.trim()) {
      return next(new AppError("Subject is required.", 400));
    }

    if (!description || !description.trim()) {
      return next(new AppError("Description is required.", 400));
    }

    if (!category) {
      return next(new AppError("Category is required.", 400));
    }

    let validAgainstUser = null;
    if (againstUser) {
      if (!mongoose.Types.ObjectId.isValid(againstUser)) {
        return next(new AppError("Invalid againstUser ID.", 400));
      }
      validAgainstUser = againstUser;
    }

    const complaint = await Complaint.create({
      type: type || "complaint",
      category,
      subject: subject.trim(),
      description: description.trim(),
      raisedBy: req.user._id,
      againstUser: validAgainstUser,
      priority: priority || "medium",
    });

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("raisedBy", "firstName lastName role mobile email")
      .populate("againstUser", "firstName lastName role mobile email");

    res.status(201).json({
      success: true,
      message: "Complaint submitted successfully.",
      data: { complaint: populatedComplaint },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all complaints/reports with filters & search
 * @route   GET /api/complaints
 * @access  Private (Admin only)
 */
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, type, priority, search } = req.query;

    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (type && type !== "all") {
      filter.type = type;
    }

    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    if (search && search.trim()) {
      filter.subject = { $regex: search.trim(), $options: "i" };
    }

    const complaints = await Complaint.find(filter)
      .populate("raisedBy", "firstName lastName role mobile email")
      .populate("againstUser", "firstName lastName role mobile email")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: { complaints },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get complaint counts / statistics for admin dashboard
 * @route   GET /api/complaints/stats
 * @access  Private (Admin only)
 */
const getComplaintStats = async (req, res, next) => {
  try {
    const [total, open, inReview, resolved, rejected] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "open" }),
      Complaint.countDocuments({ status: "in_review" }),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({ status: "rejected" }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        total,
        open,
        inReview,
        resolved,
        rejected,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Update complaint status, priority, and admin note
 * @route   PATCH /api/complaints/:id
 * @access  Private (Admin only)
 */
const updateComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority, adminNote } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid complaint ID.", 400));
    }

    const existing = await Complaint.findById(id);
    if (!existing) {
      return next(new AppError("Complaint not found.", 404));
    }

    const updateFields = {};

    if (status) {
      const validStatuses = ["open", "in_review", "resolved", "rejected"];
      if (!validStatuses.includes(status)) {
        return next(
          new AppError(
            `Invalid status. Allowed values: ${validStatuses.join(", ")}`,
            400
          )
        );
      }
      updateFields.status = status;

      if (status === "resolved") {
        updateFields.resolvedAt = new Date();
      } else {
        updateFields.resolvedAt = null;
      }
    }

    if (priority) {
      const validPriorities = ["low", "medium", "high"];
      if (!validPriorities.includes(priority)) {
        return next(
          new AppError(
            `Invalid priority. Allowed values: ${validPriorities.join(", ")}`,
            400
          )
        );
      }
      updateFields.priority = priority;
    }

    if (adminNote !== undefined) {
      updateFields.adminNote = adminNote.trim();
    }

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate("raisedBy", "firstName lastName role mobile email")
      .populate("againstUser", "firstName lastName role mobile email");

    res.status(200).json({
      success: true,
      message: "Complaint updated successfully.",
      data: { complaint: updatedComplaint },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete an individual complaint or report
 * @route   DELETE /api/complaints/:id
 * @access  Private (Admin only)
 */
const deleteComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError("Invalid complaint ID.", 400));
    }

    const complaint = await Complaint.findByIdAndDelete(id);
    if (!complaint) {
      return next(new AppError("Complaint not found.", 404));
    }

    res.status(200).json({
      success: true,
      message: "Complaint deleted successfully.",
      data: { id: complaint._id },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  getComplaintStats,
  updateComplaint,
  deleteComplaint,
};

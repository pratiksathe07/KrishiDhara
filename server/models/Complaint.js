const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: {
        values: ["complaint", "report"],
        message: "Type must be either complaint or report.",
      },
      default: "complaint",
      required: [true, "Type is required."],
    },
    category: {
      type: String,
      enum: {
        values: ["fraud", "payment", "behavior", "quality", "app_issue", "other"],
        message: "Category must be one of: fraud, payment, behavior, quality, app_issue, other.",
      },
      required: [true, "Category is required."],
    },
    subject: {
      type: String,
      required: [true, "Subject is required."],
      trim: true,
      maxlength: [150, "Subject cannot exceed 150 characters."],
    },
    description: {
      type: String,
      required: [true, "Description is required."],
      trim: true,
      maxlength: [3000, "Description cannot exceed 3000 characters."],
    },
    raisedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User raising the complaint/report is required."],
    },
    againstUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: ["open", "in_review", "resolved", "rejected"],
        message: "Status must be one of: open, in_review, resolved, rejected.",
      },
      default: "open",
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high"],
        message: "Priority must be one of: low, medium, high.",
      },
      default: "medium",
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: [1000, "Admin note cannot exceed 1000 characters."],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for optimal query performance on dashboard filtering
complaintSchema.index({ status: 1 });
complaintSchema.index({ type: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ createdAt: -1 });

const Complaint = mongoose.model("Complaint", complaintSchema);

module.exports = Complaint;

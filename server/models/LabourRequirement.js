const mongoose = require("mongoose");
const { ALLOWED_SKILLS } = require("../constants/labourSkills");

const labourRequirementSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Farmer ID is required."],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Work title is required."],
      trim: true,
      maxlength: [120, "Work title cannot exceed 120 characters."],
    },
    workType: {
      type: String,
      required: [true, "Work category or skill is required."],
      trim: true,
      maxlength: [100, "Work category cannot exceed 100 characters."],
    },
    laboursNeeded: {
      type: Number,
      required: [true, "Number of labours needed is required."],
      min: [1, "At least 1 labour must be requested."],
      max: [500, "Cannot request more than 500 labours per post."],
      validate: {
        validator: Number.isInteger,
        message: "Number of labours must be an integer.",
      },
    },
    wagePerDay: {
      type: Number,
      required: [true, "Wage per day is required."],
      min: [1, "Wage per day must be greater than zero."],
    },
    wageUnit: {
      type: String,
      default: "Per day",
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Work start date is required."],
    },
    durationDays: {
      type: Number,
      default: 1,
      min: [1, "Duration must be at least 1 day."],
      max: [365, "Duration cannot exceed 365 days."],
      validate: {
        validator: Number.isInteger,
        message: "Duration must be an integer number of days.",
      },
    },
    location: {
      state: { type: String, trim: true, default: "" },
      district: { type: String, trim: true, default: "" },
      taluka: { type: String, trim: true, default: "" },
      village: { type: String, trim: true, default: "" },
      gatNo: { type: String, trim: true, default: "" },
      landmark: { type: String, trim: true, default: "" },
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters."],
      default: "",
    },
    urgency: {
      type: String,
      enum: {
        values: ["normal", "urgent"],
        message: "Urgency must be either normal or urgent.",
      },
      default: "normal",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "completed", "cancelled"],
        message: "Status must be active, completed, or cancelled.",
      },
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying a farmer's requirements by status
labourRequirementSchema.index({ farmerId: 1, status: 1 });
// Compound index for filtering active requirements by work type and location
labourRequirementSchema.index({ status: 1, workType: 1, "location.district": 1, createdAt: -1 });

const LabourRequirement = mongoose.model(
  "LabourRequirement",
  labourRequirementSchema
);

module.exports = LabourRequirement;

const mongoose = require("mongoose");

const purchaseRequirementSchema = new mongoose.Schema(
  {
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Dealer ID is required."],
      index: true,
    },
    crop: {
      type: String,
      required: [true, "Crop name is required."],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Required quantity is required."],
      min: [0.01, "Quantity must be greater than zero."],
    },
    quantityUnit: {
      type: String,
      required: [true, "Quantity unit is required."],
      enum: {
        values: ["Ton", "Quintal", "Kilogram (kg)"],
        message: "Quantity unit must be Ton, Quintal, or Kilogram (kg).",
      },
    },
    expectedPrice: {
      type: Number,
      required: [true, "Expected purchase price is required."],
      min: [0.01, "Expected price must be greater than zero."],
    },
    priceUnit: {
      type: String,
      required: [true, "Price unit is required."],
      enum: {
        values: ["Per ton", "Per quintal", "Per kg"],
        message: "Price unit must be Per ton, Per quintal, or Per kg.",
      },
    },
    deliveryLocation: {
      type: String,
      trim: true,
      maxlength: [200, "Delivery location cannot exceed 200 characters."],
      default: "",
    },
    qualityGrade: {
      type: String,
      trim: true,
      maxlength: [200, "Quality/grade requirements cannot exceed 200 characters."],
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, "Additional notes cannot exceed 500 characters."],
      default: "",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help query and verify uniqueness
purchaseRequirementSchema.index({ dealerId: 1, crop: 1, status: 1 });

const PurchaseRequirement = mongoose.model(
  "PurchaseRequirement",
  purchaseRequirementSchema
);

module.exports = PurchaseRequirement;

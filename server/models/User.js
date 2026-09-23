const mongoose = require("mongoose");
const { ALLOWED_ROLES } = require("../constants/roles");
const { ALLOWED_SKILLS } = require("../constants/labourSkills");
const { ALLOWED_PRODUCTS } = require("../constants/dealerProducts");

// ─── Sub-schemas ───────────────────────────────────────────────────────────

const farmerProfileSchema = new mongoose.Schema(
  {
    stateId: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    districtId: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    talukaId: { type: String, required: true, trim: true },
    taluka: { type: String, required: true, trim: true },
    villageId: { type: String, required: true, trim: true },
    village: { type: String, required: true, trim: true },
    gatNo: {
      type: String,
      required: true,
      trim: true,
      maxlength: [50, "Gat No is too long."],
    },
  },
  { _id: false }
);

const labourProfileSchema = new mongoose.Schema(
  {
    experienceYears: {
      type: Number,
      required: [true, "Experience in agricultural labour is required."],
      min: [0, "Experience cannot be negative."],
      max: [60, "Experience cannot exceed 60 years."],
      validate: {
        validator: Number.isInteger,
        message: "Experience must be a whole number.",
      },
    },
    skills: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((s) => ALLOWED_SKILLS.includes(s)),
        message: "One or more skills are invalid.",
      },
    },
  },
  { _id: false }
);

const dealerProfileSchema = new mongoose.Schema(
  {
    products: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.every((p) => ALLOWED_PRODUCTS.includes(p)),
        message: "One or more products are invalid.",
      },
    },
  },
  { _id: false }
);

// ─── Main User Schema ──────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(  
  {
    firstName: { 
      type: String,
      required: [true, "First name is required."],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters."],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required."],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters."],
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address."],
    },
    mobile: {
      type: String,
      required: [true, "Mobile number is required."],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, "Please provide a valid 10-digit Indian mobile number."],
    },
    role: {
      type: String,
      required: [true, "Role is required."],
      enum: {
        values: ALLOWED_ROLES,
        message: "Role must be one of: farmer, labour, dealer, admin.",
      },
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    // Address is used by labour and dealer
    address: {
      type: String,
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters."],
    },

    // Only populated for role = farmer
    farmerProfile: {
      type: farmerProfileSchema,
      default: undefined,
    },
    // Only populated for role = labour
    labourProfile: {
      type: labourProfileSchema,
      default: undefined,
    },
    // Only populated for role = dealer
    dealerProfile: {
      type: dealerProfileSchema,
      default: undefined,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ───────────────────────────────────────────────────────────────
// email and mobile already have unique: true which creates indexes automatically.
// Explicit compound/additional indexes can be added here as needed.

// ─── Model ────────────────────────────────────────────────────────────────
const User = mongoose.model("User", userSchema);
module.exports = User;

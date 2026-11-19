import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "../context/AuthContext";
import { updateProfile, uploadProfilePicture, deleteProfilePicture } from "../services/userService";
import { getProfileImageUrl } from "./ProfileAvatar";
import LocationSelector from "./LocationSelector";
import SkillSelector from "./SkillSelector";
import {
  X,
  User,
  Mail,
  Phone,
  FileText,
  Camera,
  Trash2,
  Loader2,
  Check,
  Building,
  Award,
  IndianRupee,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const EditProfileModal = ({ isOpen, onClose }) => {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [errors, setErrors] = useState({});

  // Base Form Fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  // Role: Farmer Fields
  const [gatNo, setGatNo] = useState("");
  const [farmerLocation, setFarmerLocation] = useState({
    stateId: "",
    state: "",
    districtId: "",
    district: "",
    talukaId: "",
    taluka: "",
    villageId: "",
    village: "",
  });

  // Role: Dealer Fields
  const [businessName, setBusinessName] = useState("");
  const [dealerLocation, setDealerLocation] = useState({
    stateId: "",
    state: "",
    districtId: "",
    district: "",
    talukaId: "",
    taluka: "",
    villageId: "",
    village: "",
  });

  // Role: Labour Fields
  const [experienceYears, setExperienceYears] = useState(0);
  const [expectedWage, setExpectedWage] = useState("");
  const [availability, setAvailability] = useState("available");
  const [skills, setSkills] = useState([]);
  const [labourLocation, setLabourLocation] = useState({
    stateId: "",
    state: "",
    districtId: "",
    district: "",
    talukaId: "",
    taluka: "",
    villageId: "",
    village: "",
  });

  const fileInputRef = useRef(null);

  // Sync state with user data whenever modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setMobile(user.mobile || "");
      setEmail(user.email || "");
      setAddress(user.address || "");
      setProfilePicture(user.profilePicture || "");
      setErrors({});

      if (user.role === "farmer") {
        setGatNo(user.farmerProfile?.gatNo || "");
        setFarmerLocation({
          stateId: user.farmerProfile?.stateId || "",
          state: user.farmerProfile?.state || "",
          districtId: user.farmerProfile?.districtId || "",
          district: user.farmerProfile?.district || "",
          talukaId: user.farmerProfile?.talukaId || "",
          taluka: user.farmerProfile?.taluka || "",
          villageId: user.farmerProfile?.villageId || "",
          village: user.farmerProfile?.village || "",
        });
      } else if (user.role === "dealer") {
        setBusinessName(user.dealerProfile?.businessName || "");
        setDealerLocation({
          stateId: user.dealerProfile?.stateId || "",
          state: user.dealerProfile?.state || "",
          districtId: user.dealerProfile?.districtId || "",
          district: user.dealerProfile?.district || "",
          talukaId: user.dealerProfile?.talukaId || "",
          taluka: user.dealerProfile?.taluka || "",
          villageId: user.dealerProfile?.villageId || "",
          village: user.dealerProfile?.village || "",
        });
      } else if (user.role === "labour") {
        setExperienceYears(user.labourProfile?.experienceYears ?? 0);
        setExpectedWage(user.labourProfile?.expectedWage || "");
        setAvailability(user.labourProfile?.availability || "available");
        setSkills(user.labourProfile?.skills || []);
        setLabourLocation({
          stateId: user.labourProfile?.stateId || "",
          state: user.labourProfile?.state || "",
          districtId: user.labourProfile?.districtId || "",
          district: user.labourProfile?.district || "",
          talukaId: user.labourProfile?.talukaId || "",
          taluka: user.labourProfile?.taluka || "",
          villageId: user.labourProfile?.villageId || "",
          village: user.labourProfile?.village || "",
        });
      }
    }
  }, [isOpen, user]);

  // Prevent background page scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen && !loading && !uploadingPhoto) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, loading, uploadingPhoto, onClose]);

  if (!isOpen) return null;

  // Handle Profile Picture file selection and instant upload
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type.toLowerCase())) {
      toast.error("Please select a valid image file (JPG, PNG, or WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);
      const res = await uploadProfilePicture(formData);
      if (res.data?.success) {
        const newPicture = res.data.data.profilePicture;
        setProfilePicture(newPicture);
        updateUser({ profilePicture: newPicture });
        toast.success("Profile photo updated successfully!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to upload photo.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    setUploadingPhoto(true);
    try {
      const res = await deleteProfilePicture();
      if (res.data?.success) {
        setProfilePicture("");
        updateUser({ profilePicture: "" });
        toast.success("Profile photo removed.");
      }
    } catch (err) {
      toast.error(err.message || "Failed to remove photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs = {};
    if (!firstName.trim()) errs.firstName = "First name is required.";
    if (!lastName.trim()) errs.lastName = "Last name is required.";

    const mobileDigits = mobile.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(mobileDigits)) {
      errs.mobile = "Please enter a valid 10-digit Indian mobile number.";
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      errs.email = "Please enter a valid email address.";
    }

    if (user?.role === "farmer") {
      if (!gatNo.trim()) errs.gatNo = "Gat number is required.";
      if (!farmerLocation.stateId) errs.state = "State is required.";
      if (!farmerLocation.districtId) errs.district = "District is required.";
      if (!farmerLocation.talukaId) errs.taluka = "Taluka is required.";
      if (!farmerLocation.villageId) errs.village = "Village is required.";
    }

    if (user?.role === "labour") {
      const exp = Number(experienceYears);
      if (isNaN(exp) || exp < 0 || exp > 60) {
        errs.experienceYears = "Experience must be between 0 and 60 years.";
      }
      if (expectedWage && (isNaN(Number(expectedWage)) || Number(expectedWage) < 0)) {
        errs.expectedWage = "Expected wage must be a non-negative number.";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        mobile: mobile.replace(/\D/g, "").slice(-10),
        email: email.trim().toLowerCase(),
        address: address.trim(),
      };

      if (user?.role === "farmer") {
        payload.farmerProfile = {
          ...farmerLocation,
          gatNo: gatNo.trim(),
        };
      } else if (user?.role === "dealer") {
        payload.dealerProfile = {
          businessName: businessName.trim(),
          ...dealerLocation,
        };
      } else if (user?.role === "labour") {
        payload.labourProfile = {
          experienceYears: Number(experienceYears),
          expectedWage: expectedWage !== "" ? Number(expectedWage) : undefined,
          availability,
          skills,
          ...labourLocation,
        };
      }

      const res = await updateProfile(payload);
      if (res.data?.success) {
        toast.success("Profile updated successfully!");
        updateUser(res.data.data.user);
        onClose();
      }
    } catch (err) {
      toast.error(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const initials = `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "KD";
  const avatarUrl = profilePicture ? getProfileImageUrl(profilePicture) : null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading && !uploadingPhoto) onClose();
      }}
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-[650px] max-h-[90vh] flex flex-col overflow-hidden text-slate-800 animate-in zoom-in-95 duration-200 my-auto">
        {/* Modal Header — Fixed at Top */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 id="edit-profile-title" className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Edit Profile</span>
              <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3b38e4] border border-indigo-200">
                {user?.role}
              </span>
            </h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Update your personal and registration information
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading || uploadingPhoto}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form — with scrollable body and fixed footer */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Scrollable Form Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 overscroll-contain">
            {/* ── Top-Center Profile Picture Section (Prominent circular preview + camera trigger) ── */}
            <div className="flex flex-col items-center justify-center text-center pb-2">
              <div className="relative group mx-auto mb-3">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-indigo-100 bg-slate-100 flex items-center justify-center">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${firstName || "User"}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-[#3b38e4] to-indigo-600 flex items-center justify-center text-white font-extrabold text-2xl sm:text-3xl tracking-wider select-none shadow-inner">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Camera icon badge button on avatar */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Upload or change profile picture"
                  aria-label="Upload or change profile picture"
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#3b38e4] text-white hover:bg-[#302dc4] shadow-md border-2 border-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {uploadingPhoto ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Camera className="w-4 h-4 stroke-[2.2]" />
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-[#3b38e4] border border-indigo-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{uploadingPhoto ? "Uploading..." : "Change Photo"}</span>
                </button>

                {profilePicture && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploadingPhoto}
                    className="px-3 py-1.5 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold border border-red-200 transition cursor-pointer disabled:opacity-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                )}
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoSelect}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
            </div>

            {/* ── Basic Personal Details ── */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="First Name"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                        errors.firstName ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100"
                      } text-sm focus:outline-none focus:ring-2 focus:border-[#3b38e4] transition bg-white`}
                    />
                  </div>
                  {errors.firstName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.firstName}</p>}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Last Name"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                        errors.lastName ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100"
                      } text-sm focus:outline-none focus:ring-2 focus:border-[#3b38e4] transition bg-white`}
                    />
                  </div>
                  {errors.lastName && <p className="text-xs text-red-500 mt-1 font-medium">{errors.lastName}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                        errors.mobile ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100"
                      } text-sm focus:outline-none focus:ring-2 focus:border-[#3b38e4] transition bg-white`}
                    />
                  </div>
                  {errors.mobile && <p className="text-xs text-red-500 mt-1 font-medium">{errors.mobile}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@example.com"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                        errors.email ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100"
                      } text-sm focus:outline-none focus:ring-2 focus:border-[#3b38e4] transition bg-white`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-red-500 mt-1 font-medium">{errors.email}</p>}
                  <p className="text-[11px] text-slate-400 mt-1">Used for login verification codes (OTP).</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {user?.role === "dealer" ? "Business Address" : "Address / Street"}
                </label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter complete residential or business address..."
                  rows={2}
                  maxLength={300}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#3b38e4] transition bg-white resize-none"
                />
              </div>
            </div>

            {/* ── Role Specific Sections ── */}

            {/* 1. Farmer Details */}
            {user?.role === "farmer" && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Farm & Land Information
                </h3>

                {/* Gat Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gat Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={gatNo}
                      onChange={(e) => setGatNo(e.target.value)}
                      placeholder="e.g. 142/A"
                      className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                        errors.gatNo ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100"
                      } text-sm focus:outline-none focus:ring-2 focus:border-[#3b38e4] transition bg-white`}
                    />
                  </div>
                  {errors.gatNo && <p className="text-xs text-red-500 mt-1 font-medium">{errors.gatNo}</p>}
                </div>

                {/* Location Cascading Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Land Location (State, District, Taluka, Village) <span className="text-red-500">*</span>
                  </label>
                  <LocationSelector
                    value={farmerLocation}
                    onChange={setFarmerLocation}
                    errors={errors}
                  />
                </div>
              </div>
            )}

            {/* 2. Dealer Details */}
            {user?.role === "dealer" && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Dealer & Business Details
                </h3>

                {/* Business Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Business / Trading Firm / Shop Name
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Kisan Agro Trading Co."
                      maxLength={100}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#3b38e4] transition bg-white"
                    />
                  </div>
                </div>

                {/* Dealer Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location (State, District, Taluka, Village / City)
                  </label>
                  <LocationSelector
                    value={dealerLocation}
                    onChange={setDealerLocation}
                    errors={errors}
                  />
                </div>

                {/* Preserved Registered Crops Indicator */}
                <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-[#3b38e4]">Registered Commodity Crops</p>
                    <p className="text-xs text-slate-600">
                      {user.dealerProfile?.products?.length || 0} registered commodities preserved
                    </p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white text-[#3b38e4] border border-indigo-200">
                    Preserved
                  </span>
                </div>
              </div>
            )}

            {/* 3. Worker / Labour Details */}
            {user?.role === "labour" && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Agricultural Skills & Experience
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Experience in Years */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Experience (Years) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={0}
                        max={60}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border ${
                          errors.experienceYears ? "border-red-500 focus:ring-red-200" : "border-slate-200 focus:ring-indigo-100"
                        } text-sm focus:outline-none focus:ring-2 focus:border-[#3b38e4] transition bg-white`}
                      />
                    </div>
                    {errors.experienceYears && (
                      <p className="text-xs text-red-500 mt-1 font-medium">{errors.experienceYears}</p>
                    )}
                  </div>

                  {/* Expected Wage */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Expected Wage (₹ / Day)
                    </label>
                    <div className="relative">
                      <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={0}
                        step={50}
                        value={expectedWage}
                        onChange={(e) => setExpectedWage(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#3b38e4] transition bg-white"
                      />
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Availability Status
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#3b38e4] transition bg-white appearance-none cursor-pointer"
                      >
                        <option value="available">🟢 Available for Work</option>
                        <option value="busy">🔴 Currently Busy</option>
                        <option value="part-time">🟡 Part-Time</option>
                        <option value="any">⚪ Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Skills Multi-Selector */}
                <div>
                  <SkillSelector value={skills} onChange={setSkills} />
                </div>

                {/* Labour Location */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Location (State, District, Taluka, Village)
                  </label>
                  <LocationSelector
                    value={labourLocation}
                    onChange={setLabourLocation}
                    errors={errors}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer — Fixed at Bottom within the Modal */}
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-3 bg-slate-50/90 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploadingPhoto}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-sm font-semibold transition cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingPhoto}
              className="px-6 py-2.5 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white text-sm font-bold shadow-md shadow-[#3b38e4]/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[2.5]" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;

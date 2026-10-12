import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import DealerHeader from "../../components/dealer/DealerHeader";
import ProfileAvatar from "../../components/ProfileAvatar";
import RequirementModal from "../../components/dealer/RequirementModal";
import {
  getDealerRequirements,
  deleteDealerRequirement,
} from "../../services/dealerService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
  Layers,
  Info,
  Loader2,
  Sparkles,
} from "lucide-react";

const MAX_REQUIREMENTS = 3;

const DealerProfile = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  // Requirements state
  const [requirements, setRequirements] = useState([]);
  const [registeredCrops, setRegisteredCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeCropForModal, setActiveCropForModal] = useState("");
  const [editingRequirement, setEditingRequirement] = useState(null);

  // Delete confirmation state
  const [deletingId, setDeletingId] = useState(null);

  // Fetch requirements
  const fetchRequirements = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDealerRequirements();
      if (res.data?.success) {
        setRequirements(res.data.data.requirements || []);
        // Prefer crops from API response, fallback to user profile
        const crops =
          res.data.data.registeredCrops ||
          user?.dealerProfile?.products ||
          [];
        setRegisteredCrops(crops);
      }
    } catch (err) {
      setError(err.message || "Failed to load purchase requirements.");
      // Fallback to user registered crops if available
      if (user?.dealerProfile?.products) {
        setRegisteredCrops(user.dealerProfile.products);
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  // Active requirement crops set
  const activeCropNames = new Set(requirements.map((r) => r.crop));
  const activeCount = requirements.length;
  const isLimitReached = activeCount >= MAX_REQUIREMENTS;

  // Open modal for a specific crop to ADD requirement
  const handleAddRequirement = (cropName) => {
    if (isLimitReached) {
      toast.error("Maximum limit of 3 active requirements reached. Edit or delete an existing one.");
      return;
    }
    setActiveCropForModal(cropName);
    setEditingRequirement(null);
    setIsModalOpen(true);
  };

  // Open modal to EDIT requirement
  const handleEditRequirement = (req) => {
    setActiveCropForModal(req.crop);
    setEditingRequirement(req);
    setIsModalOpen(true);
  };

  // Delete requirement
  const handleDeleteRequirement = async (req) => {
    if (!window.confirm(`Are you sure you want to delete the purchase requirement for "${req.crop}"? This will free an active requirement slot.`)) {
      return;
    }

    setDeletingId(req._id);
    try {
      const res = await deleteDealerRequirement(req._id);
      toast.success(res.data?.message || `Deleted requirement for ${req.crop}. Slot freed!`);
      await fetchRequirements();
    } catch (err) {
      toast.error(err.message || "Failed to delete requirement.");
    } finally {
      setDeletingId(null);
    }
  };

  // Registered crops list fallback from auth user
  const effectiveCrops = registeredCrops.length > 0
    ? registeredCrops
    : (user?.dealerProfile?.products || []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
      {/* Hero Background with slow zoom animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.06 }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        {/* Dark gradient overlay — blue tint for dealer */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-blue-950/50 to-gray-900/90" />
      </div>

      {/* Header */}
      <DealerHeader showBackToDashboard={true} />

      {/* Page Content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Link to="/dealer/dashboard" className="hover:text-white transition">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-white font-medium">My Profile & Requirements</span>
          </div>
          <Link
            to="/dealer/dashboard"
            className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl border border-white/10 transition flex items-center gap-1.5"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        {/* ── Section 1: Dealer Registration Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl text-white"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Profile Avatar with click-to-upload capability */}
              <div className="shrink-0">
                <ProfileAvatar />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/40">
                    Dealer
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Active
                  </span>
                </div>
                <p className="text-sm text-white/70">
                  Dealer Registration & Crop Purchase Profile
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 self-start md:self-auto">
              <div className="text-center">
                <p className="text-xs text-white/50">Registered Crops</p>
                <p className="text-lg font-bold text-white">{effectiveCrops.length}</p>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div className="text-center">
                <p className="text-xs text-white/50">Active Requirements</p>
                <p className="text-lg font-bold text-blue-300">{activeCount} / {MAX_REQUIREMENTS}</p>
              </div>
            </div>
          </div>

          {/* Registration Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/50 text-xs font-semibold mb-1">
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>Full Name</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/50 text-xs font-semibold mb-1">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>Email Address</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">
                {user?.email}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/50 text-xs font-semibold mb-1">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>Mobile Number</span>
              </div>
              <p className="text-sm font-semibold text-white truncate">
                +91 {user?.mobile}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-white/50 text-xs font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Business Address</span>
              </div>
              <p className="text-sm font-semibold text-white line-clamp-1">
                {user?.address || "—"}
              </p>
            </div>
          </div>

          {/* Registered Crops Area */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span>Selected Crops from Registration</span>
                </h3>
                <p className="text-xs text-white/60 mt-0.5">
                  These crops were chosen during registration. They are reused automatically for your purchase requirements.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 self-start sm:self-auto">
                {effectiveCrops.length} Registered Crop{effectiveCrops.length === 1 ? "" : "s"}
              </span>
            </div>

            {effectiveCrops.length === 0 ? (
              <p className="text-xs text-white/50 italic bg-white/5 p-3 rounded-xl border border-white/10">
                No crops were registered during signup.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {effectiveCrops.map((crop) => {
                  const hasRequirement = activeCropNames.has(crop);
                  return (
                    <span
                      key={crop}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                        hasRequirement
                          ? "bg-blue-500/25 border-blue-400/50 text-blue-200 shadow-sm"
                          : "bg-white/10 border-white/20 text-white/80"
                      }`}
                    >
                      <span>🌾</span>
                      <span>{crop}</span>
                      {hasRequirement && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
                      )}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Section 2: My Crop Purchase Requirements ── */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-2xl font-extrabold text-white tracking-tight drop-shadow">
                  My Crop Purchase Requirements
                </h2>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isLimitReached
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : "bg-blue-500/20 text-blue-300 border-blue-400/30"
                  }`}
                >
                  {activeCount} / {MAX_REQUIREMENTS} Active
                </span>
              </div>
              <p className="text-sm text-white/70 mt-1">
                Configure purchasing criteria for crops you registered. Maintain up to 3 active purchase requirements.
              </p>
            </div>
          </div>

          {/* Slot limit notice */}
          {isLimitReached ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs sm:text-sm flex items-start gap-3 backdrop-blur-md"
            >
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-100">
                  Maximum Limit Reached (3 of 3 Active Requirements)
                </p>
                <p className="text-amber-200/80 mt-0.5">
                  You have configured the maximum allowed of 3 active requirements. To add a requirement for another registered crop, please edit or delete an existing requirement.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/20 text-blue-200 text-xs sm:text-sm flex items-center justify-between gap-3 backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-blue-400 shrink-0" />
                <span>
                  You have <strong>{MAX_REQUIREMENTS - activeCount}</strong> requirement slot{MAX_REQUIREMENTS - activeCount === 1 ? "" : "s"} available.
                </span>
              </div>
              <span className="text-[11px] font-semibold text-blue-300 bg-blue-500/20 px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Max 3 Allowed
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-white/60">
              <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-2" />
              <p className="text-sm">Loading purchase requirements...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchRequirements}
                className="px-3 py-1 bg-red-500/30 hover:bg-red-500/50 rounded-lg text-xs font-semibold transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Active Requirements Grid ── */}
          {!loading && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>📋</span>
                <span>Active Purchase Requirements ({requirements.length})</span>
              </h3>

              {requirements.length === 0 ? (
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 text-center text-white/70">
                  <Package className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <h4 className="text-base font-semibold text-white mb-1">
                    No active purchase requirements yet
                  </h4>
                  <p className="text-xs sm:text-sm text-white/60 max-w-md mx-auto mb-5">
                    Configure purchase requirements for your registered crops below. Set your required quantity, expected price, and delivery preferences.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {requirements.map((req, index) => (
                    <motion.div
                      key={req._id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: index * 0.08 }}
                      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-5 shadow-xl flex flex-col justify-between hover:bg-white/15 hover:border-white/30 transition-all duration-300 group"
                    >
                      <div>
                        {/* Card Header: Crop Name + Status */}
                        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-white/10">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                              Registered Crop
                            </span>
                            <h4 className="text-lg font-extrabold text-white flex items-center gap-1.5 mt-1">
                              <span>🌾</span> {req.crop}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        </div>

                        {/* Card Key Metrics: Quantity & Price */}
                        <div className="grid grid-cols-2 gap-2.5 mb-4">
                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                            <p className="text-[11px] text-white/50 font-medium mb-0.5">Required Quantity</p>
                            <p className="text-base font-bold text-white">
                              {req.quantity}{" "}
                              <span className="text-xs font-normal text-white/70">{req.quantityUnit}</span>
                            </p>
                          </div>

                          <div className="bg-white/5 border border-white/10 rounded-2xl p-3">
                            <p className="text-[11px] text-white/50 font-medium mb-0.5">Expected Price</p>
                            <p className="text-base font-bold text-emerald-300">
                              ₹{req.expectedPrice?.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-white/70">/ {req.priceUnit?.replace(/^Per\s+/i, '')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Optional Preferences */}
                        <div className="space-y-2 text-xs text-white/80 mb-4 bg-white/5 rounded-2xl p-3 border border-white/10">
                          {req.deliveryLocation && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-white/50">Location: </span>
                                <span className="font-medium text-white">{req.deliveryLocation}</span>
                              </div>
                            </div>
                          )}

                          {req.qualityGrade && (
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-white/50">Quality: </span>
                                <span className="font-medium text-white">{req.qualityGrade}</span>
                              </div>
                            </div>
                          )}

                          {req.notes && (
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-white/50">Notes: </span>
                                <span className="font-medium text-white">{req.notes}</span>
                              </div>
                            </div>
                          )}

                          {!req.deliveryLocation && !req.qualityGrade && !req.notes && (
                            <p className="text-white/40 italic text-[11px]">No additional preferences specified.</p>
                          )}
                        </div>
                      </div>

                      {/* Card Actions: Edit & Delete */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => handleEditRequirement(req)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-300" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === req._id}
                          onClick={() => handleDeleteRequirement(req)}
                          className="px-3 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 hover:text-red-200 text-xs font-semibold transition disabled:opacity-50 inline-flex items-center gap-1.5"
                          title="Delete requirement to free a slot"
                        >
                          {deletingId === req._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                          <span>Delete</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Registered Crops Configuration Area ── */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 sm:p-7 shadow-xl mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>Configure Requirements for Registered Crops</span>
                </h3>
                <p className="text-xs text-white/70 mt-1">
                  Click on an unconfigured crop below to add a purchase requirement. The crop name will be applied automatically.
                </p>
              </div>
              <span className="text-xs text-white/50">
                {activeCount} of {MAX_REQUIREMENTS} slots used
              </span>
            </div>

            {effectiveCrops.length === 0 ? (
              <p className="text-sm text-white/50">No crops available in dealer profile.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {effectiveCrops.map((crop) => {
                  const existingReq = requirements.find((r) => r.crop === crop);
                  const isConfigured = Boolean(existingReq);

                  return (
                    <div
                      key={crop}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isConfigured
                          ? "bg-blue-500/10 border-blue-400/30"
                          : "bg-white/5 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">🌾</span>
                        <div className="truncate">
                          <p className="text-sm font-bold text-white truncate">{crop}</p>
                          <p className="text-[11px] text-white/50">
                            {isConfigured ? "✓ Active requirement set" : "Ready to configure"}
                          </p>
                        </div>
                      </div>

                      {isConfigured ? (
                        <button
                          type="button"
                          onClick={() => handleEditRequirement(existingReq)}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 text-xs font-semibold border border-blue-400/30 transition flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isLimitReached}
                          onClick={() => handleAddRequirement(crop)}
                          className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 shadow-sm ${
                            isLimitReached
                              ? "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/20"
                          }`}
                          title={isLimitReached ? "3/3 requirements reached. Delete one to free a slot." : `Configure requirement for ${crop}`}
                        >
                          <Plus className="w-3 h-3" />
                          <span>Configure</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Requirement Add/Edit Modal */}
      <RequirementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRequirement(null);
        }}
        crop={activeCropForModal}
        requirement={editingRequirement}
        onSuccess={fetchRequirements}
      />
    </div>
  );
};

export default DealerProfile;

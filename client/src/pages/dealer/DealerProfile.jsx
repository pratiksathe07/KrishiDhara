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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f8faff] text-slate-800">
      {/* SapphireIQ Ambient Glow Backdrop (Light) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff25_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff25_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Ambient floating pastel orbs */}
        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-[#3b38e4]/08 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 35, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-[#00b4d8]/08 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -25, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-28 left-1/3 w-[650px] h-[650px] rounded-full bg-[#8b5cf6]/06 blur-[150px]"
        />
      </div>

      {/* Header */}
      <DealerHeader showBackToDashboard={true} />

      {/* Page Content */}
      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Link to="/dealer/dashboard" className="hover:text-slate-900 transition">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-slate-900 font-semibold">My Profile & Requirements</span>
          </div>
          <Link
            to="/dealer/dashboard"
            className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl border border-slate-200 transition flex items-center gap-1.5 font-semibold"
          >
            <span>←</span> Back to Dashboard
          </Link>
        </div>

        {/* ── Section 1: Dealer Registration Profile Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-800"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Profile Avatar with click-to-upload capability */}
              <div className="shrink-0">
                <ProfileAvatar />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    {user?.firstName} {user?.lastName}
                  </h1>
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3b38e4] border border-indigo-200">
                    Dealer
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-500 font-medium">
                  Dealer Registration & Crop Purchase Profile
                </p>
              </div>
            </div>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 self-start md:self-auto">
              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium">Registered Crops</p>
                <p className="text-lg font-bold text-slate-900">{effectiveCrops.length}</p>
              </div>
              <div className="h-8 w-px bg-slate-200" />
              <div className="text-center">
                <p className="text-xs text-slate-500 font-medium">Active Requirements</p>
                <p className="text-lg font-bold text-[#3b38e4]">{activeCount} / {MAX_REQUIREMENTS}</p>
              </div>
            </div>
          </div>

          {/* Registration Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <User className="w-3.5 h-3.5 text-[#3b38e4]" />
                <span>Full Name</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.firstName} {user?.lastName}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Mail className="w-3.5 h-3.5 text-[#3b38e4]" />
                <span>Email Address</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                {user?.email}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <Phone className="w-3.5 h-3.5 text-[#3b38e4]" />
                <span>Mobile Number</span>
              </div>
              <p className="text-sm font-bold text-slate-800 truncate">
                +91 {user?.mobile}
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                <MapPin className="w-3.5 h-3.5 text-[#3b38e4]" />
                <span>Business Address</span>
              </div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">
                {user?.address || "—"}
              </p>
            </div>
          </div>

          {/* Registered Crops Area */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-600" />
                  <span>Selected Crops from Registration</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  These crops were chosen during registration. They are reused automatically for your purchase requirements.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 self-start sm:self-auto">
                {effectiveCrops.length} Registered Crop{effectiveCrops.length === 1 ? "" : "s"}
              </span>
            </div>

            {effectiveCrops.length === 0 ? (
              <p className="text-xs text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-100">
                No crops were registered during signup.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {effectiveCrops.map((crop) => {
                  const hasRequirement = activeCropNames.has(crop);
                  return (
                    <span
                      key={crop}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                        hasRequirement
                          ? "bg-indigo-50 border-indigo-200 text-[#3b38e4] shadow-sm"
                          : "bg-slate-50 border-slate-200 text-slate-700"
                      }`}
                    >
                      <span>🌾</span>
                      <span>{crop}</span>
                      {hasRequirement && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 ml-0.5" />
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
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  My Crop Purchase Requirements
                </h2>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border ${
                    isLimitReached
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-indigo-50 text-[#3b38e4] border-indigo-200"
                  }`}
                >
                  {activeCount} / {MAX_REQUIREMENTS} Active
                </span>
              </div>
              <p className="text-sm text-slate-500 mt-1 font-medium">
                Configure purchasing criteria for crops you registered. Maintain up to 3 active purchase requirements.
              </p>
            </div>
          </div>

          {/* Slot limit notice */}
          {isLimitReached ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs sm:text-sm flex items-start gap-3"
            >
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-amber-900">
                  Maximum Limit Reached (3 of 3 Active Requirements)
                </p>
                <p className="text-amber-700 mt-0.5">
                  You have configured the maximum allowed of 3 active requirements. To add a requirement for another registered crop, please edit or delete an existing requirement.
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-[#3b38e4] text-xs sm:text-sm flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Info className="w-4 h-4 text-[#3b38e4] shrink-0" />
                <span className="font-medium">
                  You have <strong>{MAX_REQUIREMENTS - activeCount}</strong> requirement slot{MAX_REQUIREMENTS - activeCount === 1 ? "" : "s"} available.
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#3b38e4] bg-indigo-100/70 px-2.5 py-0.5 rounded-full border border-indigo-200">
                Max 3 Allowed
              </span>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#3b38e4] mb-2" />
              <p className="text-sm font-medium">Loading purchase requirements...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={fetchRequirements}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 rounded-lg text-xs font-semibold transition"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── Active Requirements Grid ── */}
          {!loading && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📋</span>
                <span>Active Purchase Requirements ({requirements.length})</span>
              </h3>

              {requirements.length === 0 ? (
                <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center text-slate-600 shadow-sm">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h4 className="text-base font-bold text-slate-900 mb-1">
                    No active purchase requirements yet
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-5">
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
                      className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm flex flex-col justify-between hover:border-[#3b38e4]/50 hover:shadow-md transition-all duration-300 group"
                    >
                      <div>
                        {/* Card Header: Crop Name + Status */}
                        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#3b38e4] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                              Registered Crop
                            </span>
                            <h4 className="text-lg font-extrabold text-slate-900 flex items-center gap-1.5 mt-1">
                              <span>🌾</span> {req.crop}
                            </h4>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active
                          </span>
                        </div>

                        {/* Card Key Metrics: Quantity & Price */}
                        <div className="grid grid-cols-2 gap-2.5 mb-4">
                          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5">Required Quantity</p>
                            <p className="text-base font-bold text-slate-900">
                              {req.quantity}{" "}
                              <span className="text-xs font-normal text-slate-500">{req.quantityUnit}</span>
                            </p>
                          </div>

                          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3">
                            <p className="text-[11px] text-slate-500 font-medium mb-0.5">Expected Price</p>
                            <p className="text-base font-bold text-emerald-600">
                              ₹{req.expectedPrice?.toLocaleString()}{" "}
                              <span className="text-xs font-normal text-slate-500">/ {req.priceUnit?.replace(/^Per\s+/i, '')}</span>
                            </p>
                          </div>
                        </div>

                        {/* Optional Preferences */}
                        <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 rounded-2xl p-3 border border-slate-200/60">
                          {req.deliveryLocation && (
                            <div className="flex items-start gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#3b38e4] shrink-0 mt-0.5" />
                              <div>
                                <span className="text-slate-400">Location: </span>
                                <span className="font-semibold text-slate-800">{req.deliveryLocation}</span>
                              </div>
                            </div>
                          )}

                          {req.qualityGrade && (
                            <div className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-slate-400">Quality: </span>
                                <span className="font-semibold text-slate-800">{req.qualityGrade}</span>
                              </div>
                            </div>
                          )}

                          {req.notes && (
                            <div className="flex items-start gap-2">
                              <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <div>
                                <span className="text-slate-400">Notes: </span>
                                <span className="font-semibold text-slate-800">{req.notes}</span>
                              </div>
                            </div>
                          )}

                          {!req.deliveryLocation && !req.qualityGrade && !req.notes && (
                            <p className="text-slate-400 italic text-[11px]">No additional preferences specified.</p>
                          )}
                        </div>
                      </div>

                      {/* Card Actions: Edit & Delete */}
                      <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={() => handleEditRequirement(req)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-[#3b38e4]" />
                          <span>Edit</span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === req._id}
                          onClick={() => handleDeleteRequirement(req)}
                          className="px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold transition disabled:opacity-50 inline-flex items-center gap-1.5"
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
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-sm mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <span>Configure Requirements for Registered Crops</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Click on an unconfigured crop below to add a purchase requirement. The crop name will be applied automatically.
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {activeCount} of {MAX_REQUIREMENTS} slots used
              </span>
            </div>

            {effectiveCrops.length === 0 ? (
              <p className="text-sm text-slate-400">No crops available in dealer profile.</p>
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
                          ? "bg-indigo-50/60 border-indigo-200"
                          : "bg-slate-50 border-slate-200/70 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">🌾</span>
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-900 truncate">{crop}</p>
                          <p className="text-[11px] text-slate-500">
                            {isConfigured ? "✓ Active requirement set" : "Ready to configure"}
                          </p>
                        </div>
                      </div>

                      {isConfigured ? (
                        <button
                          type="button"
                          onClick={() => handleEditRequirement(existingReq)}
                          className="shrink-0 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-[#3b38e4] text-xs font-bold border border-indigo-200 shadow-sm transition flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isLimitReached}
                          onClick={() => handleAddRequirement(crop)}
                          className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm ${
                            isLimitReached
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                              : "bg-[#3b38e4] hover:bg-[#302dc4] text-white shadow-md shadow-[#3b38e4]/25"
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

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Plus,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  Phone,
  Zap,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  AlertCircle,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyLabourRequirements,
  getAllLabourRequirements,
  updateLabourRequirementStatus,
  deleteLabourRequirement,
} from "../../services/labourRequirementService";
import LabourRequirementModal from "../../components/farmer/LabourRequirementModal";
import { LABOUR_SKILLS } from "../../constants/labourSkills";

const FarmerLabourRequirements = ({ user }) => {
  const { t } = useTranslation();

  // Active view: 'my' (My Requirements) or 'marketplace' (All Community Posts)
  const [activeTab, setActiveTab] = useState("my");

  // Data states
  const [myRequirements, setMyRequirements] = useState([]);
  const [marketplaceReqs, setMarketplaceReqs] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Search
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState(null);

  // Fetch farmer's own requirements
  const fetchMyData = useCallback(async () => {
    try {
      const res = await getMyLabourRequirements();
      if (res.data?.success) {
        setMyRequirements(res.data.data.requirements || []);
        if (res.data.data.stats) {
          setStats(res.data.data.stats);
        }
      }
    } catch (err) {
      toast.error(err.message || "Failed to load your requirements.");
    }
  }, []);

  // Fetch community requirements
  const fetchMarketplaceData = useCallback(async () => {
    try {
      const res = await getAllLabourRequirements({ status: "active" });
      if (res.data?.success) {
        setMarketplaceReqs(res.data.data.requirements || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load community requirements.");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMyData(), fetchMarketplaceData()]);
    setLoading(false);
  }, [fetchMyData, fetchMarketplaceData]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Requirements updated!");
  };

  const handleOpenCreateModal = () => {
    setEditingReq(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (req) => {
    setEditingReq(req);
    setIsModalOpen(true);
  };

  const handleStatusToggle = async (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "completed" : "active";
    try {
      await updateLabourRequirementStatus(id, nextStatus);
      toast.success(
        nextStatus === "completed"
          ? "Requirement marked as Completed!"
          : "Requirement reopened as Active!"
      );
      fetchMyData();
    } catch (err) {
      toast.error(err.message || "Failed to change status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this labour requirement?")) {
      return;
    }
    try {
      await deleteLabourRequirement(id);
      toast.success("Requirement deleted.");
      fetchMyData();
    } catch (err) {
      toast.error(err.message || "Failed to delete requirement.");
    }
  };

  // Filtered requirements based on activeTab
  const currentList = activeTab === "my" ? myRequirements : marketplaceReqs;

  const filteredRequirements = useMemo(() => {
    return currentList.filter((item) => {
      // Status filter
      if (activeTab === "my" && selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }

      // Skill / Work Type filter
      if (selectedSkill !== "All" && item.workType?.toLowerCase() !== selectedSkill.toLowerCase()) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesWork = item.workType?.toLowerCase().includes(q);
        const matchesVillage = item.location?.village?.toLowerCase().includes(q);
        const matchesTaluka = item.location?.taluka?.toLowerCase().includes(q);
        const matchesDistrict = item.location?.district?.toLowerCase().includes(q);
        const matchesDesc = item.description?.toLowerCase().includes(q);
        return matchesTitle || matchesWork || matchesVillage || matchesTaluka || matchesDistrict || matchesDesc;
      }

      return true;
    });
  }, [currentList, activeTab, selectedStatus, selectedSkill, search]);

  const totalWorkersNeeded = useMemo(() => {
    return myRequirements
      .filter((r) => r.status === "active")
      .reduce((sum, r) => sum + (r.laboursNeeded || 0), 0);
  }, [myRequirements]);

  return (
    <div className="space-y-6">
      {/* ── Top Hero / Action Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b38e4] via-[#4338ca] to-[#6366f1] p-6 sm:p-8 text-white shadow-xl shadow-[#3b38e4]/20 border border-indigo-400/20"
      >
        <div className="absolute -top-16 -right-16 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider mb-3">
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>Labour Hiring & Requirements</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Post Labour Requirements
            </h1>
            <p className="text-indigo-100 text-sm sm:text-base leading-relaxed font-medium">
              Need workers for sowing, plowing, harvesting, or weeding? Post your work requirement here and connect with registered agricultural labours.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center shadow-sm"
              title="Refresh requirements"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3.5 rounded-2xl bg-white text-[#3b38e4] hover:bg-indigo-50 font-extrabold text-sm shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              <span>Post New Requirement</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Summary Counters ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            icon: "📢",
            label: "Total Posted",
            value: stats.total,
            desc: "All time posts",
          },
          {
            icon: "⚡",
            label: "Active Requirements",
            value: stats.active,
            highlight: true,
            desc: "Currently open",
          },
          {
            icon: "👷",
            label: "Labours Needed",
            value: totalWorkersNeeded,
            desc: "For active jobs",
          },
          {
            icon: "✅",
            label: "Completed Works",
            value: stats.completed,
            desc: "Successfully finished",
          },
        ].map((st, i) => (
          <motion.div
            key={st.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.05 }}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{st.icon}</span>
              <span className="text-[11px] font-semibold text-slate-400">{st.desc}</span>
            </div>
            <p
              className={`text-2xl sm:text-3xl font-black ${
                st.highlight ? "text-[#3b38e4]" : "text-slate-900"
              }`}
            >
              {st.value}
            </p>
            <p className="text-xs text-slate-500 font-bold mt-0.5">{st.label}</p>
          </motion.div>
        ))}
      </div>

      {/* ── View Switcher & Controls ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          {/* Main Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("my")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "my"
                  ? "bg-[#3b38e4] text-white shadow-md shadow-[#3b38e4]/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>My Posted Requirements</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === "my"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {myRequirements.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("marketplace")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === "marketplace"
                  ? "bg-[#3b38e4] text-white shadow-md shadow-[#3b38e4]/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <span>Community Requirements</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  activeTab === "marketplace"
                    ? "bg-white/20 text-white"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                {marketplaceReqs.length}
              </span>
            </button>
          </div>

          {activeTab === "my" && (
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <span className="text-xs text-slate-400 font-semibold mr-1">Status:</span>
              {["all", "active", "completed"].map((st) => (
                <button
                  key={st}
                  onClick={() => setSelectedStatus(st)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-bold capitalize transition ${
                    selectedStatus === st
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search & Skill Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, village, taluka, or description..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] focus:bg-white transition"
            />
          </div>

          <div className="relative">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] focus:bg-white transition appearance-none cursor-pointer"
            >
              <option value="All">All Work Categories</option>
              {LABOUR_SKILLS.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 text-xs">
              ▼
            </div>
          </div>
        </div>
      </div>

      {/* ── Requirements List / Cards Grid ── */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#3b38e4] animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">Loading labour requirements...</p>
        </div>
      ) : filteredRequirements.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm"
        >
          <div className="h-16 w-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl shadow-sm">
            📢
          </div>
          <h3 className="text-slate-900 font-extrabold text-lg mb-1">
            {activeTab === "my"
              ? "No labour requirements posted yet"
              : "No community requirements matching your search"}
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto mb-6">
            {activeTab === "my"
              ? "Need workers for harvesting, weeding, sowing, or other farm tasks? Post your requirements now."
              : "Try clearing search filters or check back later for new labour opportunities."}
          </p>
          {activeTab === "my" && (
            <button
              onClick={handleOpenCreateModal}
              className="px-6 py-3 rounded-2xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-bold text-sm shadow-lg shadow-[#3b38e4]/25 hover:scale-105 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Post Your First Requirement</span>
            </button>
          )}
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <AnimatePresence>
            {filteredRequirements.map((req, idx) => {
              const isOwner =
                user?._id &&
                (req.farmerId?._id === user._id || req.farmerId === user._id);
              const isActive = req.status === "active";
              const isCompleted = req.status === "completed";
              const isUrgent = req.urgency === "urgent";

              const formattedDate = req.startDate
                ? new Date(req.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Immediately";

              const farmerObj = req.farmerId || {};
              const farmerName =
                farmerObj.firstName || farmerObj.lastName
                  ? `${farmerObj.firstName || ""} ${farmerObj.lastName || ""}`.trim()
                  : "Farmer";

              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={`bg-white border rounded-3xl p-5 sm:p-6 shadow-sm transition-all duration-300 flex flex-col justify-between group hover:shadow-md ${
                    isActive
                      ? "border-slate-200/90 hover:border-[#3b38e4]/40"
                      : "border-slate-200/60 bg-slate-50/50 opacity-90"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header: Status, Urgency, WorkType */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-extrabold px-3 py-1 rounded-full border shadow-sm ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isCompleted
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {isActive && (
                            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          )}
                          {req.status === "active"
                            ? "Active / Open"
                            : req.status === "completed"
                            ? "Work Completed"
                            : "Cancelled"}
                        </span>

                        {isUrgent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">
                            <Zap className="w-3 h-3 fill-current text-amber-500" />
                            Urgent ⚡
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 text-[#3b38e4] border border-indigo-200/80">
                        {req.workType}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <h3 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#3b38e4] transition-colors leading-snug">
                        {req.title}
                      </h3>
                      {activeTab === "marketplace" && (
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          Posted by: <span className="text-slate-800">{farmerName}</span>
                        </p>
                      )}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block mb-0.5">
                          Workers Needed
                        </span>
                        <div className="flex items-center gap-1.5 text-slate-800 font-extrabold text-sm">
                          <Users className="w-4 h-4 text-[#3b38e4]" />
                          <span>{req.laboursNeeded} Labours</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block mb-0.5">
                          Daily Wage
                        </span>
                        <div className="flex items-center gap-1 text-slate-800 font-extrabold text-sm">
                          <span className="text-emerald-600">₹{req.wagePerDay}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            /{req.wageUnit || "day"}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[11px] text-slate-400 font-bold block mb-0.5">
                          Start & Duration
                        </span>
                        <div className="flex items-center gap-1 text-slate-800 font-bold text-xs truncate">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span>{formattedDate}</span>
                          <span className="text-slate-400 font-medium">
                            ({req.durationDays}d)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Farm Location */}
                    {req.location && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#3b38e4] mt-0.5 shrink-0" />
                        <span className="leading-snug">
                          {[
                            req.location.village,
                            req.location.taluka,
                            req.location.district,
                            req.location.gatNo ? `Gat: ${req.location.gatNo}` : null,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Location specified on contact"}
                          {req.location.landmark && (
                            <span className="text-slate-400 block text-[11px]">
                              Landmark: {req.location.landmark}
                            </span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* Description Notes */}
                    {req.description && (
                      <p className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200/70 leading-relaxed font-normal">
                        {req.description}
                      </p>
                    )}
                  </div>

                  {/* Footer / Actions */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400 font-medium">
                      {req.createdAt
                        ? `Posted ${new Date(req.createdAt).toLocaleDateString("en-IN")}`
                        : ""}
                    </span>

                    {/* Actions if Owner */}
                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        {/* Toggle Status Button */}
                        <button
                          type="button"
                          onClick={() => handleStatusToggle(req._id, req.status)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border shadow-sm ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                              : "bg-indigo-50 text-[#3b38e4] hover:bg-indigo-100 border-indigo-200"
                          }`}
                          title={isActive ? "Mark work as finished" : "Re-open requirement"}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isActive ? "Mark Done" : "Reopen"}</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(req)}
                          className="p-1.5 rounded-xl text-slate-600 hover:text-[#3b38e4] hover:bg-indigo-50 border border-slate-200 transition"
                          title="Edit requirement"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => handleDelete(req._id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                          title="Delete requirement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Contact Button for Labours or other users viewing */
                      farmerObj.mobile && (
                        <a
                          href={`tel:${farmerObj.mobile}`}
                          className="text-xs font-bold bg-[#3b38e4] hover:bg-[#302dc4] text-white px-4 py-2 rounded-xl transition shadow-md shadow-[#3b38e4]/20 flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call {farmerObj.mobile}</span>
                        </a>
                      )
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Post / Edit Requirement Modal ── */}
      <LabourRequirementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        requirement={editingReq}
        user={user}
        onSuccess={fetchMyData}
      />
    </div>
  );
};

export default FarmerLabourRequirements;

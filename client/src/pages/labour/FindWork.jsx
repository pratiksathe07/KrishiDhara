import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Briefcase,
  Search,
  Filter,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Zap,
  RefreshCw,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllLabourRequirements } from "../../services/labourRequirementService";
import { LABOUR_SKILLS } from "../../constants/labourSkills";

const FindWork = ({ user }) => {
  const { t } = useTranslation();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");

  const mySkills = useMemo(() => {
    return user?.labourProfile?.skills || [];
  }, [user]);

  const fetchWork = useCallback(async () => {
    try {
      const res = await getAllLabourRequirements({ status: "active" });
      if (res.data?.success) {
        setRequirements(res.data.data.requirements || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load farm jobs.");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchWork();
    setLoading(false);
  }, [fetchWork]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchWork();
    setRefreshing(false);
    toast.success("Work listings refreshed!");
  };

  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      if (selectedSkill !== "All" && req.workType?.toLowerCase() !== selectedSkill.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = req.title?.toLowerCase().includes(q);
        const matchesWork = req.workType?.toLowerCase().includes(q);
        const matchesVillage = req.location?.village?.toLowerCase().includes(q);
        const matchesTaluka = req.location?.taluka?.toLowerCase().includes(q);
        const matchesDistrict = req.location?.district?.toLowerCase().includes(q);
        const matchesDesc = req.description?.toLowerCase().includes(q);
        return matchesTitle || matchesWork || matchesVillage || matchesTaluka || matchesDistrict || matchesDesc;
      }
      return true;
    });
  }, [requirements, selectedSkill, search]);

  return (
    <div className="space-y-6">
      {/* ── Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b38e4] via-[#4338ca] to-[#6366f1] p-6 sm:p-7 text-white shadow-xl shadow-[#3b38e4]/20 border border-indigo-400/20"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Farmer Work Opportunities</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">
              Find Agricultural Work & Jobs
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm font-medium">
              Browse requirements posted by nearby farmers and contact them directly for work.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center justify-center shrink-0 self-start sm:self-auto"
            title="Refresh listings"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </motion.div>

      {/* ── Filters & Search ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by crop, task, village, taluka, or district..."
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

        {/* Quick skill filter chips matching labour's registered skills */}
        {mySkills.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Your Skills:</span>
            {mySkills.map((sk) => (
              <button
                key={sk}
                onClick={() => setSelectedSkill(selectedSkill === sk ? "All" : sk)}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition border ${
                  selectedSkill === sk
                    ? "bg-[#3b38e4] text-white border-[#3b38e4]"
                    : "bg-slate-50 hover:bg-indigo-50 text-slate-600 border-slate-200"
                }`}
              >
                {sk}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Listings Grid ── */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-sm">
          <RefreshCw className="w-8 h-8 text-[#3b38e4] animate-spin mx-auto mb-3" />
          <p className="text-slate-600 font-bold text-sm">Loading available work...</p>
        </div>
      ) : filteredRequirements.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm">
          <div className="h-16 w-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-4 text-3xl">
            🌾
          </div>
          <h3 className="text-slate-900 font-extrabold text-base sm:text-lg mb-1">
            No active work requirements found
          </h3>
          <p className="text-slate-500 text-xs sm:text-sm max-w-sm mx-auto">
            Farmers post work requirements frequently. Check back soon or clear filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredRequirements.map((req, idx) => {
              const formattedDate = req.startDate
                ? new Date(req.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Immediate";

              const farmerObj = req.farmerId || {};
              const farmerName =
                farmerObj.firstName || farmerObj.lastName
                  ? `${farmerObj.firstName || ""} ${farmerObj.lastName || ""}`.trim()
                  : "Farmer";

              const isUrgent = req.urgency === "urgent";

              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className="bg-white border border-slate-200/90 hover:border-[#3b38e4]/50 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-3 py-1 rounded-xl bg-indigo-50 text-[#3b38e4] border border-indigo-200/80">
                          {req.workType}
                        </span>
                        {isUrgent && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Zap className="w-3 h-3 fill-current text-amber-500" />
                            Urgent ⚡
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Active Requirement
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#3b38e4] transition-colors">
                        {req.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">
                        Farmer: <span className="text-slate-800 font-bold">{farmerName}</span>
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-xs">
                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block mb-0.5">
                          Daily Wage
                        </span>
                        <div className="flex items-center gap-1 text-slate-900 font-extrabold text-sm">
                          <span className="text-emerald-600 font-black">₹{req.wagePerDay}</span>
                          <span className="text-[10px] text-slate-400 font-normal">/day</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 font-bold block mb-0.5">
                          Workers Needed
                        </span>
                        <div className="flex items-center gap-1 text-slate-900 font-bold text-xs">
                          <Users className="w-3.5 h-3.5 text-[#3b38e4]" />
                          <span>{req.laboursNeeded} Labours</span>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <span className="text-[11px] text-slate-400 font-bold block mb-0.5">
                          Start Date & Duration
                        </span>
                        <div className="flex items-center gap-1 text-slate-800 font-medium text-xs">
                          <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{formattedDate}</span>
                          <span className="text-slate-400 font-normal">({req.durationDays} days)</span>
                        </div>
                      </div>
                    </div>

                    {req.location && (
                      <div className="flex items-start gap-1.5 text-xs text-slate-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#3b38e4] mt-0.5 shrink-0" />
                        <span>
                          {[
                            req.location.village,
                            req.location.taluka,
                            req.location.district,
                            req.location.gatNo ? `Gat: ${req.location.gatNo}` : null,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Farm location"}
                        </span>
                      </div>
                    )}

                    {req.description && (
                      <p className="text-xs text-slate-500 bg-slate-50/70 p-2.5 rounded-xl leading-relaxed">
                        {req.description}
                      </p>
                    )}
                  </div>

                  {/* Contact Farmer Button */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-slate-400">
                      {req.createdAt
                        ? `Posted ${new Date(req.createdAt).toLocaleDateString("en-IN")}`
                        : ""}
                    </span>

                    {farmerObj.mobile ? (
                      <a
                        href={`tel:${farmerObj.mobile}`}
                        className="px-4 py-2 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-bold text-xs shadow-md shadow-[#3b38e4]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Farmer ({farmerObj.mobile})</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">Contact through app</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FindWork;

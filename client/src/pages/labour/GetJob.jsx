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
  Sparkles,
  CheckCircle2,
  Compass,
  Navigation,
} from "lucide-react";
import toast from "react-hot-toast";
import { getAllLabourRequirements } from "../../services/labourRequirementService";
import { LABOUR_SKILLS } from "../../constants/labourSkills";

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "Just now";
  const date = new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now - date) / 1000);
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const GetJob = ({ user }) => {
  const { t } = useTranslation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("All");
  const [nearMeOnly, setNearMeOnly] = useState(false);

  const labourAddress = user?.address || "";
  const mySkills = useMemo(() => user?.labourProfile?.skills || [], [user]);

  const fetchPosts = useCallback(async () => {
    try {
      const res = await getAllLabourRequirements({ status: "active" });
      if (res.data?.success) {
        setPosts(res.data.data.requirements || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load job posts.");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchPosts();
    setLoading(false);
  }, [fetchPosts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
    toast.success("Jobs feed refreshed!");
  };

  // Helper to check if post matches labour's location
  const isPostNearLabour = useCallback(
    (post) => {
      if (!labourAddress) return false;
      const addrLower = labourAddress.toLowerCase();
      const loc = post.location || {};
      const districtMatch = loc.district && addrLower.includes(loc.district.toLowerCase());
      const talukaMatch = loc.taluka && addrLower.includes(loc.taluka.toLowerCase());
      const villageMatch = loc.village && addrLower.includes(loc.village.toLowerCase());
      return Boolean(districtMatch || talukaMatch || villageMatch);
    },
    [labourAddress]
  );

  // Filter and sort: near-me posts come first!
  const filteredAndSortedPosts = useMemo(() => {
    const list = posts.filter((post) => {
      // Near me filter
      if (nearMeOnly && !isPostNearLabour(post)) {
        return false;
      }
      // Skill filter
      if (selectedSkill !== "All" && post.workType?.toLowerCase() !== selectedSkill.toLowerCase()) {
        return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesDesc = post.description?.toLowerCase().includes(q);
        const matchesTitle = post.title?.toLowerCase().includes(q);
        const matchesWork = post.workType?.toLowerCase().includes(q);
        const matchesVillage = post.location?.village?.toLowerCase().includes(q);
        const matchesTaluka = post.location?.taluka?.toLowerCase().includes(q);
        const matchesDistrict = post.location?.district?.toLowerCase().includes(q);
        return matchesDesc || matchesTitle || matchesWork || matchesVillage || matchesTaluka || matchesDistrict;
      }
      return true;
    });

    // Sort: Near-me posts first, then newest
    return list.sort((a, b) => {
      const aNear = isPostNearLabour(a);
      const bNear = isPostNearLabour(b);
      if (aNear && !bNear) return -1;
      if (!aNear && bNear) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [posts, nearMeOnly, selectedSkill, search, isPostNearLabour]);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Top Header Banner ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b38e4] via-[#4338ca] to-[#6366f1] p-6 sm:p-7 text-white shadow-xl shadow-[#3b38e4]/20 border border-indigo-400/20"
      >
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Get Job • Daily Agricultural Work</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">
              Farmer Job Posts Near You
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm font-medium">
              Browse labour requirements posted directly by farmers and call them for work.
            </p>
          </div>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center justify-center shrink-0 self-start sm:self-auto"
            title="Refresh feed"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </motion.div>

      {/* ── Location & Skill Filter Bar ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Labour Location Badge & Near Me Toggle */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
            <MapPin className="w-4 h-4 text-[#3b38e4]" />
            <span>Your Area:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-lg truncate max-w-[200px]">
              {labourAddress || "Location set in profile"}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setNearMeOnly(!nearMeOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 border ${
              nearMeOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            <Navigation className="w-3 h-3" />
            <span>{nearMeOnly ? "Showing Near Me" : "Filter Near Me"}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by crop, work, village, or taluka..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] focus:bg-white transition"
          />
        </div>

        {/* Skill Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
          <button
            onClick={() => setSelectedSkill("All")}
            className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition border ${
              selectedSkill === "All"
                ? "bg-[#3b38e4] text-white border-[#3b38e4]"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
            }`}
          >
            All Work
          </button>
          {LABOUR_SKILLS.slice(0, 8).map((sk) => (
            <button
              key={sk}
              onClick={() => setSelectedSkill(selectedSkill === sk ? "All" : sk)}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition border ${
                selectedSkill === sk
                  ? "bg-[#3b38e4] text-white border-[#3b38e4]"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
              }`}
            >
              {sk}
            </button>
          ))}
        </div>
      </div>

      {/* ── Social Feed of Farmer Posts ── */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center shadow-sm">
          <RefreshCw className="w-7 h-7 text-[#3b38e4] animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-xs font-bold">Loading available jobs...</p>
        </div>
      ) : filteredAndSortedPosts.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            🌾
          </div>
          <h3 className="text-slate-900 font-extrabold text-base mb-1">
            No job posts found
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
            {nearMeOnly
              ? "No jobs found specifically in your area right now. Try turning off 'Filter Near Me' to view nearby districts."
              : "Farmers post daily requirements. Check back soon or adjust search filters."}
          </p>
          {nearMeOnly && (
            <button
              onClick={() => setNearMeOnly(false)}
              className="text-xs font-bold text-[#3b38e4] bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100"
            >
              Show All Locations
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredAndSortedPosts.map((post) => {
              const isNear = isPostNearLabour(post);
              const isUrgent = post.urgency === "urgent";
              const farmerObj = post.farmerId || {};
              const farmerName =
                farmerObj.firstName || farmerObj.lastName
                  ? `${farmerObj.firstName || ""} ${farmerObj.lastName || ""}`.trim()
                  : "Farmer";

              const postInitials = `${farmerObj.firstName?.[0] || "F"}${
                farmerObj.lastName?.[0] || ""
              }`.toUpperCase();

              const formattedDate = post.startDate
                ? new Date(post.startDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                  })
                : "Today";

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all ${
                    isNear
                      ? "border-[#3b38e4]/40 bg-gradient-to-b from-indigo-50/20 to-white"
                      : "border-slate-200/90"
                  }`}
                >
                  {/* Post Header: Farmer Info, Location, Proximity Badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#3b38e4] to-[#6366f1] p-0.5 shrink-0 shadow-sm">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[#3b38e4] text-xs overflow-hidden">
                          {farmerObj.profilePicture ? (
                            <img
                              src={farmerObj.profilePicture}
                              alt={farmerName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            postInitials
                          )}
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-slate-900 text-sm truncate">
                            {farmerName}
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                            Farmer
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            • {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>

                        {post.location && (
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate mt-0.5">
                            <MapPin className="w-3 h-3 text-[#3b38e4] shrink-0" />
                            <span>
                              {[post.location.village, post.location.taluka, post.location.district]
                                .filter(Boolean)
                                .join(", ") || "Farm Location"}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Proximity & Urgency Badges */}
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      {isNear && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Near Your Area
                        </span>
                      )}

                      {isUrgent && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Zap className="w-3 h-3 fill-current text-amber-500" />
                          Urgent ⚡
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Post Content (The farmer's words) */}
                  <p className="text-slate-800 text-sm leading-relaxed mb-3.5 whitespace-pre-line font-medium">
                    {post.description || post.title}
                  </p>

                  {/* ── Highlight Attachment Card ── */}
                  <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Work Type
                      </span>
                      <span className="font-extrabold text-[#3b38e4]">
                        🌾 {post.workType}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Daily Wage
                      </span>
                      <span className="font-black text-emerald-600 text-sm">
                        ₹{post.wagePerDay}
                        <span className="text-[10px] text-slate-400 font-normal">/day</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Workers Needed
                      </span>
                      <span className="font-extrabold text-slate-900 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#3b38e4]" />
                        <span>{post.laboursNeeded} Labours</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Start Date
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        📅 {formattedDate} ({post.durationDays || 1}d)
                      </span>
                    </div>
                  </div>

                  {/* Call Farmer Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                    <div className="text-xs text-slate-500 font-medium">
                      {post.location?.gatNo ? (
                        <span>Farm Gat No: {post.location.gatNo}</span>
                      ) : (
                        <span>Direct Farmer Contact</span>
                      )}
                    </div>

                    {farmerObj.mobile ? (
                      <a
                        href={`tel:${farmerObj.mobile}`}
                        className="px-5 py-2.5 rounded-full bg-[#3b38e4] hover:bg-[#302dc4] text-white font-extrabold text-xs shadow-md shadow-[#3b38e4]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
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

export default GetJob;

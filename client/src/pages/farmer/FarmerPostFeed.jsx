import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Send,
  Sparkles,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  MapPin,
  Search,
  Filter,
  CheckCircle2,
  Trash2,
  Edit3,
  Phone,
  Zap,
  RefreshCw,
  MoreVertical,
  Check,
  Share2,
  MessageSquare,
  Bookmark,
  ChevronDown,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getMyLabourRequirements,
  getAllLabourRequirements,
  createLabourRequirement,
  updateLabourRequirement,
  updateLabourRequirementStatus,
  deleteLabourRequirement,
} from "../../services/labourRequirementService";
import { LABOUR_SKILLS } from "../../constants/labourSkills";

// Quick helpers for social post time ago
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

const COMMON_SKILLS = [
  "Harvesting",
  "Plowing",
  "Weeding",
  "Seed Sowing",
  "Fertilizer Application",
  "Pest Control",
  "Fruit Picking",
  "Loading and Unloading",
];

const WAGE_PRESETS = [350, 400, 450, 500, 600];
const LABOUR_PRESETS = [2, 3, 4, 5, 10];

const FarmerPostFeed = ({ user }) => {
  const { t } = useTranslation();

  // Feed tabs: 'feed' (All community posts) or 'my' (My Posts)
  const [activeTab, setActiveTab] = useState("my");

  // Post composer state
  const [description, setDescription] = useState("");
  const [workType, setWorkType] = useState("Harvesting");
  const [laboursNeeded, setLaboursNeeded] = useState(4);
  const [wagePerDay, setWagePerDay] = useState(450);
  const [startDate, setStartDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [durationDays, setDurationDays] = useState(2);
  const [urgency, setUrgency] = useState("normal");
  const [showLocationEdit, setShowLocationEdit] = useState(false);

  // Location fields (pre-filled from farmer's profile)
  const defaultLoc = user?.farmerProfile || {};
  const [village, setVillage] = useState(defaultLoc.village || "");
  const [taluka, setTaluka] = useState(defaultLoc.taluka || "");
  const [district, setDistrict] = useState(defaultLoc.district || "");
  const [gatNo, setGatNo] = useState(defaultLoc.gatNo || "");

  const [posting, setPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [postError, setPostError] = useState(null);

  // Sync location when user loads
  useEffect(() => {
    if (user?.farmerProfile) {
      if (!village && user.farmerProfile.village) setVillage(user.farmerProfile.village);
      if (!taluka && user.farmerProfile.taluka) setTaluka(user.farmerProfile.taluka);
      if (!district && user.farmerProfile.district) setDistrict(user.farmerProfile.district);
      if (!gatNo && user.farmerProfile.gatNo) setGatNo(user.farmerProfile.gatNo);
    }
  }, [user]);

  // Data states
  const [myPosts, setMyPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & filter
  const [search, setSearch] = useState("");
  const [skillFilter, setSkillFilter] = useState("All");

  const fetchMyPosts = useCallback(async () => {
    try {
      const res = await getMyLabourRequirements();
      if (res.data?.success) {
        setMyPosts(res.data.data.requirements || []);
        if (res.data.data.stats) setStats(res.data.data.stats);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load your posts.");
    }
  }, []);

  const fetchAllPosts = useCallback(async () => {
    try {
      const res = await getAllLabourRequirements({ status: "active" });
      if (res.data?.success) {
        setAllPosts(res.data.data.requirements || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load community feed.");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchMyPosts(), fetchAllPosts()]);
    setLoading(false);
  }, [fetchMyPosts, fetchAllPosts]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    toast.success("Feed updated!");
  };

  // Submit new post or update
  const handlePublishPost = async (e) => {
    if (e) e.preventDefault();
    setPostError(null);

    const safeLabours = Number(laboursNeeded) > 0 ? Number(laboursNeeded) : 1;
    const safeWage = Number(wagePerDay) > 0 ? Number(wagePerDay) : 400;
    const safeDate = startDate || new Date().toISOString().split("T")[0];
    const safeWork = workType || "Harvesting";

    // Auto-generate description if user didn't write one
    const finalDescription =
      description.trim() ||
      `Need ${safeLabours} labour${safeLabours > 1 ? "s" : ""} for ${safeWork} work. Daily wage ₹${safeWage}/day. Starting ${safeDate}.`;

    const postTitle = `${safeWork} - ${safeLabours} Labour${safeLabours > 1 ? "s" : ""} Needed`;

    const payload = {
      title: postTitle,
      workType: safeWork,
      laboursNeeded: safeLabours,
      wagePerDay: safeWage,
      wageUnit: "Per day",
      startDate: safeDate,
      durationDays: Number(durationDays) || 1,
      urgency,
      description: finalDescription,
      location: {
        village: (village || "").trim(),
        taluka: (taluka || "").trim(),
        district: (district || "").trim(),
        gatNo: (gatNo || "").trim(),
      },
    };

    setPosting(true);

    try {
      if (editingPostId) {
        await updateLabourRequirement(editingPostId, payload);
        toast.success("Post updated successfully!");
        setEditingPostId(null);
      } else {
        await createLabourRequirement(payload);
        toast.success("Post published! Labours in your area can now see it.");
      }
      // Reset composer
      setDescription("");
      setEditingPostId(null);
      fetchMyPosts();
      fetchAllPosts();
    } catch (err) {
      const errMsg =
        err.response?.data?.message || err.message || "Failed to publish post.";
      setPostError(errMsg);
      toast.error(errMsg);
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setDescription(post.description || post.title || "");
    setWorkType(post.workType || "Harvesting");
    setLaboursNeeded(post.laboursNeeded || 4);
    setWagePerDay(post.wagePerDay || 450);
    setDurationDays(post.durationDays || 2);
    setUrgency(post.urgency || "normal");
    if (post.startDate) {
      setStartDate(new Date(post.startDate).toISOString().split("T")[0]);
    }
    if (post.location) {
      setVillage(post.location.village || "");
      setTaluka(post.location.taluka || "");
      setDistrict(post.location.district || "");
      setGatNo(post.location.gatNo || "");
    }
    // Scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setDescription("");
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === "active" ? "completed" : "active";
    try {
      await updateLabourRequirementStatus(id, nextStatus);
      toast.success(
        nextStatus === "completed"
          ? "Requirement closed (Work Finished)!"
          : "Post reopened as Active!"
      );
      fetchMyPosts();
      fetchAllPosts();
    } catch (err) {
      toast.error(err.message || "Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await deleteLabourRequirement(id);
      toast.success("Post deleted.");
      fetchMyPosts();
      fetchAllPosts();
    } catch (err) {
      toast.error(err.message || "Failed to delete post.");
    }
  };

  // Determine active list to display
  const currentList = activeTab === "my" ? myPosts : allPosts;

  const filteredPosts = useMemo(() => {
    return currentList.filter((item) => {
      if (skillFilter !== "All" && item.workType?.toLowerCase() !== skillFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesDesc = item.description?.toLowerCase().includes(q);
        const matchesTitle = item.title?.toLowerCase().includes(q);
        const matchesWork = item.workType?.toLowerCase().includes(q);
        const matchesVillage = item.location?.village?.toLowerCase().includes(q);
        const matchesDistrict = item.location?.district?.toLowerCase().includes(q);
        return matchesDesc || matchesTitle || matchesWork || matchesVillage || matchesDistrict;
      }
      return true;
    });
  }, [currentList, skillFilter, search]);

  const authorInitials = `${user?.firstName?.[0] || "F"}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Instagram / Twitter Style Post Composer ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-3.5 mb-3.5">
          {/* Farmer Avatar */}
          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#3b38e4] to-[#6366f1] p-0.5 shrink-0 shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[#3b38e4] text-sm overflow-hidden">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                authorInitials
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-sm">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] bg-indigo-50 text-[#3b38e4] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200/80">
                Farmer
              </span>
              {village && (
                <span className="text-xs text-slate-400 font-medium flex items-center gap-0.5">
                  • 📍 {village}, {district}
                </span>
              )}
            </div>

            {/* Main Textarea (Social style) */}
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What labour work do you need done? (e.g. Need 4 workers for cotton picking tomorrow morning, food provided...)"
              className="w-full mt-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-normal leading-relaxed bg-transparent"
              maxLength={600}
            />
          </div>
        </div>

        {/* ── Quick Tags / Pill Selectors ── */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          {/* Work category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Work:</span>
            {COMMON_SKILLS.map((sk) => (
              <button
                key={sk}
                type="button"
                onClick={() => setWorkType(sk)}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition border ${
                  workType === sk
                    ? "bg-[#3b38e4] text-white border-[#3b38e4] shadow-sm shadow-[#3b38e4]/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                {sk}
              </button>
            ))}
          </div>

          {/* Controls Bar: Labours, Wage, Start Date, Urgency */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Labours Needed */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                👷 Workers
              </span>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={laboursNeeded}
                  onChange={(e) => setLaboursNeeded(e.target.value)}
                  className="w-12 bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-[#3b38e4]"
                />
                <span className="text-[11px] font-semibold text-slate-500">labours</span>
              </div>
            </div>

            {/* Wage Per Day */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                💰 Wage / Day
              </span>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  min="100"
                  step="50"
                  value={wagePerDay}
                  onChange={(e) => setWagePerDay(e.target.value)}
                  className="w-16 bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-[#3b38e4]"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5">
              <span className="text-[10px] font-bold text-slate-400 block mb-1">
                📅 Date
              </span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-800 font-bold text-[11px] focus:outline-none focus:border-[#3b38e4]"
              />
            </div>

            {/* Urgency */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 block">
                ⚡ Urgency
              </span>
              <button
                type="button"
                onClick={() => setUrgency(urgency === "normal" ? "urgent" : "normal")}
                className={`w-full py-1 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 border ${
                  urgency === "urgent"
                    ? "bg-amber-500 text-white border-amber-500 shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {urgency === "urgent" ? "Urgent ⚡" : "Normal"}
              </button>
            </div>
          </div>

          {/* Location Bar toggle */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowLocationEdit(!showLocationEdit)}
              className="text-slate-500 hover:text-[#3b38e4] font-medium flex items-center gap-1 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#3b38e4]" />
              <span>
                Location:{" "}
                <span className="font-bold text-slate-700">
                  {[village, taluka, district].filter(Boolean).join(", ") || "Set location"}
                </span>
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {editingPostId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="text-rose-500 hover:underline font-bold text-xs"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {/* Expandable Location Edit Drawer */}
          {showLocationEdit && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs"
            >
              <input
                type="text"
                placeholder="Village"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b38e4]"
              />
              <input
                type="text"
                placeholder="Taluka"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b38e4]"
              />
              <input
                type="text"
                placeholder="District"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b38e4]"
              />
              <input
                type="text"
                placeholder="Gat No"
                value={gatNo}
                onChange={(e) => setGatNo(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b38e4]"
              />
            </motion.div>
          )}

          {postError && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
              <span>⚠️ {postError}</span>
              <button
                type="button"
                onClick={() => setPostError(null)}
                className="text-rose-500 font-bold ml-2 hover:text-rose-700"
              >
                ✕
              </button>
            </div>
          )}

          {/* Post Action Button (Twitter / Insta Share style) */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Labours in your area will see this instantly.
            </span>

            <button
              type="button"
              onClick={handlePublishPost}
              disabled={posting}
              className="px-6 py-2.5 rounded-full bg-[#3b38e4] hover:bg-[#302dc4] text-white font-extrabold text-sm shadow-md shadow-[#3b38e4]/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {posting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Posting...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingPostId ? "Update Post" : "Post"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Feed Segment Navigation (Twitter style tabs) ── */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white rounded-2xl px-4 py-2 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-4">
          <button
            onClick={() => setActiveTab("my")}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 relative ${
              activeTab === "my"
                ? "text-[#3b38e4] bg-indigo-50/70"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>My Posts</span>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full font-extrabold">
              {myPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 relative ${
              activeTab === "feed"
                ? "text-[#3b38e4] bg-indigo-50/70"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>All Posts (Feed)</span>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full font-extrabold">
              {allPosts.length}
            </span>
          </button>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl text-slate-500 hover:text-[#3b38e4] hover:bg-slate-100 transition"
          title="Refresh posts"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* ── Social Feed of Posts ── */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center shadow-sm">
          <RefreshCw className="w-7 h-7 text-[#3b38e4] animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-xs font-bold">Loading feed...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            🌾
          </div>
          <h3 className="text-slate-900 font-extrabold text-base mb-1">
            {activeTab === "my"
              ? "You haven't posted any labour needs yet"
              : "No active posts in the feed"}
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            {activeTab === "my"
              ? "Type in the box above to share what workers you need for your farm."
              : "Check back soon for new farmer posts in your community."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post) => {
              const isOwner =
                user?._id &&
                (post.farmerId?._id === user._id || post.farmerId === user._id);
              const isActive = post.status === "active";
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
                  exit={{ opacity: 0, scale: 0.96 }}
                  className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all ${
                    isActive
                      ? "border-slate-200/90"
                      : "border-slate-200/60 bg-slate-50/60 opacity-80"
                  }`}
                >
                  {/* Post Header: Avatar, Name, Location, Time, Options */}
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
                              {[post.location.village, post.location.district]
                                .filter(Boolean)
                                .join(", ") || "Location"}
                            </span>
                            {post.location.gatNo && (
                              <span className="text-[10px] text-slate-400">
                                (Gat: {post.location.gatNo})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Status & Urgency Badges */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isUrgent && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <Zap className="w-3 h-3 fill-current text-amber-500" />
                          Urgent
                        </span>
                      )}

                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isActive ? "Active" : "Closed"}
                      </span>
                    </div>
                  </div>

                  {/* Post Content / Description (Like tweet text) */}
                  <p className="text-slate-800 text-sm leading-relaxed mb-3.5 whitespace-pre-line font-medium">
                    {post.description || post.title}
                  </p>

                  {/* ── Highlight Details Card (Insta / Tweet Attachment Style) ── */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 rounded-2xl p-3.5 mb-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
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
                        Labours Needed
                      </span>
                      <span className="font-extrabold text-slate-900 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#3b38e4]" />
                        <span>{post.laboursNeeded} workers</span>
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
                        Start & Duration
                      </span>
                      <span className="font-bold text-slate-800 text-[11px]">
                        📅 {formattedDate} ({post.durationDays || 1}d)
                      </span>
                    </div>
                  </div>

                  {/* Post Footer Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Left: Quick stats / info */}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{post.laboursNeeded} needed</span>
                      </span>
                    </div>

                    {/* Right: Actions */}
                    {isOwner ? (
                      <div className="flex items-center gap-2">
                        {/* Toggle active / completed */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(post._id, post.status)}
                          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 border ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                              : "bg-indigo-50 text-[#3b38e4] hover:bg-indigo-100 border-indigo-200"
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{isActive ? "Close Post" : "Reopen"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(post)}
                          className="p-1.5 rounded-xl text-slate-600 hover:text-[#3b38e4] hover:bg-indigo-50 border border-slate-200 transition"
                          title="Edit post"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(post._id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                          title="Delete post"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      farmerObj.mobile && (
                        <a
                          href={`tel:${farmerObj.mobile}`}
                          className="text-xs font-bold bg-[#3b38e4] hover:bg-[#302dc4] text-white px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Farmer ({farmerObj.mobile})</span>
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
    </div>
  );
};

export default FarmerPostFeed;

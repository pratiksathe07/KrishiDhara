import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Send,
  Sparkles,
  Package,
  IndianRupee,
  MapPin,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Phone,
  RefreshCw,
  MoreVertical,
  Check,
  ChevronDown,
  X,
  Store,
  Award,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getDealerRequirements,
  getActiveDealerRequirements,
  createDealerRequirement,
  updateDealerRequirement,
  deleteDealerRequirement,
} from "../../services/dealerService";
import { DEALER_PRODUCTS } from "../../constants/dealerProducts";

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

const COMMON_CROPS = [
  "Wheat",
  "Soybean",
  "Onion",
  "Cotton",
  "Rice / Paddy",
  "Maize / Corn",
  "Tomato",
  "Chickpeas / Gram",
];

const QUANTITY_UNITS = ["Quintal", "Ton", "Kilogram (kg)"];
const PRICE_UNITS = ["Per quintal", "Per ton", "Per kg"];

const DealerPostFeed = ({ user }) => {
  const { t } = useTranslation();

  // Tabs: 'my' (My Buying Requirements) or 'feed' (All Dealer Posts)
  const [activeTab, setActiveTab] = useState("my");

  // Post composer state
  const [crop, setCrop] = useState("Wheat");
  const [quantity, setQuantity] = useState("50");
  const [quantityUnit, setQuantityUnit] = useState("Quintal");
  const [expectedPrice, setExpectedPrice] = useState("2400");
  const [priceUnit, setPriceUnit] = useState("Per quintal");
  const [deliveryLocation, setDeliveryLocation] = useState(user?.address || "");
  const [qualityGrade, setQualityGrade] = useState("Grade A, clean & dry");
  const [notes, setNotes] = useState("");
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  const [posting, setPosting] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);

  // Data states
  const [myPosts, setMyPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All");

  const fetchMyPosts = useCallback(async () => {
    try {
      const res = await getDealerRequirements();
      if (res.data?.success) {
        setMyPosts(res.data.data.requirements || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load your buying posts.");
    }
  }, []);

  const fetchAllPosts = useCallback(async () => {
    try {
      const res = await getActiveDealerRequirements();
      if (res.data?.success) {
        setAllPosts(res.data.data.requirements || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load community posts.");
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
    toast.success("Feed refreshed!");
  };

  const handlePublishPost = async (e) => {
    e.preventDefault();
    if (!crop.trim()) {
      toast.error("Please select or enter the crop name.");
      return;
    }
    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      toast.error("Please enter a valid quantity greater than 0.");
      return;
    }
    const numPrice = parseFloat(expectedPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      toast.error("Please enter a valid purchase price.");
      return;
    }

    setPosting(true);
    const payload = {
      crop: crop.trim(),
      quantity: numQty,
      quantityUnit,
      expectedPrice: numPrice,
      priceUnit,
      deliveryLocation: deliveryLocation.trim(),
      qualityGrade: qualityGrade.trim(),
      notes: notes.trim(),
    };

    try {
      if (editingPostId) {
        await updateDealerRequirement(editingPostId, payload);
        toast.success("Buying requirement updated!");
        setEditingPostId(null);
      } else {
        await createDealerRequirement(payload);
        toast.success("Crop buying post published! Farmers can now see it.");
      }
      setNotes("");
      setEditingPostId(null);
      fetchMyPosts();
      fetchAllPosts();
    } catch (err) {
      toast.error(err.message || "Failed to publish post.");
    } finally {
      setPosting(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPostId(post._id);
    setCrop(post.crop || "Wheat");
    setQuantity(String(post.quantity || "50"));
    setQuantityUnit(post.quantityUnit || "Quintal");
    setExpectedPrice(String(post.expectedPrice || "2400"));
    setPriceUnit(post.priceUnit || "Per quintal");
    setDeliveryLocation(post.deliveryLocation || "");
    setQualityGrade(post.qualityGrade || "");
    setNotes(post.notes || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setNotes("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this buying requirement?")) return;
    try {
      await deleteDealerRequirement(id);
      toast.success("Post removed.");
      fetchMyPosts();
      fetchAllPosts();
    } catch (err) {
      toast.error(err.message || "Failed to delete post.");
    }
  };

  const currentList = activeTab === "my" ? myPosts : allPosts;

  const filteredPosts = useMemo(() => {
    return currentList.filter((item) => {
      if (cropFilter !== "All" && item.crop?.toLowerCase() !== cropFilter.toLowerCase()) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesCrop = item.crop?.toLowerCase().includes(q);
        const matchesLoc = item.deliveryLocation?.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const dealerName = `${item.dealer?.firstName || ""} ${item.dealer?.lastName || ""}`.toLowerCase();
        return matchesCrop || matchesLoc || matchesNotes || dealerName.includes(q);
      }
      return true;
    });
  }, [currentList, cropFilter, search]);

  const dealerInitials = `${user?.firstName?.[0] || "D"}${user?.lastName?.[0] || ""}`.toUpperCase();

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* ── Instagram / Twitter Style Post Composer for Dealer ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all"
      >
        <div className="flex items-start gap-3.5 mb-3.5">
          {/* Dealer Avatar */}
          <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-[#3b38e4] to-[#6366f1] p-0.5 shrink-0 shadow-sm">
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[#3b38e4] text-sm overflow-hidden">
              {user?.profilePicture ? (
                <img
                  src={user.profilePicture}
                  alt={user.firstName}
                  className="w-full h-full object-cover"
                />
              ) : (
                dealerInitials
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-sm">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="text-[10px] bg-indigo-50 text-[#3b38e4] font-extrabold px-2 py-0.5 rounded-full border border-indigo-200/80">
                Dealer
              </span>
              {user?.address && (
                <span className="text-xs text-slate-400 font-medium flex items-center gap-0.5 truncate">
                  • 📍 {user.address}
                </span>
              )}
            </div>

            {/* Note / Message */}
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What agricultural produce do you need to buy? (e.g. Urgent need for 100 Quintals of fresh Soybean. Direct payment on unloading...)"
              className="w-full mt-2 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none resize-none font-normal leading-relaxed bg-transparent"
              maxLength={400}
            />
          </div>
        </div>

        {/* ── Quick Tags / Pill Selectors ── */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          {/* Crop Selection Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 mr-1">Crop:</span>
            {COMMON_CROPS.map((cr) => (
              <button
                key={cr}
                type="button"
                onClick={() => setCrop(cr)}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition border ${
                  crop === cr
                    ? "bg-[#3b38e4] text-white border-[#3b38e4] shadow-sm shadow-[#3b38e4]/20"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
                }`}
              >
                {cr}
              </button>
            ))}
          </div>

          {/* Controls Bar: Quantity, Price, Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {/* Quantity Needed */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  📦 Quantity Needed
                </span>
                <input
                  type="number"
                  min="0.1"
                  step="0.5"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-20 bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-[#3b38e4]"
                />
              </div>

              <select
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
              >
                {QUANTITY_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>

            {/* Expected Purchase Price */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-2.5 flex items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                  💰 Buying Price (₹)
                </span>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    className="w-20 bg-white px-2 py-1 rounded-lg border border-slate-200 text-slate-900 font-extrabold text-sm focus:outline-none focus:border-[#3b38e4]"
                  />
                </div>
              </div>

              <select
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
              >
                {PRICE_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Delivery Area & Quality Grade Toggle */}
          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => setShowExtraDetails(!showExtraDetails)}
              className="text-slate-500 hover:text-[#3b38e4] font-medium flex items-center gap-1 transition"
            >
              <MapPin className="w-3.5 h-3.5 text-[#3b38e4]" />
              <span>
                Area: <span className="font-bold text-slate-700">{deliveryLocation || "Set delivery location"}</span>
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

          {/* Extra Details Drawer */}
          {showExtraDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 text-xs"
            >
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  Delivery Area / Market Yard
                </label>
                <input
                  type="text"
                  placeholder="e.g. APMC Yard, Nashik"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b38e4]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">
                  Quality / Grade Requirements
                </label>
                <input
                  type="text"
                  placeholder="e.g. Grade A, Moisture < 12%"
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-[#3b38e4]"
                />
              </div>
            </motion.div>
          )}

          {/* Post Action Button */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 font-medium">
              Farmers in your area will see this in their feed.
            </span>

            <button
              type="button"
              onClick={handlePublishPost}
              disabled={posting}
              className="px-6 py-2.5 rounded-full bg-[#3b38e4] hover:bg-[#302dc4] text-white font-extrabold text-sm shadow-md shadow-[#3b38e4]/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {posting ? (
                <span>Posting...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{editingPostId ? "Update Post" : "Post Buying Need"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Feed Tabs (Twitter Style) ── */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white rounded-2xl px-4 py-2 shadow-sm">
        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab("my")}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === "my"
                ? "text-[#3b38e4] bg-indigo-50/70"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>My Buying Posts</span>
            <span className="text-[10px] bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-full font-extrabold">
              {myPosts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("feed")}
            className={`py-2 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 ${
              activeTab === "feed"
                ? "text-[#3b38e4] bg-indigo-50/70"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>All Dealer Posts</span>
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

      {/* ── Feed List ── */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center shadow-sm">
          <RefreshCw className="w-7 h-7 text-[#3b38e4] animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-xs font-bold">Loading buying posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            📦
          </div>
          <h3 className="text-slate-900 font-extrabold text-base mb-1">
            {activeTab === "my"
              ? "You haven't posted any crop requirements yet"
              : "No active buying posts in the feed"}
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            {activeTab === "my"
              ? "Post what crops or produce you need to buy and farmers will contact you."
              : "Check back soon for new dealer posts."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredPosts.map((post) => {
              const isOwner =
                user?._id &&
                (post.dealerId?._id === user._id || post.dealerId === user._id || post.dealer?._id === user._id);

              const dealerObj = post.dealer || post.dealerId || {};
              const dealerName =
                dealerObj.firstName || dealerObj.lastName
                  ? `${dealerObj.firstName || ""} ${dealerObj.lastName || ""}`.trim()
                  : "Dealer";

              const postInitials = `${dealerObj.firstName?.[0] || "D"}${
                dealerObj.lastName?.[0] || ""
              }`.toUpperCase();

              return (
                <motion.div
                  key={post._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  {/* Header: Dealer Info, Location, Time */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#3b38e4] to-[#6366f1] p-0.5 shrink-0 shadow-sm">
                        <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[#3b38e4] text-xs overflow-hidden">
                          {dealerObj.profilePicture ? (
                            <img
                              src={dealerObj.profilePicture}
                              alt={dealerName}
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
                            {dealerName}
                          </h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.2 rounded">
                            Dealer
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            • {formatTimeAgo(post.createdAt)}
                          </span>
                        </div>

                        {(post.deliveryLocation || dealerObj.address) && (
                          <p className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate mt-0.5">
                            <MapPin className="w-3 h-3 text-[#3b38e4] shrink-0" />
                            <span>{post.deliveryLocation || dealerObj.address}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Buying
                    </span>
                  </div>

                  {/* Notes / Description */}
                  {post.notes && (
                    <p className="text-slate-800 text-sm leading-relaxed mb-3.5 whitespace-pre-line font-medium">
                      {post.notes}
                    </p>
                  )}

                  {/* Highlight Spec Box */}
                  <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 border border-slate-200/80 rounded-2xl p-3.5 mb-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Crop / Produce
                      </span>
                      <span className="font-extrabold text-[#3b38e4] text-sm">
                        🌾 {post.crop}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Quantity Needed
                      </span>
                      <span className="font-extrabold text-slate-900 flex items-center gap-1">
                        <Package className="w-3.5 h-3.5 text-[#3b38e4]" />
                        <span>
                          {post.quantity} {post.quantityUnit}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Buying Price
                      </span>
                      <span className="font-black text-emerald-600 text-sm">
                        ₹{post.expectedPrice}{" "}
                        <span className="text-[10px] text-slate-400 font-normal">
                          /{post.priceUnit}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                        Quality / Grade
                      </span>
                      <span className="font-bold text-slate-800 text-[11px] truncate block">
                        🏷️ {post.qualityGrade || "Standard"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">
                      {post.deliveryLocation ? `Delivery: ${post.deliveryLocation}` : "APMC Market Yard"}
                    </span>

                    {isOwner ? (
                      <div className="flex items-center gap-2">
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
                      dealerObj.mobile && (
                        <a
                          href={`tel:${dealerObj.mobile}`}
                          className="text-xs font-bold bg-[#3b38e4] hover:bg-[#302dc4] text-white px-4 py-2 rounded-xl transition shadow-sm flex items-center gap-1.5"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call Dealer ({dealerObj.mobile})</span>
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

export default DealerPostFeed;

import { useState, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Search,
  X,
  MapPin,
  CheckCircle2,
  Phone,
  Store,
  RefreshCw,
  Package,
  IndianRupee,
  Calendar,
  Sparkles,
  Navigation,
  ChevronDown,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";
import { getActiveDealerRequirements } from "../../services/dealerService";
import ContactDealerModal from "../../components/farmer/ContactDealerModal";
import { DEALER_PRODUCTS } from "../../constants/dealerProducts";
import { useAuth } from "../../context/AuthContext";

const formatTimeAgo = (dateInput) => {
  if (!dateInput) return "Recently";
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
  "All",
  "Wheat",
  "Soybean",
  "Onion",
  "Cotton",
  "Rice / Paddy",
  "Maize / Corn",
  "Tomato",
  "Chickpeas / Gram",
];

const POPULAR_AREAS = [
  "All Areas",
  "Nashik",
  "Pune",
  "Ahmednagar",
  "Jalgaon",
  "Aurangabad / Chhatrapati Sambhajinagar",
  "Solapur",
  "Nagpur",
  "Amravati",
  "Satara",
  "Kolhapur",
];

const DealerRequirements = ({ embedded = false, limit = null }) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const farmerLoc = user?.farmerProfile || {};
  const farmerDistrict = farmerLoc.district || "";
  const farmerTaluka = farmerLoc.taluka || "";

  // Data states
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [areaFilter, setAreaFilter] = useState("All Areas");
  const [customArea, setCustomArea] = useState("");
  const [nearMeOnly, setNearMeOnly] = useState(false);

  // Contact Modal
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedReqForContact, setSelectedReqForContact] = useState(null);

  const fetchRequirements = useCallback(async () => {
    try {
      const res = await getActiveDealerRequirements();
      if (res.data?.success) {
        setRequirements(res.data.data.requirements || []);
      }
    } catch (err) {
      toast.error(err.message || "Failed to load dealer buying requirements.");
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    await fetchRequirements();
    setLoading(false);
  }, [fetchRequirements]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchRequirements();
    setRefreshing(false);
    toast.success("Dealer posts refreshed!");
  };

  // Helper: check if dealer post is in or near farmer's area
  const isPostNearFarmer = useCallback(
    (req) => {
      if (!farmerDistrict && !farmerTaluka) return false;
      const deliv = (req.deliveryLocation || "").toLowerCase();
      const addr = (req.dealer?.address || "").toLowerCase();
      const fullText = `${deliv} ${addr}`;

      const distMatch = farmerDistrict && fullText.includes(farmerDistrict.toLowerCase());
      const talukaMatch = farmerTaluka && fullText.includes(farmerTaluka.toLowerCase());
      return Boolean(distMatch || talukaMatch);
    },
    [farmerDistrict, farmerTaluka]
  );

  // Filter and sort requirements: near-me posts first!
  const filteredRequirements = useMemo(() => {
    const list = requirements.filter((item) => {
      // Crop filter
      if (selectedCrop !== "All" && item.crop?.toLowerCase() !== selectedCrop.toLowerCase()) {
        return false;
      }

      // Near me filter
      if (nearMeOnly && !isPostNearFarmer(item)) {
        return false;
      }

      // Area Selection Filter
      const activeArea = customArea.trim() || (areaFilter !== "All Areas" ? areaFilter : "");
      if (activeArea) {
        const areaQ = activeArea.toLowerCase();
        const deliv = (item.deliveryLocation || "").toLowerCase();
        const addr = (item.dealer?.address || "").toLowerCase();
        if (!deliv.includes(areaQ) && !addr.includes(areaQ)) {
          return false;
        }
      }

      // Keyword Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const cropMatch = item.crop?.toLowerCase().includes(q);
        const delivMatch = item.deliveryLocation?.toLowerCase().includes(q);
        const notesMatch = item.notes?.toLowerCase().includes(q);
        const dealerName = `${item.dealer?.firstName || ""} ${item.dealer?.lastName || ""}`.toLowerCase();
        return cropMatch || delivMatch || notesMatch || dealerName.includes(q);
      }

      return true;
    });

    // Sort: Near farmer area first, then newest
    const sorted = list.sort((a, b) => {
      const aNear = isPostNearFarmer(a);
      const bNear = isPostNearFarmer(b);
      if (aNear && !bNear) return -1;
      if (!aNear && bNear) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    if (limit && typeof limit === "number") {
      return sorted.slice(0, limit);
    }
    return sorted;
  }, [requirements, selectedCrop, nearMeOnly, areaFilter, customArea, search, limit, isPostNearFarmer]);

  const handleOpenContact = (req) => {
    setSelectedReqForContact(req);
    setContactModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Banner (shown on full page) ── */}
      {!embedded && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b38e4] via-[#4338ca] to-[#6366f1] p-6 sm:p-7 text-white shadow-xl shadow-[#3b38e4]/20 border border-indigo-400/20"
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-wider mb-2">
                <Store className="w-3.5 h-3.5 text-yellow-300" />
                <span>Dealer Buying Feed</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mb-1">
                Dealers Buying Crops Near You
              </h1>
              <p className="text-indigo-100 text-xs sm:text-sm font-medium">
                Verified dealers posting active crop purchase requirements. Connect directly to sell your harvest at the best price.
              </p>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition flex items-center justify-center shrink-0 self-start sm:self-auto"
              title="Refresh posts"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </motion.div>
      )}

      {/* ── Area Selection & Search Filters ── */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Area Selection Row (Highlighted prominently as requested) */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#3b38e4]" />
              <span>Area Filter:</span>
            </span>

            {/* Quick Near Me button if farmer location is known */}
            {farmerDistrict && (
              <button
                type="button"
                onClick={() => {
                  setNearMeOnly(!nearMeOnly);
                  if (!nearMeOnly) {
                    setAreaFilter("All Areas");
                    setCustomArea("");
                  }
                }}
                className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 border ${
                  nearMeOnly
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Navigation className="w-3 h-3" />
                <span>Near My Area ({farmerDistrict})</span>
              </button>
            )}

            {/* Area Dropdown */}
            <div className="relative">
              <select
                value={areaFilter}
                onChange={(e) => {
                  setAreaFilter(e.target.value);
                  setNearMeOnly(false);
                  setCustomArea("");
                }}
                className="bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-800 font-bold focus:outline-none focus:border-[#3b38e4] appearance-none pr-7 cursor-pointer"
              >
                {POPULAR_AREAS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>

            {/* Or custom area input */}
            <input
              type="text"
              placeholder="Or type city/APMC (e.g. Satana)"
              value={customArea}
              onChange={(e) => {
                setCustomArea(e.target.value);
                setAreaFilter("All Areas");
                setNearMeOnly(false);
              }}
              className="px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:border-[#3b38e4] w-48 text-xs"
            />
          </div>

          <span className="text-[11px] font-bold text-slate-400">
            {filteredRequirements.length} posts found
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by crop, dealer name, market yard, or notes..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] focus:bg-white transition"
          />
        </div>

        {/* Crop Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
          {COMMON_CROPS.map((cr) => (
            <button
              key={cr}
              onClick={() => setSelectedCrop(cr)}
              className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition border ${
                selectedCrop === cr
                  ? "bg-[#3b38e4] text-white border-[#3b38e4] shadow-sm shadow-[#3b38e4]/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200"
              }`}
            >
              {cr}
            </button>
          ))}
        </div>
      </div>

      {/* ── Social Feed of Dealer Posts ── */}
      {loading ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-10 text-center shadow-sm">
          <RefreshCw className="w-7 h-7 text-[#3b38e4] animate-spin mx-auto mb-2" />
          <p className="text-slate-500 text-xs font-bold">Loading dealer posts...</p>
        </div>
      ) : filteredRequirements.length === 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center shadow-sm">
          <div className="h-14 w-14 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">
            🏪
          </div>
          <h3 className="text-slate-900 font-extrabold text-base mb-1">
            No dealer buying posts found
          </h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto mb-4">
            {nearMeOnly || customArea || areaFilter !== "All Areas"
              ? "No requirements found for the selected area. Try resetting the area filter to 'All Areas'."
              : "Dealers frequently post new purchase requirements. Check back soon or try searching for another crop."}
          </p>
          {(nearMeOnly || customArea || areaFilter !== "All Areas") && (
            <button
              onClick={() => {
                setNearMeOnly(false);
                setAreaFilter("All Areas");
                setCustomArea("");
                setSelectedCrop("All");
              }}
              className="text-xs font-bold text-[#3b38e4] bg-indigo-50 px-3.5 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-100"
            >
              Reset Area & Show All Posts
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filteredRequirements.map((req, idx) => {
              const isNear = isPostNearFarmer(req);
              const dealer = req.dealer || req.dealerId || {};
              const dealerName =
                dealer.name || `${dealer.firstName || "Verified"} ${dealer.lastName || "Dealer"}`.trim();
              const initials = `${dealer.firstName?.[0] || "D"}${dealer.lastName?.[0] || ""}`.toUpperCase();

              return (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.04 }}
                  className={`bg-white border rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group ${
                    isNear
                      ? "border-[#3b38e4]/40 bg-gradient-to-b from-indigo-50/20 to-white"
                      : "border-slate-200/90"
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header: Dealer Info, Location, Proximity Badge */}
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#3b38e4] to-[#6366f1] p-0.5 shrink-0 shadow-sm">
                          <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-[#3b38e4] text-xs overflow-hidden">
                            {dealer.profilePicture ? (
                              <img
                                src={dealer.profilePicture}
                                alt={dealerName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              initials
                            )}
                          </div>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-extrabold text-slate-900 text-sm truncate">
                              {dealerName}
                            </h4>
                            <span className="text-[10px] bg-indigo-50 text-[#3b38e4] font-bold px-1.5 py-0.2 rounded border border-indigo-200/60">
                              Dealer
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              • {formatTimeAgo(req.createdAt)}
                            </span>
                          </div>

                          {(req.deliveryLocation || dealer.address) && (
                            <p className="text-xs text-slate-500 font-medium flex items-center gap-1 truncate mt-0.5">
                              <MapPin className="w-3 h-3 text-[#3b38e4] shrink-0" />
                              <span>{req.deliveryLocation || dealer.address}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Area Match Badge */}
                      <div className="flex items-center gap-1 shrink-0">
                        {isNear && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Near Your Area
                          </span>
                        )}
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          Buying
                        </span>
                      </div>
                    </div>

                    {/* Dealer Note / Post Message */}
                    {req.notes && (
                      <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-medium bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                        {req.notes}
                      </p>
                    )}

                    {/* Spec Box */}
                    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                          Crop Needed
                        </span>
                        <span className="font-extrabold text-[#3b38e4] text-sm">
                          🌾 {req.crop}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                          Quantity
                        </span>
                        <span className="font-extrabold text-slate-900 flex items-center gap-1">
                          <Package className="w-3.5 h-3.5 text-[#3b38e4]" />
                          <span>
                            {req.quantity} {req.quantityUnit}
                          </span>
                        </span>
                      </div>

                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                          Buying Price
                        </span>
                        <span className="font-black text-emerald-600 text-sm">
                          ₹{req.expectedPrice}{" "}
                          <span className="text-[10px] text-slate-400 font-normal">
                            /{req.priceUnit}
                          </span>
                        </span>
                      </div>
                    </div>

                    {/* Extra specs */}
                    {(req.qualityGrade || req.deliveryLocation) && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-medium">
                        {req.qualityGrade && (
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                            🏷️ Grade: <strong className="text-slate-700">{req.qualityGrade}</strong>
                          </span>
                        )}
                        {req.deliveryLocation && (
                          <span className="bg-slate-100 px-2.5 py-1 rounded-lg">
                            📍 Delivery: <strong className="text-slate-700">{req.deliveryLocation}</strong>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions: Call Dealer + Inquire */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenContact(req)}
                      className="text-xs font-bold text-[#3b38e4] hover:underline"
                    >
                      View Details
                    </button>

                    {dealer.mobile ? (
                      <a
                        href={`tel:${dealer.mobile}`}
                        className="px-5 py-2.5 rounded-full bg-[#3b38e4] hover:bg-[#302dc4] text-white font-extrabold text-xs shadow-md shadow-[#3b38e4]/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call Dealer ({dealer.mobile})</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenContact(req)}
                        className="px-4 py-2 rounded-xl bg-[#3b38e4] text-white text-xs font-bold"
                      >
                        Contact
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* ── Contact Dealer Modal ── */}
      <ContactDealerModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        requirement={selectedReqForContact}
      />
    </div>
  );
};

export default DealerRequirements;

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Search,
  X,
  MapPin,
  CheckCircle2,
  FileText,
  Phone,
  Store,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Sparkles,
  Package,
} from "lucide-react";
import { getActiveDealerRequirements } from "../../services/dealerService";
import ContactDealerModal from "../../components/farmer/ContactDealerModal";

const QUANTITY_UNITS = ["All", "Ton", "Quintal", "Kilogram (kg)"];

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-cyan-600",
  "from-indigo-500 to-violet-600",
  "from-teal-500 to-emerald-600",
];

const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/**
 * RequirementCard
 * Displays a single active dealer crop purchase requirement card.
 */
export const RequirementCard = ({ requirement, onContact, index = 0 }) => {
  const { t } = useTranslation();
  const dealer = requirement.dealer || {};
  const dealerName =
    dealer.name ||
    `${dealer.firstName || "Registered"} ${dealer.lastName || "Dealer"}`.trim();
  const initials = `${dealer.firstName?.[0] || "D"}${dealer.lastName?.[0] || ""}`.toUpperCase();
  const avatarBg = getAvatarColor(dealerName);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg hover:bg-white/15 hover:border-white/30 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* Dealer Header */}
        <div className="flex items-start gap-3.5 mb-4 pb-3 border-b border-white/10">
          <div
            className={`shrink-0 h-11 w-11 rounded-xl bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white font-bold text-base shadow-md`}
          >
            {dealer.profilePicture ? (
              <img
                src={dealer.profilePicture}
                alt={dealerName}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              initials
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-white/50 font-medium">Dealer:</span>
              <h3 className="text-white font-bold text-sm sm:text-base truncate">
                {dealerName}
              </h3>
            </div>
            {dealer.address && (
              <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 shrink-0 text-blue-400" />
                <span className="truncate">{dealer.address}</span>
              </p>
            )}
          </div>

          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Active
          </span>
        </div>

        {/* Crop Badge & Title */}
        <div className="mb-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-blue-500/15 border border-blue-400/25 px-2.5 py-0.5 rounded-full">
            Dealer's Registered Crop
          </span>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xl">🌾</span>
            <h4 className="text-lg font-extrabold text-white tracking-tight">
              {requirement.crop}
            </h4>
          </div>
        </div>

        {/* Core Metrics: Required Quantity & Expected Price */}
        <div className="grid grid-cols-2 gap-2.5 mb-3.5">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[11px] text-white/50 font-medium mb-0.5">Required Quantity</p>
            <p className="text-sm sm:text-base font-bold text-white">
              {requirement.quantity}{" "}
              <span className="text-xs font-normal text-white/70">
                {requirement.quantityUnit}
              </span>
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3">
            <p className="text-[11px] text-white/50 font-medium mb-0.5">Expected Price</p>
            <p className="text-sm sm:text-base font-bold text-emerald-300">
              ₹{requirement.expectedPrice?.toLocaleString()}{" "}
              <span className="text-xs font-normal text-white/70">
                / {requirement.priceUnit?.replace(/^Per\s+/i, "")}
              </span>
            </p>
          </div>
        </div>

        {/* Detailed Preferences: Location, Quality, Notes */}
        <div className="space-y-1.5 text-xs text-white/80 mb-4 bg-white/5 rounded-xl p-3 border border-white/10">
          {requirement.deliveryLocation ? (
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
              <div className="truncate">
                <span className="text-white/50">Preferred Location: </span>
                <span className="font-semibold text-white">{requirement.deliveryLocation}</span>
              </div>
            </div>
          ) : null}

          {requirement.qualityGrade ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="truncate">
                <span className="text-white/50">Quality/Grade: </span>
                <span className="font-semibold text-white">{requirement.qualityGrade}</span>
              </div>
            </div>
          ) : null}

          {requirement.notes ? (
            <div className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-white/50">Notes: </span>
                <span className="font-normal text-white/90">{requirement.notes}</span>
              </div>
            </div>
          ) : null}

          {!requirement.deliveryLocation && !requirement.qualityGrade && !requirement.notes && (
            <p className="text-white/40 italic text-[11px]">
              No additional specifications provided.
            </p>
          )}
        </div>
      </div>

      {/* Card Action: Contact Dealer Button */}
      <div className="pt-3 border-t border-white/10">
        <button
          type="button"
          onClick={() => onContact(requirement)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-500/25 hover:bg-blue-500/40 text-blue-200 hover:text-white border border-blue-400/35 hover:border-blue-400/50 font-semibold text-xs sm:text-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>Contact Dealer</span>
        </button>
      </div>
    </motion.div>
  );
};

/**
 * DealerRequirements
 * Full view with filters, search, and live active requirements cards.
 */
const DealerRequirements = ({ embedded = false, limit = null }) => {
  const { t } = useTranslation();

  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("All");
  const [selectedUnit, setSelectedUnit] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Contact Modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedRequirementForContact, setSelectedRequirementForContact] = useState(null);

  // Fetch from MongoDB
  const fetchRequirements = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const res = await getActiveDealerRequirements();
      if (res.data?.success) {
        setRequirements(res.data.data.requirements || []);
      }
    } catch (err) {
      setError(err.message || "Failed to load active dealer requirements.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  // Extract unique crops present in the active requirements for fast filter chips
  const availableCrops = useMemo(() => {
    const cropSet = new Set(requirements.map((r) => r.crop).filter(Boolean));
    return ["All", ...Array.from(cropSet).sort()];
  }, [requirements]);

  // Filtered requirements
  const filteredRequirements = useMemo(() => {
    return requirements.filter((req) => {
      // 1. Crop filter
      if (selectedCrop !== "All" && req.crop !== selectedCrop) {
        return false;
      }

      // 2. Quantity Unit filter
      if (selectedUnit !== "All" && req.quantityUnit !== selectedUnit) {
        return false;
      }

      // 3. Location filter
      if (locationFilter.trim()) {
        const loc = (req.deliveryLocation || "").toLowerCase();
        if (!loc.includes(locationFilter.trim().toLowerCase())) {
          return false;
        }
      }

      // 4. Search text (crop, dealer name, location, grade, notes)
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const dealerName = `${req.dealer?.firstName || ""} ${req.dealer?.lastName || ""}`.toLowerCase();
        const cropMatch = req.crop?.toLowerCase().includes(q);
        const nameMatch = dealerName.includes(q);
        const locMatch = req.deliveryLocation?.toLowerCase().includes(q);
        const gradeMatch = req.qualityGrade?.toLowerCase().includes(q);
        const notesMatch = req.notes?.toLowerCase().includes(q);

        if (!cropMatch && !nameMatch && !locMatch && !gradeMatch && !notesMatch) {
          return false;
        }
      }

      return true;
    });
  }, [requirements, selectedCrop, selectedUnit, locationFilter, search]);

  const displayedList = limit ? filteredRequirements.slice(0, limit) : filteredRequirements;

  const hasActiveFilters =
    selectedCrop !== "All" ||
    selectedUnit !== "All" ||
    Boolean(locationFilter.trim()) ||
    Boolean(search.trim());

  const clearFilters = () => {
    setSelectedCrop("All");
    setSelectedUnit("All");
    setLocationFilter("");
    setSearch("");
  };

  const handleOpenContact = (req) => {
    setSelectedRequirementForContact(req);
    setContactModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* ── Section Header ── */}
      {!embedded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-gradient-to-r from-blue-500/30 via-indigo-600/25 to-teal-600/20 border border-blue-400/30 rounded-2xl p-6 text-white shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <Store className="w-6 h-6 text-blue-300" />
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight drop-shadow">
                  Dealer Purchase Requirements
                </h1>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-500/25 text-blue-200 border border-blue-400/40">
                  Live Marketplace
                </span>
              </div>
              <p className="text-blue-100/80 text-sm max-w-2xl">
                Discover live crop purchase requirements posted by verified agricultural dealers. Review requested quantities, pricing, and connect directly.
              </p>
            </div>

            <button
              onClick={() => fetchRequirements(true)}
              disabled={refreshing || loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition self-start sm:self-auto disabled:opacity-50"
              title="Refresh latest requirements from database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* When embedded in DashboardHome, show clean section heading */}
      {embedded && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Dealer Purchase Requirements
              </h2>
              <p className="text-xs text-white/60">
                Active purchasing criteria posted by registered dealers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchRequirements(true)}
              disabled={refreshing || loading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition disabled:opacity-50"
              title="Refresh requirements"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      )}

      {/* ── Search & Filter Panel ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 shadow-lg space-y-4"
      >
        {/* Search Bar + Filters Toggle */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search by crop, dealer name, location, grade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowFiltersPanel((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
              showFiltersPanel || hasActiveFilters
                ? "bg-blue-500/25 border-blue-400/40 text-blue-200"
                : "bg-white/10 border-white/20 text-white/80 hover:bg-white/15 hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            )}
          </button>
        </div>

        {/* Collapsible / Quick Filter Chips */}
        <AnimatePresence>
          {(showFiltersPanel || hasActiveFilters || !embedded) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-white/10 space-y-3.5 overflow-hidden"
            >
              {/* Crop Filter Chips */}
              {availableCrops.length > 2 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-blue-300" /> Filter by Crop
                    </p>
                    {selectedCrop !== "All" && (
                      <button
                        onClick={() => setSelectedCrop("All")}
                        className="text-[11px] text-blue-300 hover:underline"
                      >
                        Reset Crop
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {availableCrops.map((c) => {
                      const isActive = selectedCrop === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setSelectedCrop(c)}
                          className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition ${
                            isActive
                              ? "bg-blue-500/30 border-blue-400/60 text-blue-200 shadow-sm"
                              : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {c === "All" ? "All Crops" : `🌾 ${c}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity Unit & Location Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Quantity Unit */}
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Quantity Unit
                  </label>
                  <select
                    value={selectedUnit}
                    onChange={(e) => setSelectedUnit(e.target.value)}
                    className="w-full bg-gray-800/90 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
                  >
                    {QUANTITY_UNITS.map((u) => (
                      <option key={u} value={u} className="bg-gray-800 text-white">
                        {u === "All" ? "All Quantity Units" : u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Delivery Location filter */}
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Delivery Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Filter by city, APMC, or area..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Clear All Filters */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-white/60">
                    Showing matching active requirements
                  </span>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-xs text-red-300 hover:text-red-200 inline-flex items-center gap-1 transition"
                  >
                    <X className="w-3.5 h-3.5" /> Clear All Filters
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── Status Count Header ── */}
      <div className="flex items-center justify-between px-1">
        <p className="text-white/70 text-xs sm:text-sm">
          {loading ? (
            "Loading active requirements..."
          ) : (
            <>
              <span className="font-bold text-white">{filteredRequirements.length}</span>{" "}
              {filteredRequirements.length === 1
                ? "active requirement available"
                : "active requirements available"}
              {hasActiveFilters && (
                <span className="ml-1 text-blue-300 font-medium">
                  (filtered from {requirements.length} total)
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-5 animate-pulse h-64"
            />
          ))}
        </div>
      )}

      {/* ── Error State ── */}
      {!loading && error && (
        <div className="backdrop-blur-xl bg-red-500/15 border border-red-400/30 rounded-2xl p-6 text-center text-red-300">
          <p className="font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => fetchRequirements()}
            className="mt-3 text-xs bg-red-500/30 hover:bg-red-500/50 px-4 py-1.5 rounded-xl text-red-100 font-semibold transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── Empty State ── */}
      {!loading && !error && displayedList.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-12 text-center"
        >
          <p className="text-4xl mb-3">🌾</p>
          <h3 className="text-white font-semibold text-base mb-1">
            {hasActiveFilters
              ? "No requirements matching your filters"
              : "No active purchase requirements posted yet"}
          </h3>
          <p className="text-white/50 text-xs sm:text-sm max-w-md mx-auto">
            {hasActiveFilters
              ? "Try adjusting your search keywords, crop selection, or clearing filters."
              : "Registered dealers have not posted any active crop purchase requirements yet. Check back soon!"}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 text-xs font-semibold bg-blue-500/25 hover:bg-blue-500/40 text-blue-200 border border-blue-400/30 px-4 py-2 rounded-xl transition"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}

      {/* ── Active Requirements Grid ── */}
      {!loading && !error && displayedList.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedList.map((req, i) => (
              <RequirementCard
                key={req._id}
                requirement={req}
                onContact={handleOpenContact}
                index={i}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* ── Contact Dealer Modal ── */}
      <ContactDealerModal
        isOpen={contactModalOpen}
        onClose={() => {
          setContactModalOpen(false);
          setSelectedRequirementForContact(null);
        }}
        requirement={selectedRequirementForContact}
      />
    </div>
  );
};

export default DealerRequirements;

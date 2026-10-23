import { useState, useCallback, useMemo, useRef, useEffect } from "react";
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
  Package,
  AlertCircle,
} from "lucide-react";
import { getActiveDealerRequirements } from "../../services/dealerService";
import ContactDealerModal from "../../components/farmer/ContactDealerModal";
import { DEALER_PRODUCTS } from "../../constants/dealerProducts";

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
 * Search-based discovery of active dealer crop purchase requirements.
 * Does not show requirements by default. Displays results only after a crop search.
 */
const DealerRequirements = ({ embedded = false, limit = null }) => {
  const { t } = useTranslation();

  // Search & results state
  const [search, setSearch] = useState("");
  const [searchedCrop, setSearchedCrop] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchError, setSearchError] = useState("");

  // Filters state
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [qualityGradeFilter, setQualityGradeFilter] = useState("");

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const searchContainerRef = useRef(null);

  // Contact Modal state
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedRequirementForContact, setSelectedRequirementForContact] = useState(null);

  // Autocomplete suggestions based on DEALER_PRODUCTS
  const autocompleteMatches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return DEALER_PRODUCTS.filter((product) =>
      product.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  // Close autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Perform backend search for crop
  const performSearch = useCallback(
    async (cropTerm) => {
      const term = (cropTerm !== undefined ? cropTerm : search).trim();
      if (!term) {
        setSearchError("Please enter a crop name to search.");
        return;
      }

      setSearchError("");
      setShowAutocomplete(false);
      setLoading(true);
      setError(null);
      setHasSearched(true);
      setSearchedCrop(term);
      setSearch(term);

      try {
        const res = await getActiveDealerRequirements({ crop: term });
        if (res.data?.success) {
          setRequirements(res.data.data.requirements || []);
        } else {
          setRequirements([]);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load active dealer requirements. Please try again."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search]
  );

  // Refresh latest data for the currently searched crop
  const handleRefresh = useCallback(async () => {
    if (!hasSearched || !searchedCrop) return;
    setRefreshing(true);
    setError(null);

    try {
      const res = await getActiveDealerRequirements({ crop: searchedCrop });
      if (res.data?.success) {
        setRequirements(res.data.data.requirements || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to refresh requirements. Please try again."
      );
    } finally {
      setRefreshing(false);
    }
  }, [hasSearched, searchedCrop]);

  // Clear search and return to initial empty state
  const handleClearSearch = useCallback(() => {
    setSearch("");
    setSearchedCrop("");
    setHasSearched(false);
    setRequirements([]);
    setSearchError("");
    setError(null);
    setShowAutocomplete(false);
    setSelectedUnit("All");
    setLocationFilter("");
    setQualityGradeFilter("");
  }, []);

  // Filtered requirements: applies only to the searched crop results
  const filteredRequirements = useMemo(() => {
    if (!hasSearched) return [];

    return requirements.filter((req) => {
      // 1. Quantity unit filter
      if (selectedUnit !== "All" && req.quantityUnit !== selectedUnit) {
        return false;
      }

      // 2. Location filter
      if (locationFilter.trim()) {
        const qLoc = locationFilter.trim().toLowerCase();
        const delLoc = (req.deliveryLocation || "").toLowerCase();
        const dealerAddr = (req.dealer?.address || "").toLowerCase();
        if (!delLoc.includes(qLoc) && !dealerAddr.includes(qLoc)) {
          return false;
        }
      }

      // 3. Quality/Grade filter
      if (qualityGradeFilter.trim()) {
        const qGrade = qualityGradeFilter.trim().toLowerCase();
        const grade = (req.qualityGrade || "").toLowerCase();
        if (!grade.includes(qGrade)) {
          return false;
        }
      }

      return true;
    });
  }, [hasSearched, requirements, selectedUnit, locationFilter, qualityGradeFilter]);

  const displayedList = limit ? filteredRequirements.slice(0, limit) : filteredRequirements;

  const hasActiveFilters =
    selectedUnit !== "All" ||
    Boolean(locationFilter.trim()) ||
    Boolean(qualityGradeFilter.trim());

  const clearFilters = () => {
    setSelectedUnit("All");
    setLocationFilter("");
    setQualityGradeFilter("");
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
                Search for a crop to discover active purchase requirements posted by verified agricultural dealers.
              </p>
            </div>

            {hasSearched && (
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition self-start sm:self-auto disabled:opacity-50"
                title="Refresh latest requirements from database"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
                <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Embedded section heading in DashboardHome */}
      {embedded && (
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📋</span>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Dealer Purchase Requirements
              </h2>
              <p className="text-xs text-white/60">
                Search for a crop to view active purchasing criteria posted by registered dealers
              </p>
            </div>
          </div>

          {hasSearched && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing || loading}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white transition disabled:opacity-50"
                title="Refresh requirements"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Search Bar & Filters Trigger ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            performSearch();
          }}
          className="flex flex-col sm:flex-row gap-2.5"
        >
          {/* Search Input with Autocomplete Container */}
          <div ref={searchContainerRef} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by crop (e.g., Cotton, Tomato, Potato)..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSearchError("");
                setShowAutocomplete(true);
              }}
              onFocus={() => {
                if (search.trim().length > 0) {
                  setShowAutocomplete(true);
                }
              }}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition"
            />
            {search && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Autocomplete Dropdown */}
            <AnimatePresence>
              {showAutocomplete && autocompleteMatches.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 top-full mt-2 z-30 backdrop-blur-2xl bg-gray-900/95 border border-white/20 rounded-xl shadow-2xl overflow-hidden py-1.5"
                >
                  <div className="px-3 py-1 text-[11px] font-semibold text-blue-300 uppercase tracking-wider border-b border-white/10">
                    Suggested Crops
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {autocompleteMatches.map((cropName) => (
                      <button
                        key={cropName}
                        type="button"
                        onClick={() => {
                          setSearch(cropName);
                          setShowAutocomplete(false);
                          performSearch(cropName);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs sm:text-sm text-white/90 hover:bg-blue-600/25 hover:text-white flex items-center gap-2.5 transition"
                      >
                        <span className="text-base">🌾</span>
                        <span className="font-medium">{cropName}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition shadow-md shadow-blue-600/30 disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            <span>Search</span>
          </button>

          {/* Filters Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFiltersPanel((prev) => !prev)}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition ${
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
        </form>

        {/* Empty search submitted inline warning */}
        {searchError && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs sm:text-sm">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{searchError}</span>
          </div>
        )}

        {/* ── Filters Panel (Operates on search results) ── */}
        <AnimatePresence>
          {showFiltersPanel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-3 border-t border-white/10 space-y-3.5 overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                {/* Quantity Unit Filter */}
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

                {/* Delivery Location Filter */}
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Delivery Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Filter by city, APMC, area..."
                      value={locationFilter}
                      onChange={(e) => setLocationFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                    />
                  </div>
                </div>

                {/* Quality/Grade Filter */}
                <div>
                  <label className="block text-white/60 text-xs font-semibold uppercase tracking-wider mb-1.5">
                    Quality / Grade
                  </label>
                  <div className="relative">
                    <CheckCircle2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
                    <input
                      type="text"
                      placeholder="Filter by quality or grade..."
                      value={qualityGradeFilter}
                      onChange={(e) => setQualityGradeFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 text-xs focus:outline-none focus:ring-2 focus:ring-blue-400/50 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Clear Filters bar */}
              {hasActiveFilters && (
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-white/60">
                    Filters applied to search results
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

      {/* ── Status Count Header (Shown after search) ── */}
      {hasSearched && !loading && !error && (
        <div className="flex items-center justify-between px-1">
          <p className="text-white/80 text-xs sm:text-sm">
            <span className="font-bold text-white">{filteredRequirements.length}</span>{" "}
            {filteredRequirements.length === 1
              ? "active requirement found"
              : "active requirements found"}{" "}
            for <span className="font-bold text-blue-300">"{searchedCrop}"</span>
            {hasActiveFilters && (
              <span className="ml-1 text-white/50">
                (filtered from {requirements.length} total)
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleClearSearch}
            className="text-xs text-white/60 hover:text-white underline transition"
          >
            Clear Search
          </button>
        </div>
      )}

      {/* ── State 1: Initial Empty State (Before a search has been submitted) ── */}
      {!hasSearched && !loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-10 sm:p-14 text-center"
        >
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-blue-500/15 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-white font-bold text-base sm:text-lg mb-1.5">
            Search for a crop to view dealer purchase requirements.
          </h3>
          <p className="text-white/60 text-xs sm:text-sm max-w-md mx-auto">
            Enter a crop name to find dealers who want to purchase it.
          </p>
        </motion.div>
      )}

      {/* ── State 2: Loading State ── */}
      {loading && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm px-1">
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>Searching dealer requirements for "{searchedCrop || search}"...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-5 animate-pulse h-64"
              />
            ))}
          </div>
        </div>
      )}

      {/* ── State 3: API Failure State ── */}
      {!loading && error && (
        <div className="backdrop-blur-xl bg-red-500/15 border border-red-400/30 rounded-2xl p-6 text-center text-red-300 space-y-3">
          <p className="font-semibold text-sm">{error}</p>
          <button
            type="button"
            onClick={() => performSearch(searchedCrop || search)}
            className="text-xs bg-red-500/30 hover:bg-red-500/50 px-4 py-2 rounded-xl text-red-100 font-semibold transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* ── State 4: No Matching Requirements State ── */}
      {hasSearched && !loading && !error && displayedList.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/5 border border-white/15 rounded-2xl p-10 sm:p-14 text-center"
        >
          <p className="text-4xl mb-3">🌾</p>
          <h3 className="text-white font-bold text-base sm:text-lg mb-1.5">
            No active dealer requirements found for this crop.
          </h3>
          <p className="text-white/55 text-xs sm:text-sm max-w-md mx-auto mb-4">
            {hasActiveFilters
              ? `No requirements match your current filters for "${searchedCrop}". Try clearing or adjusting your filters.`
              : `Registered dealers have not posted active purchase requirements for "${searchedCrop}". Try searching for another crop like Cotton, Tomato, or Potato.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold bg-blue-500/25 hover:bg-blue-500/40 text-blue-200 border border-blue-400/30 px-4 py-2 rounded-xl transition"
              >
                Clear Filters
              </button>
            )}
            <button
              type="button"
              onClick={handleClearSearch}
              className="text-xs font-semibold bg-white/10 hover:bg-white/20 text-white/80 border border-white/20 px-4 py-2 rounded-xl transition"
            >
              Search Another Crop
            </button>
          </div>
        </motion.div>
      )}

      {/* ── State 5: Search Results Cards Grid ── */}
      {hasSearched && !loading && !error && displayedList.length > 0 && (
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

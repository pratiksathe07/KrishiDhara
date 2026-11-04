import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getDealers } from "../../services/userService";
import { Search, X, Store, Package, Phone, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";

// All dealer products (mirrored from server constants)
const ALL_PRODUCTS = [
  "Wheat", "Rice / Paddy", "Maize / Corn", "Jowar / Sorghum",
  "Bajra / Pearl Millet", "Ragi / Finger Millet", "Barley", "Oats",
  "Chickpeas / Gram", "Tur / Pigeon Pea", "Moong / Green Gram",
  "Urad / Black Gram", "Masoor / Lentils", "Soybean", "Groundnut / Peanut",
  "Potato", "Onion", "Tomato", "Cabbage", "Cauliflower", "Carrot",
  "Brinjal / Eggplant", "Okra / Bhindi", "Green Chilli", "Cucumber",
  "Pumpkin", "Garlic", "Ginger", "Spinach",
  "Mango", "Banana", "Apple", "Orange", "Grapes", "Pomegranate",
  "Papaya", "Guava", "Watermelon", "Muskmelon", "Coconut",
  "Sugarcane", "Cotton", "Sunflower", "Mustard", "Sesame",
  "Turmeric", "Cumin", "Coriander", "Red Chilli", "Black Pepper",
  "Tamarind", "Flowers", "Milk", "Eggs", "Honey", "Fodder",
  "Seeds", "Bamboo", "Medicinal Plant",
];

// Avatar gradient palette — blue tones for dealers
const AVATAR_COLORS = [
  "from-blue-400 to-indigo-600",
  "from-cyan-400 to-blue-600",
  "from-violet-400 to-purple-600",
  "from-sky-400 to-cyan-600",
  "from-indigo-400 to-violet-600",
  "from-teal-400 to-cyan-600",
];
const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ─── Dealer Card ──────────────────────────────────────────────────────────────
const DealerCard = ({ dealer, index }) => {
  const { t } = useTranslation();
  const initials = `${dealer.firstName?.[0] ?? "?"}${dealer.lastName?.[0] ?? ""}`.toUpperCase();
  const avatarColor = getAvatarColor(dealer.firstName);
  const products = dealer.dealerProfile?.products ?? [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-[#3b38e4]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div
          className={`flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-md`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-bold text-base truncate">
            {dealer.firstName} {dealer.lastName}
          </h3>
          {dealer.address && (
            <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1 truncate font-medium">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[#3b38e4]" />
              <span className="truncate">{dealer.address}</span>
            </p>
          )}
        </div>

        {/* Product count badge */}
        {products.length > 0 && (
          <span className="flex-shrink-0 text-xs font-bold bg-indigo-50 text-[#3b38e4] border border-indigo-200 px-2.5 py-1 rounded-full shadow-sm">
            {products.length} {products.length > 1 ? t('dashboard.products') : t('dashboard.product')}
          </span>
        )}
      </div>

      {/* Products */}
      {products.length > 0 && (
        <div className="mb-4">
          <p className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-wide">
            {t('dashboard.products')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {products.slice(0, 5).map((product) => (
              <span
                key={product}
                className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[#3b38e4] font-semibold"
              >
                {t(`products.${product}`)}
              </span>
            ))}
            {products.length > 5 && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 font-medium">
                +{products.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
          <Phone className="w-3.5 h-3.5 text-[#3b38e4]" />
          <span>{dealer.mobile}</span>
        </div>
        <button className="text-xs font-bold bg-[#3b38e4] hover:bg-[#302dc4] text-white px-4 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm shadow-[#3b38e4]/20">
          {t('dashboard.contact')}
        </button>
      </div>
    </motion.div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ViewDealers = () => {
  const { t } = useTranslation();
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showAllProducts, setShowAllProducts] = useState(false);

  const fetchDealers = useCallback(async (products) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getDealers(products);
      setDealers(res.data.data.dealers);
    } catch (err) {
      setError(err.message || "Failed to load dealer profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDealers(selectedProducts);
  }, [selectedProducts, fetchDealers]);

  const toggleProduct = (product) => {
    setSelectedProducts((prev) =>
      prev.includes(product) ? prev.filter((p) => p !== product) : [...prev, product]
    );
  };

  const clearFilters = () => {
    setSelectedProducts([]);
    setSearch("");
  };

  // Client-side name search (after server product filter)
  const displayed = dealers.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      d.firstName?.toLowerCase().includes(q) ||
      d.lastName?.toLowerCase().includes(q)
    );
  });

  const visibleProducts = showAllProducts ? ALL_PRODUCTS : ALL_PRODUCTS.slice(0, 16);

  return (
    <div className="space-y-5">
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-[#3b38e4] via-[#4338ca] to-[#6366f1] p-6 text-white shadow-lg shadow-[#3b38e4]/20 border border-indigo-400/20 relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-3 mb-1">
          <Store className="w-6 h-6 text-indigo-200" />
          <h1 className="text-xl sm:text-2xl font-bold">{t('dashboard.dealersTitle')}</h1>
        </div>
        <p className="text-indigo-100 text-sm font-medium relative z-10">
          {t('dashboard.dealersDesc')}
        </p>
      </motion.div>

      {/* Search + Filter panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm"
      >
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={t('dashboard.searchByName')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] transition"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Product filter chips */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[#3b38e4]" /> {t('dashboard.filterByProduct')}
            </p>
            <div className="flex items-center gap-3">
              {selectedProducts.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" /> {t('dashboard.clear')} ({selectedProducts.length})
                </button>
              )}
              <button
                onClick={() => setShowAllProducts((v) => !v)}
                className="text-xs font-bold text-[#3b38e4] hover:text-[#302dc4] transition"
              >
                {showAllProducts ? t('dashboard.showLess') : t('dashboard.showAll')}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {visibleProducts.map((product) => {
                const active = selectedProducts.includes(product);
                return (
                  <motion.button
                    key={product}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => toggleProduct(product)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                      active
                        ? "bg-[#3b38e4] border-[#3b38e4] text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {active && <span className="mr-1">✓</span>}
                    {t(`products.${product}`)}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between px-1">
        <p className="text-slate-600 text-sm font-medium">
          {loading
            ? t('dashboard.loading')
            : `${displayed.length} ${displayed.length !== 1 ? t('dashboard.dealersFound') : t('dashboard.dealerFound')}`}
          {selectedProducts.length > 0 && !loading && (
            <span className="ml-1 text-[#3b38e4] font-bold">
              • {t('dashboard.filteredBy')} {selectedProducts.length} {selectedProducts.length > 1 ? t('dashboard.products') : t('dashboard.product')}
            </span>
          )}
        </p>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse h-44 shadow-sm"
            />
          ))}
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 shadow-sm">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => fetchDealers(selectedProducts)}
            className="mt-3 text-sm text-red-700 font-bold underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && displayed.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-sm"
        >
          <p className="text-4xl mb-3">🏪</p>
          <p className="text-slate-800 font-bold text-base">{t('dashboard.noDealersFound')}</p>
          <p className="text-slate-500 text-sm mt-1">
            {selectedProducts.length > 0
              ? "Try removing some product filters."
              : "No registered dealers yet."}
          </p>
          {selectedProducts.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-bold text-[#3b38e4] hover:text-[#302dc4] underline transition"
            >
              {t('dashboard.clear')}
            </button>
          )}
        </motion.div>
      )}

      {/* Dealer cards grid */}
      {!loading && !error && displayed.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((dealer, i) => (
              <DealerCard key={dealer._id} dealer={dealer} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ViewDealers;

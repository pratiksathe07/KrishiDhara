import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLabours } from "../../services/userService";
import { Search, X, Users, Briefcase, Phone, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

// All possible skills (mirrored from server constants)
const ALL_SKILLS = [
  "Plowing", "Harrowing", "Land Leveling", "Field Cleaning",
  "Seed Sowing", "Seedling Transplanting", "Planting",
  "Irrigation Management", "Watering Crops",
  "Fertilizer Application", "Organic Manure Application", "Compost Application",
  "Weeding", "Thinning", "Hoeing",
  "Pest Control", "Disease Control", "Crop Monitoring",
  "Pruning", "Harvesting", "Fruit Picking", "Vegetable Picking",
  "Crop Cutting", "Threshing", "Grain Drying", "Grain Cleaning",
  "Sorting and Grading", "Weighing and Packing", "Loading and Unloading",
  "Livestock Feeding", "Livestock Herding", "Animal Shed Cleaning",
  "Fence Repair", "Farm Equipment Maintenance", "Tractor Operation",
  "Agricultural Produce Transportation",
];

// Avatar color based on name initial
const AVATAR_COLORS = [
  "from-green-400 to-emerald-600",
  "from-blue-400 to-cyan-600",
  "from-purple-400 to-violet-600",
  "from-orange-400 to-amber-600",
  "from-pink-400 to-rose-600",
  "from-teal-400 to-green-600",
];
const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const LabourCard = ({ labour, index }) => {
  const { t } = useTranslation();
  const initials = `${labour.firstName?.[0] ?? "?"}${labour.lastName?.[0] ?? ""}`.toUpperCase();
  const avatarColor = getAvatarColor(labour.firstName);
  const skills = labour.labourProfile?.skills ?? [];
  const exp = labour.labourProfile?.experienceYears;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:border-[#3b38e4]/50 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header row */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className={`flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-slate-900 font-bold text-base truncate">
            {labour.firstName} {labour.lastName}
          </h3>
          {exp !== undefined && (
            <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1 font-medium">
              <Briefcase className="w-3.5 h-3.5 text-[#3b38e4]" />
              {exp} {exp === 1 ? t('dashboard.yearExp') : t('dashboard.yearsExp')}
            </p>
          )}
        </div>

        {/* Experience badge */}
        {exp !== undefined && (
          <span className="flex-shrink-0 text-xs font-bold bg-indigo-50 text-[#3b38e4] border border-indigo-200 px-2.5 py-1 rounded-full shadow-sm">
            {exp}{t('dashboard.yExpShort')}
          </span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <p className="text-slate-400 text-xs mb-2 font-bold uppercase tracking-wide">{t('dashboard.skills')}</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-700 font-semibold"
              >
                {t(`skills.${skill}`)}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-slate-400 font-medium">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold">
          <Phone className="w-3.5 h-3.5 text-[#3b38e4]" />
          <span>{labour.mobile}</span>
        </div>
        <button className="text-xs font-bold bg-[#3b38e4] hover:bg-[#302dc4] text-white px-4 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm shadow-[#3b38e4]/20">
          {t('dashboard.contact')}
        </button>
      </div>
    </motion.div>
  );
};

const HireLabour = () => {
  const { t } = useTranslation();
  const [labours, setLabours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);

  const fetchLabours = useCallback(async (skills) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLabours(skills);
      setLabours(res.data.data.labours);
    } catch (err) {
      setError(err.message || "Failed to load labour profiles.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch whenever skill filters change
  useEffect(() => {
    fetchLabours(selectedSkills);
  }, [selectedSkills, fetchLabours]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSelectedSkills([]);
    setSearch("");
  };

  // Client-side name search (after server skill filter)
  const displayed = labours.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.firstName?.toLowerCase().includes(q) ||
      l.lastName?.toLowerCase().includes(q)
    );
  });

  const visibleSkills = showAllSkills ? ALL_SKILLS : ALL_SKILLS.slice(0, 16);

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
          <Users className="w-6 h-6 text-indigo-200" />
          <h1 className="text-xl sm:text-2xl font-bold">{t('dashboard.hireLabourTitle')}</h1>
        </div>
        <p className="text-indigo-100 text-sm font-medium relative z-10">
          {t('dashboard.hireLabourDesc')}
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
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Skill filter chips */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">
              {t('dashboard.filterBySkill')}
            </p>
            <div className="flex items-center gap-3">
              {selectedSkills.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-500 hover:text-red-600 font-semibold flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" /> {t('dashboard.clear')} ({selectedSkills.length})
                </button>
              )}
              <button
                onClick={() => setShowAllSkills((v) => !v)}
                className="text-xs font-bold text-[#3b38e4] hover:text-[#302dc4] transition"
              >
                {showAllSkills ? t('dashboard.showLess') : t('dashboard.showAll')}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {visibleSkills.map((skill) => {
                const active = selectedSkills.includes(skill);
                return (
                  <motion.button
                    key={skill}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => toggleSkill(skill)}
                    className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all duration-200 hover:scale-105 active:scale-95 ${
                      active
                        ? "bg-[#3b38e4] border-[#3b38e4] text-white shadow-sm"
                        : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    {active && <span className="mr-1">✓</span>}
                    {t(`skills.${skill}`)}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Results header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-slate-600 text-sm font-medium">
          {loading ? t('dashboard.loading') : `${displayed.length} ${displayed.length !== 1 ? t('dashboard.laboursFound') : t('dashboard.labourFound')}`}
          {selectedSkills.length > 0 && !loading && (
            <span className="ml-1 text-[#3b38e4] font-bold">• {t('dashboard.filteredBy')} {selectedSkills.length} {selectedSkills.length > 1 ? t('dashboard.skills') : t('dashboard.skill')}</span>
          )}
        </p>
      </div>

      {/* States */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white border border-slate-200/80 rounded-2xl p-5 animate-pulse h-44 shadow-sm" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-600 shadow-sm">
          <p className="font-semibold">{error}</p>
          <button
            onClick={() => fetchLabours(selectedSkills)}
            className="mt-3 text-sm text-red-700 font-bold underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border border-slate-200/90 rounded-2xl p-12 text-center shadow-sm"
        >
          <p className="text-4xl mb-3">👷</p>
          <p className="text-slate-800 font-bold text-base">{t('dashboard.noLaboursFound')}</p>
          <p className="text-slate-500 text-sm mt-1">
            {selectedSkills.length > 0
              ? "Try removing some skill filters."
              : "No registered labours yet."}
          </p>
          {selectedSkills.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm font-bold text-[#3b38e4] hover:text-[#302dc4] underline transition"
            >
              {t('dashboard.clear')}
            </button>
          )}
        </motion.div>
      )}

      {!loading && !error && displayed.length > 0 && (
        <AnimatePresence mode="popLayout">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayed.map((labour, i) => (
              <LabourCard key={labour._id} labour={labour} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default HireLabour;

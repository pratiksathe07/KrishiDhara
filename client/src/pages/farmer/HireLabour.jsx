import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getLabours } from "../../services/userService";
import { Search, X, Users, Briefcase, Phone, Star } from "lucide-react";

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
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg hover:bg-white/15 hover:border-white/30 hover:-translate-y-1 transition-all duration-300"
    >
      {/* Header row */}
      <div className="flex items-start gap-4 mb-4">
        {/* Avatar */}
        <div className={`flex-shrink-0 h-12 w-12 rounded-xl bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-lg shadow-md`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-base truncate">
            {labour.firstName} {labour.lastName}
          </h3>
          {exp !== undefined && (
            <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
              <Briefcase className="w-3 h-3" />
              {exp} {exp === 1 ? "year" : "years"} experience
            </p>
          )}
        </div>

        {/* Experience badge */}
        {exp !== undefined && (
          <span className="flex-shrink-0 text-xs font-semibold bg-green-500/20 text-green-300 border border-green-400/30 px-2.5 py-1 rounded-full">
            {exp}y exp
          </span>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <p className="text-white/40 text-xs mb-2 font-medium uppercase tracking-wide">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {skills.slice(0, 6).map((skill) => (
              <span
                key={skill}
                className="text-xs px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/80 font-medium"
              >
                {skill}
              </span>
            ))}
            {skills.length > 6 && (
              <span className="text-xs px-2.5 py-1 rounded-lg bg-white/10 border border-white/20 text-white/50">
                +{skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-white/60 text-xs">
          <Phone className="w-3 h-3" />
          <span>{labour.mobile}</span>
        </div>
        <button className="text-xs font-semibold bg-green-500/20 hover:bg-green-500/35 text-green-300 border border-green-400/30 px-4 py-1.5 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95">
          Contact
        </button>
      </div>
    </motion.div>
  );
};

const HireLabour = () => {
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
        className="backdrop-blur-xl bg-gradient-to-r from-green-500/30 to-emerald-600/20 border border-green-400/30 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 mb-1">
          <Users className="w-6 h-6 text-green-300" />
          <h1 className="text-xl sm:text-2xl font-bold drop-shadow">Hire Labour</h1>
        </div>
        <p className="text-green-100/80 text-sm">
          Browse and contact registered agricultural workers. Filter by skills to find the right fit.
        </p>
      </motion.div>

      {/* Search + Filter panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 shadow-lg"
      >
        {/* Search bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search by name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/35 text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 transition"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Skill filter chips */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-white/60 text-xs font-semibold uppercase tracking-wide">
              Filter by Skill
            </p>
            <div className="flex items-center gap-3">
              {selectedSkills.length > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-300 hover:text-red-200 flex items-center gap-1 transition"
                >
                  <X className="w-3 h-3" /> Clear ({selectedSkills.length})
                </button>
              )}
              <button
                onClick={() => setShowAllSkills((v) => !v)}
                className="text-xs text-green-300 hover:text-green-200 transition"
              >
                {showAllSkills ? "Show less" : "Show all"}
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
                    className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all duration-200 hover:scale-105 active:scale-95 ${
                      active
                        ? "bg-green-500/30 border-green-400/60 text-green-200 shadow-sm"
                        : "bg-white/8 border-white/15 text-white/60 hover:bg-white/15 hover:text-white/90 hover:border-white/30"
                    }`}
                  >
                    {active && <span className="mr-1">✓</span>}
                    {skill}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Results header */}
      <div className="flex items-center justify-between px-1">
        <p className="text-white/60 text-sm">
          {loading ? "Loading…" : `${displayed.length} labour${displayed.length !== 1 ? "s" : ""} found`}
          {selectedSkills.length > 0 && !loading && (
            <span className="ml-1 text-green-300">• filtered by {selectedSkills.length} skill{selectedSkills.length > 1 ? "s" : ""}</span>
          )}
        </p>
      </div>

      {/* States */}
      {loading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-2xl p-5 animate-pulse h-44" />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="backdrop-blur-xl bg-red-500/15 border border-red-400/30 rounded-2xl p-6 text-center text-red-300">
          <p className="font-medium">{error}</p>
          <button
            onClick={() => fetchLabours(selectedSkills)}
            className="mt-3 text-sm text-red-200 underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && displayed.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-2xl p-12 text-center"
        >
          <p className="text-4xl mb-3">👷</p>
          <p className="text-white/60 font-medium">No labours found</p>
          <p className="text-white/40 text-sm mt-1">
            {selectedSkills.length > 0
              ? "Try removing some skill filters."
              : "No registered labours yet."}
          </p>
          {selectedSkills.length > 0 && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-green-300 hover:text-green-200 underline transition"
            >
              Clear all filters
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

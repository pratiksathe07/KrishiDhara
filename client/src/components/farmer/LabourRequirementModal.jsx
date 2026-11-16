import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Briefcase,
  Users,
  IndianRupee,
  Calendar,
  Clock,
  MapPin,
  AlertCircle,
  Sparkles,
  Zap,
  CheckCircle2,
  FileText,
} from "lucide-react";
import toast from "react-hot-toast";
import { LABOUR_SKILLS } from "../../constants/labourSkills";
import {
  createLabourRequirement,
  updateLabourRequirement,
} from "../../services/labourRequirementService";

const COMMON_SUGGESTIONS = [
  "Harvesting Work",
  "Plowing & Land Preparation",
  "Weeding & Hoeing",
  "Seed Sowing & Planting",
  "Fertilizer & Spraying",
  "Loading & Produce Transport",
];

const LabourRequirementModal = ({
  isOpen,
  onClose,
  requirement = null,
  user = null,
  onSuccess,
}) => {
  const isEditing = Boolean(requirement?._id);

  const [title, setTitle] = useState("");
  const [workType, setWorkType] = useState(LABOUR_SKILLS[0]);
  const [laboursNeeded, setLaboursNeeded] = useState("2");
  const [wagePerDay, setWagePerDay] = useState("450");
  const [wageUnit, setWageUnit] = useState("Per day");
  const [startDate, setStartDate] = useState("");
  const [durationDays, setDurationDays] = useState("2");
  const [urgency, setUrgency] = useState("normal");
  const [description, setDescription] = useState("");

  // Location fields
  const [village, setVillage] = useState("");
  const [taluka, setTaluka] = useState("");
  const [district, setDistrict] = useState("");
  const [gatNo, setGatNo] = useState("");
  const [landmark, setLandmark] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Tomorrow as default min date
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (requirement) {
      setTitle(requirement.title || "");
      setWorkType(requirement.workType || LABOUR_SKILLS[0]);
      setLaboursNeeded(String(requirement.laboursNeeded || "2"));
      setWagePerDay(String(requirement.wagePerDay || "450"));
      setWageUnit(requirement.wageUnit || "Per day");
      setStartDate(
        requirement.startDate
          ? new Date(requirement.startDate).toISOString().split("T")[0]
          : todayStr
      );
      setDurationDays(String(requirement.durationDays || "1"));
      setUrgency(requirement.urgency || "normal");
      setDescription(requirement.description || "");

      const loc = requirement.location || {};
      setVillage(loc.village || "");
      setTaluka(loc.taluka || "");
      setDistrict(loc.district || "");
      setGatNo(loc.gatNo || "");
      setLandmark(loc.landmark || "");
    } else {
      // Default new form state
      setTitle("");
      setWorkType(LABOUR_SKILLS[0]);
      setLaboursNeeded("2");
      setWagePerDay("450");
      setWageUnit("Per day");
      setStartDate(todayStr);
      setDurationDays("2");
      setUrgency("normal");
      setDescription("");

      // Pre-fill location from farmer profile if available
      const fProfile = user?.farmerProfile || {};
      setVillage(fProfile.village || "");
      setTaluka(fProfile.taluka || "");
      setDistrict(fProfile.district || "");
      setGatNo(fProfile.gatNo || "");
      setLandmark("");
    }
    setFormError("");
  }, [requirement, user, isOpen, todayStr]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!title.trim()) {
      setFormError("Please enter a title for the work requirement.");
      return;
    }

    if (!workType.trim()) {
      setFormError("Please select the required work category.");
      return;
    }

    const numLabours = parseInt(laboursNeeded, 10);
    if (isNaN(numLabours) || numLabours < 1) {
      setFormError("Please specify at least 1 labour needed.");
      return;
    }

    const numWage = parseFloat(wagePerDay);
    if (isNaN(numWage) || numWage <= 0) {
      setFormError("Please enter a valid wage amount greater than 0.");
      return;
    }

    if (!startDate) {
      setFormError("Please select the work start date.");
      return;
    }

    const numDuration = parseInt(durationDays, 10);
    if (isNaN(numDuration) || numDuration < 1) {
      setFormError("Work duration must be at least 1 day.");
      return;
    }

    setLoading(true);

    const payload = {
      title: title.trim(),
      workType: workType.trim(),
      laboursNeeded: numLabours,
      wagePerDay: numWage,
      wageUnit,
      startDate,
      durationDays: numDuration,
      urgency,
      description: description.trim(),
      location: {
        village: village.trim(),
        taluka: taluka.trim(),
        district: district.trim(),
        gatNo: gatNo.trim(),
        landmark: landmark.trim(),
      },
    };

    try {
      if (isEditing) {
        await updateLabourRequirement(requirement._id, payload);
        toast.success("Labour requirement updated successfully!");
      } else {
        await createLabourRequirement(payload);
        toast.success("Labour requirement posted! Labours can now view it.");
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      const msg = err.message || "Failed to save requirement.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 my-8 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#3b38e4] to-[#514deb] p-6 text-white shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight">
                    {isEditing ? "Edit Labour Requirement" : "Post Labour Requirement"}
                  </h2>
                  <p className="text-xs text-indigo-100 font-medium">
                    {isEditing
                      ? "Update requirement details and workers needed"
                      : "Find skilled agricultural workers for your farm tasks"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
                <span>{formError}</span>
              </motion.div>
            )}

            {/* Title & Quick Suggestions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 5 Workers needed for Cotton Harvesting"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] text-sm text-slate-800 placeholder-slate-400 font-medium transition"
                maxLength={120}
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 font-semibold self-center mr-1">
                  Suggestions:
                </span>
                {COMMON_SUGGESTIONS.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setTitle(sug)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-[#3b38e4] hover:border-indigo-200 border border-slate-200 text-slate-600 font-medium transition"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            </div>

            {/* Work Category / Skill & Urgency */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Category / Skill Required <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] text-sm text-slate-800 font-semibold bg-white appearance-none cursor-pointer"
                    required
                  >
                    {LABOUR_SKILLS.map((skill) => (
                      <option key={skill} value={skill}>
                        {skill}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                    ▼
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency("normal")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      urgency === "normal"
                        ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Normal
                  </button>
                  <button
                    type="button"
                    onClick={() => setUrgency("urgent")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      urgency === "urgent"
                        ? "bg-amber-500 text-white border-amber-500 shadow-sm shadow-amber-500/20"
                        : "bg-white text-amber-700 border-amber-200 hover:bg-amber-50"
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-current" /> Urgent ⚡
                  </button>
                </div>
              </div>
            </div>

            {/* Workers Count & Daily Wage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Number of Labours Needed <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setLaboursNeeded((prev) =>
                        String(Math.max(1, (parseInt(prev, 10) || 1) - 1))
                      )
                    }
                    className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 font-bold transition text-base shrink-0"
                  >
                    -
                  </button>
                  <div className="relative flex-1">
                    <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                    <input
                      type="number"
                      min="1"
                      max="500"
                      value={laboursNeeded}
                      onChange={(e) => setLaboursNeeded(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] text-sm text-slate-800 font-bold"
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setLaboursNeeded((prev) =>
                        String((parseInt(prev, 10) || 1) + 1)
                      )
                    }
                    className="h-10 w-10 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 flex items-center justify-center text-slate-700 font-bold transition text-base shrink-0"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Daily Wage (₹ per worker) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="10"
                    value={wagePerDay}
                    onChange={(e) => setWagePerDay(e.target.value)}
                    placeholder="450"
                    className="w-full pl-8 pr-20 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] text-sm text-slate-800 font-bold"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    / day
                  </span>
                </div>
              </div>
            </div>

            {/* Start Date & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Work Start Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="date"
                    min={todayStr}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] text-sm text-slate-800 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Duration (Days) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={durationDays}
                    onChange={(e) => setDurationDays(e.target.value)}
                    className="w-full pl-10 pr-16 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] text-sm text-slate-800 font-medium"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    days
                  </span>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <MapPin className="w-4 h-4 text-[#3b38e4]" />
                  <span>Farm Location Details</span>
                </div>
                {user?.farmerProfile && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Pre-filled from profile
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Village</label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="Village name"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#3b38e4]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Taluka</label>
                  <input
                    type="text"
                    value={taluka}
                    onChange={(e) => setTaluka(e.target.value)}
                    placeholder="Taluka"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#3b38e4]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="District"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#3b38e4]"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Gat No / Farm</label>
                  <input
                    type="text"
                    value={gatNo}
                    onChange={(e) => setGatNo(e.target.value)}
                    placeholder="e.g. 104/2"
                    className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#3b38e4]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-xs font-semibold mb-1">
                  Landmark / Specific Directions
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Hanuman temple, North gate road"
                  className="w-full px-3 py-2 bg-white rounded-lg border border-slate-200 text-xs text-slate-800 font-medium focus:outline-none focus:border-[#3b38e4]"
                />
              </div>
            </div>

            {/* Description / Instructions */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Description & Facilities Provided
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mention work timings (e.g. 8 AM - 5 PM), food/tea provision, tools needed, or any specific instructions for labours..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 focus:border-[#3b38e4] text-xs text-slate-800 placeholder-slate-400 font-medium transition resize-none"
                maxLength={1000}
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-bold text-sm shadow-md shadow-[#3b38e4]/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <span>Saving...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{isEditing ? "Update Requirement" : "Publish Requirement"}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default LabourRequirementModal;

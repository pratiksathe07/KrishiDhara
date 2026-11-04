import { useState, useEffect } from "react";
import { X, Loader2, Save, Sparkles, MapPin, Award, FileText } from "lucide-react";
import toast from "react-hot-toast";
import {
  createDealerRequirement,
  updateDealerRequirement,
} from "../../services/dealerService";

const QUANTITY_UNITS = ["Ton", "Quintal", "Kilogram (kg)"];
const PRICE_UNITS = ["Per ton", "Per quintal", "Per kg"];

/**
 * RequirementModal — Modal to configure or edit purchase requirements
 * for a crop already selected during registration.
 * Crop is fixed and automatically displayed (no crop dropdown).
 */
const RequirementModal = ({
  isOpen,
  onClose,
  crop,
  requirement = null,
  onSuccess,
}) => {
  const isEditing = Boolean(requirement?._id);

  const [quantity, setQuantity] = useState("");
  const [quantityUnit, setQuantityUnit] = useState("Quintal");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [priceUnit, setPriceUnit] = useState("Per quintal");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [qualityGrade, setQualityGrade] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Populate form fields on open or requirement change
  useEffect(() => {
    if (requirement) {
      setQuantity(requirement.quantity !== undefined ? String(requirement.quantity) : "");
      setQuantityUnit(requirement.quantityUnit || "Quintal");
      setExpectedPrice(requirement.expectedPrice !== undefined ? String(requirement.expectedPrice) : "");
      setPriceUnit(requirement.priceUnit || "Per quintal");
      setDeliveryLocation(requirement.deliveryLocation || "");
      setQualityGrade(requirement.qualityGrade || "");
      setNotes(requirement.notes || "");
    } else {
      // Default initial state
      setQuantity("");
      setQuantityUnit("Quintal");
      setExpectedPrice("");
      setPriceUnit("Per quintal");
      setDeliveryLocation("");
      setQualityGrade("");
      setNotes("");
    }
    setFormError("");
  }, [requirement, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const numQty = parseFloat(quantity);
    if (isNaN(numQty) || numQty <= 0) {
      setFormError("Please enter a valid quantity greater than 0.");
      return;
    }

    const numPrice = parseFloat(expectedPrice);
    if (isNaN(numPrice) || numPrice <= 0) {
      setFormError("Please enter a valid expected purchase price greater than 0.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        crop,
        quantity: numQty,
        quantityUnit,
        expectedPrice: numPrice,
        priceUnit,
        deliveryLocation: deliveryLocation.trim(),
        qualityGrade: qualityGrade.trim(),
        notes: notes.trim(),
      };

      if (isEditing) {
        const res = await updateDealerRequirement(requirement._id, payload);
        toast.success(res.data?.message || `Updated requirement for ${crop}!`);
      } else {
        const res = await createDealerRequirement(payload);
        toast.success(res.data?.message || `Purchase requirement for ${crop} created!`);
      }

      onSuccess();
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-800 my-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-[#3b38e4] bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 rounded-full">
              {isEditing ? "Edit Requirement" : "New Requirement"}
            </span>
            <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2 text-slate-900">
              <span>🌾</span>
              <span>{isEditing ? `Update ${crop}` : `Configure ${crop}`}</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Registered Crop Notice */}
        <div className="my-4 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-indigo-600 font-semibold">Target Registered Crop</p>
            <p className="text-base font-bold text-slate-900 flex items-center gap-1.5 mt-0.5">
              <span>🌱</span> {crop}
            </p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-bold">
            Registered Crop
          </span>
        </div>

        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm font-medium">
            {formError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Quantity + Unit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="req-quantity" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Required Quantity <span className="text-red-500">*</span>
              </label>
              <input
                id="req-quantity"
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 50"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition"
              />
            </div>

            <div>
              <label htmlFor="req-qty-unit" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quantity Unit <span className="text-red-500">*</span>
              </label>
              <select
                id="req-qty-unit"
                value={quantityUnit}
                onChange={(e) => setQuantityUnit(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition"
              >
                {QUANTITY_UNITS.map((u) => (
                  <option key={u} value={u} className="bg-white text-slate-800">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Expected Price + Price Unit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="req-price" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Expected Purchase Price (₹) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₹</span>
                <input
                  id="req-price"
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="e.g. 5000"
                  value={expectedPrice}
                  onChange={(e) => setExpectedPrice(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition"
                />
              </div>
            </div>

            <div>
              <label htmlFor="req-price-unit" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Price Unit <span className="text-red-500">*</span>
              </label>
              <select
                id="req-price-unit"
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition"
              >
                {PRICE_UNITS.map((u) => (
                  <option key={u} value={u} className="bg-white text-slate-800">
                    {u}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preferred Delivery Location (Optional) */}
          <div>
            <label htmlFor="req-location" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Delivery Location <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="req-location"
                type="text"
                placeholder="e.g. APMC Market Yard, Solapur or Farm Pickup"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                maxLength={200}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition"
              />
            </div>
          </div>

          {/* Quality / Grade Requirements (Optional) */}
          <div>
            <label htmlFor="req-quality" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Quality / Grade Requirements <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <Award className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                id="req-quality"
                type="text"
                placeholder="e.g. Moisture < 10%, Grade A, Clean seed"
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                maxLength={200}
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition"
              />
            </div>
          </div>

          {/* Additional Notes (Optional) */}
          <div>
            <label htmlFor="req-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="req-notes"
              rows={2}
              placeholder="e.g. Immediate payment upon inspection, packaging details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/20 focus:border-[#3b38e4] transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-sm font-semibold transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="save-requirement-btn"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white text-sm font-semibold shadow-md shadow-[#3b38e4]/25 transition disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEditing ? "Save Changes" : "Create Requirement"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequirementModal;

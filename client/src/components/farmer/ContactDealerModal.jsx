import { X, Phone, Mail, MapPin, Package, Award, FileText, CheckCircle2, MessageSquare, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";

const AVATAR_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-sky-500 to-cyan-600",
  "from-indigo-500 to-violet-600",
];

const getAvatarColor = (name = "") =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

/**
 * ContactDealerModal
 * Modal to display dealer contact information for a specific crop requirement.
 * Adheres strictly to the requirement:
 * - Identifies the dealer and the associated crop requirement
 * - Shows available verified contact details (phone, email, address)
 * - Explicitly communicates that in-app messaging is not yet implemented (no fake chat interface)
 */
const ContactDealerModal = ({ isOpen, onClose, requirement }) => {
  const { t } = useTranslation();

  if (!isOpen || !requirement) return null;

  const dealer = requirement.dealer || {};
  const dealerName = dealer.name || `${dealer.firstName || "Registered"} ${dealer.lastName || "Dealer"}`.trim();
  const initials = `${dealer.firstName?.[0] || "D"}${dealer.lastName?.[0] || ""}`.toUpperCase();
  const avatarBg = getAvatarColor(dealerName);

  const emailSubject = encodeURIComponent(
    `KrishiDhara Inquiry: Crop Purchase Requirement for ${requirement.crop}`
  );
  const emailBody = encodeURIComponent(
    `Hello ${dealer.firstName || "Dealer"},\n\nI saw your active purchase requirement for ${requirement.crop} on the KrishiDhara portal:\n` +
      `- Required Quantity: ${requirement.quantity} ${requirement.quantityUnit}\n` +
      `- Expected Price: ₹${requirement.expectedPrice} / ${requirement.priceUnit?.replace(/^Per\s+/i, "")}\n` +
      (requirement.deliveryLocation ? `- Preferred Location: ${requirement.deliveryLocation}\n` : "") +
      `\nI am interested in supplying this crop. Please let me know how we can proceed.\n\nThank you!`
  );

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg backdrop-blur-2xl bg-gray-900/95 border border-white/20 rounded-3xl shadow-2xl p-6 sm:p-7 text-white my-8 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-blue-300 bg-blue-500/20 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                Dealer Contact
              </span>
              <h2 className="text-xl font-bold mt-1.5 flex items-center gap-2">
                <span>🏪</span>
                <span>Contact Dealer</span>
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Dealer Identification Card */}
          <div className="my-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-4">
            <div
              className={`shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarBg} flex items-center justify-center text-white text-lg font-bold shadow-md`}
            >
              {dealer.profilePicture ? (
                <img
                  src={dealer.profilePicture}
                  alt={dealerName}
                  className="w-full h-full object-cover rounded-2xl"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white truncate">{dealerName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                  Verified Dealer
                </span>
              </div>
              {dealer.address ? (
                <p className="text-xs text-white/60 mt-1 flex items-center gap-1.5 truncate">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-400" />
                  <span className="truncate">{dealer.address}</span>
                </p>
              ) : (
                <p className="text-xs text-white/40 mt-1 italic">Location details not provided</p>
              )}
            </div>
          </div>

          {/* Associated Crop Requirement Summary */}
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-emerald-950/30 to-gray-900/40 border border-blue-400/25">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wide flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Associated Crop Requirement
              </span>
              <span className="text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🌾</span>
              <div>
                <h4 className="text-base font-extrabold text-white">{requirement.crop}</h4>
                <p className="text-xs text-white/60">Registered crop purchase inquiry</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-white/50 block text-[11px]">Required Quantity</span>
                <span className="font-bold text-white text-sm">
                  {requirement.quantity} {requirement.quantityUnit}
                </span>
              </div>

              <div className="bg-white/5 rounded-xl p-2.5 border border-white/10">
                <span className="text-white/50 block text-[11px]">Expected Price</span>
                <span className="font-bold text-emerald-300 text-sm">
                  ₹{requirement.expectedPrice?.toLocaleString()} / {requirement.priceUnit?.replace(/^Per\s+/i, "")}
                </span>
              </div>
            </div>

            {(requirement.deliveryLocation || requirement.qualityGrade || requirement.notes) && (
              <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1.5 text-xs text-white/80">
                {requirement.deliveryLocation && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="text-white/50">Delivery Location:</span>
                    <span className="font-medium text-white truncate">{requirement.deliveryLocation}</span>
                  </div>
                )}
                {requirement.qualityGrade && (
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-white/50">Quality Grade:</span>
                    <span className="font-medium text-white truncate">{requirement.qualityGrade}</span>
                  </div>
                )}
                {requirement.notes && (
                  <div className="flex items-start gap-1.5">
                    <FileText className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-white/50">Notes: </span>
                      <span className="font-medium text-white">{requirement.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Messaging Notice */}
          <div className="mb-5 p-3.5 rounded-2xl bg-blue-500/10 border border-blue-400/20 flex items-start gap-2.5 text-xs text-blue-200">
            <MessageSquare className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-blue-100">In-App Messaging Status</p>
              <p className="text-blue-200/80 mt-0.5">
                Direct in-app messaging is currently under development. You can directly call or email this dealer using the verified contact details below.
              </p>
            </div>
          </div>

          {/* Contact Actions Grid */}
          <div className="space-y-3">
            {/* Phone Call */}
            {dealer.mobile ? (
              <a
                href={`tel:${dealer.mobile}`}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/30 text-white font-semibold text-sm transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-200 group-hover:scale-105 transition">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[11px] text-emerald-300 font-medium">Direct Phone Call</p>
                    <p className="text-sm font-bold text-white">+91 {dealer.mobile}</p>
                  </div>
                </div>
                <span className="text-xs bg-emerald-500/40 px-3 py-1.5 rounded-xl border border-emerald-400/40 text-emerald-100 font-semibold group-hover:bg-emerald-500/60 transition">
                  Call Now ↗
                </span>
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 text-white/50 text-xs italic">
                Phone number not made public by this dealer.
              </div>
            )}

            {/* Email */}
            {dealer.email ? (
              <a
                href={`mailto:${dealer.email}?subject=${emailSubject}&body=${emailBody}`}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 text-white font-semibold text-sm transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/30 border border-blue-400/40 flex items-center justify-center text-blue-200 group-hover:scale-105 transition">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-blue-300 font-medium">Email Dealer</p>
                    <p className="text-sm font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                      {dealer.email}
                    </p>
                  </div>
                </div>
                <span className="text-xs bg-blue-500/40 px-3 py-1.5 rounded-xl border border-blue-400/40 text-blue-100 font-semibold group-hover:bg-blue-500/60 transition shrink-0">
                  Send Email ↗
                </span>
              </a>
            ) : (
              <div className="p-3 rounded-xl bg-white/5 text-white/50 text-xs italic">
                Email address not available.
              </div>
            )}
          </div>

          {/* Close button */}
          <div className="mt-5 pt-4 border-t border-white/10 text-right">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ContactDealerModal;

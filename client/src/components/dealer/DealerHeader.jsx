import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import DealerProfileDropdown from "./DealerProfileDropdown";

const DealerHeader = ({ showBackToDashboard = false }) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/95 border-b border-slate-200/80 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dealer/dashboard" className="flex items-center gap-2 group">
            <div className="px-5 py-2.5 rounded-xl bg-[#3b38e4] hover:bg-[#302dc4] text-white font-bold text-sm shadow-md shadow-[#3b38e4]/25 hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5">
              <img src="/logo.png" alt="KrishiDhara Logo" className="h-5 w-auto object-contain" />
            </div>
          </Link>
          <span className="hidden sm:inline-block text-xs font-bold bg-indigo-50 text-[#3b38e4] rounded-full px-3 py-1 border border-indigo-200/80 shadow-sm">
            • {t("register.dealer", "Dealer")}
          </span>

          {showBackToDashboard && (
            <Link
              to="/dealer/dashboard"
              className="text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-xl transition border border-slate-200 hidden md:inline-flex items-center gap-1.5 font-semibold"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher light={true} />
          <DealerProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default DealerHeader;

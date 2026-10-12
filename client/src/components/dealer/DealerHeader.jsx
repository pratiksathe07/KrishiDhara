import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import DealerProfileDropdown from "./DealerProfileDropdown";

const DealerHeader = ({ showBackToDashboard = false }) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/dealer/dashboard" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="KrishiDhara Logo"
              className="h-14 w-auto object-contain rounded-lg drop-shadow-md group-hover:scale-105 transition-transform duration-200"
            />
          </Link>
          <span className="hidden sm:inline-block text-xs font-semibold bg-blue-500/20 text-blue-300 rounded-full px-3 py-1 border border-blue-400/30">
            {t("register.dealer", "Dealer")}
          </span>

          {showBackToDashboard && (
            <Link
              to="/dealer/dashboard"
              className="text-xs text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl transition border border-white/10 hidden md:inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Back to Dashboard</span>
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <DealerProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default DealerHeader;

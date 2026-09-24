import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { motion, AnimatePresence } from "framer-motion";
import HireLabour from "./HireLabour";
import ViewDealers from "./ViewDealers";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import ProfileAvatar from "../../components/ProfileAvatar";

const getNavItems = (t) => [
  { id: "dashboard", icon: "🏠", label: t('dashboard.navDashboard') },
  { id: "land",      icon: "🌍", label: t('dashboard.navMyLand') },
  { id: "crops",     icon: "🌱", label: t('dashboard.navCrops') },
  { id: "labour",    icon: "👷", label: t('dashboard.navHireLabour') },
  { id: "dealers",   icon: "🏪", label: t('dashboard.navDealers') },
];

// ─── Dashboard home tab content ──────────────────────────────────────────────
const DashboardHome = ({ user }) => {
  const { t } = useTranslation();
  return (
  <div className="space-y-5">
    {/* Welcome banner */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="backdrop-blur-xl bg-gradient-to-r from-green-500/30 to-emerald-600/20 border border-green-400/30 rounded-2xl p-6 text-white shadow-lg"
    >
      <h1 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow">
        {t('dashboard.welcome')}, {user?.firstName}! 👋
      </h1>
      <p className="text-green-100/90 text-sm">
        {t('dashboard.farmerBanner')}
      </p>
    </motion.div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {[
        { icon: "🌿", label: t('dashboard.activeCrops'), value: "0" },
        { icon: "👷", label: t('dashboard.hiredLabour'), value: "0" },
        { icon: "🏪", label: t('dashboard.navDealers'), value: "0" },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col gap-2 shadow-lg hover:bg-white/15 transition-all duration-300 cursor-default"
        >
          <span className="text-2xl">{stat.icon}</span>
          <div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-white/60 font-medium">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Profile info */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 shadow-lg"
    >
      <h2 className="text-base font-semibold text-white mb-4">{t('dashboard.yourProfile')}</h2>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <p className="text-white/50 text-xs mb-0.5">{t('dashboard.fullName')}</p>
          <p className="font-medium text-white">{user?.firstName} {user?.lastName}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-0.5">{t('login.emailLabel')}</p>
          <p className="font-medium text-white">{user?.email}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-0.5">{t('register.mobileNumber')}</p>
          <p className="font-medium text-white">{user?.mobile}</p>
        </div>
        <div>
          <p className="text-white/50 text-xs mb-0.5">{t('dashboard.status')}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-300 bg-green-500/20 border border-green-400/30 px-2 py-0.5 rounded-full backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
            {t('dashboard.active')}
          </span>
        </div>
        {user?.farmerProfile && (
          <>
            <div>
              <p className="text-white/50 text-xs mb-0.5">{t('dashboard.location')}</p>
              <p className="font-medium text-white">
                {user.farmerProfile.village}, {user.farmerProfile.taluka}, {user.farmerProfile.district}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-xs mb-0.5">{t('dashboard.gatNo')}</p>
              <p className="font-medium text-white">{user.farmerProfile.gatNo}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>
  </div>
  );
};

// ─── Placeholder tab ──────────────────────────────────────────────────────────
const ComingSoon = ({ label, icon }) => {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-xl bg-white/8 border border-white/15 rounded-2xl p-16 text-center"
    >
      <p className="text-5xl mb-4">{icon}</p>
      <h2 className="text-white font-semibold text-lg mb-2">{label}</h2>
      <p className="text-white/50 text-sm">{t('dashboard.comingSoon')}</p>
    </motion.div>
  );
};

// ─── Main dashboard ───────────────────────────────────────────────────────────
const FarmerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const navItems = getNavItems(t);

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardHome user={user} />;
      case "labour":    return <HireLabour />;
      case "dealers":   return <ViewDealers />;
      case "land":      return <ComingSoon label={t('dashboard.navMyLand')} icon="🌍" />;
      case "crops":     return <ComingSoon label={t('dashboard.navCrops')} icon="🌱" />;
      default:          return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gray-900">
      {/* Hero Background with slow zoom animation */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.06 }}
          transition={{ duration: 24, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/75 via-green-950/50 to-gray-900/80" />
      </div>

      {/* Header — glassmorphism */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="KrishiDhara Logo" className="h-20 w-auto object-contain rounded-lg drop-shadow-md" />
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold bg-green-500/30 text-green-200 rounded-full px-3 py-0.5 border border-green-400/40">
              {t('register.farmer')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ProfileAvatar />
            <span className="hidden sm:block text-sm text-white/80 font-medium">
              {user?.firstName} {user?.lastName}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Page body */}
      <div className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar — glass */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 gap-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-3 h-fit shadow-lg sticky top-28">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 w-full text-left ${
                  isActive
                    ? "bg-green-500/25 text-green-200 border border-green-400/30"
                    : "text-white/70 hover:bg-white/20 hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          <div className="mt-1">
            <LogoutButton variant="sidebar" />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Mobile tab bar */}
          <div className="flex md:hidden gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-green-500/30 text-green-200 border border-green-400/30"
                      : "bg-white/10 text-white/60 border border-white/15 hover:bg-white/20"
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Tab content with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default FarmerDashboard;

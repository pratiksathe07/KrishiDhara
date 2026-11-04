import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { motion, AnimatePresence } from "framer-motion";
import HireLabour from "./HireLabour";
import ViewDealers from "./ViewDealers";
import DealerRequirements from "./DealerRequirements";
import { getActiveDealerRequirements } from "../../services/dealerService";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import ProfileAvatar from "../../components/ProfileAvatar";

const getNavItems = (t) => [
  { id: "dashboard",    icon: "🏠", label: t('dashboard.navDashboard') },
  { id: "requirements", icon: "📋", label: t('dashboard.dealerRequirements', 'Dealer Requirements') },
  { id: "land",         icon: "🌍", label: t('dashboard.navMyLand') },
  { id: "crops",        icon: "🌱", label: t('dashboard.navCrops') },
  { id: "labour",       icon: "👷", label: t('dashboard.navHireLabour') },
  { id: "dealers",      icon: "🏪", label: t('dashboard.navDealers') },
];

// ─── Dashboard home tab content ──────────────────────────────────────────────
const DashboardHome = ({ user, onNavigateTab }) => {
  const { t } = useTranslation();
  const [requirementsCount, setRequirementsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    getActiveDealerRequirements()
      .then((res) => {
        if (isMounted && res.data?.success) {
          setRequirementsCount(res.data.data.requirements?.length || 0);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  return (
  <div className="space-y-6">
    {/* Welcome banner — SapphireIQ Indigo Gradient */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#3b38e4] via-[#4338ca] to-[#6366f1] p-6 sm:p-7 text-white shadow-lg shadow-[#3b38e4]/20 border border-indigo-400/20"
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight">
          {t('dashboard.welcome')}, {user?.firstName}! 👋
        </h1>
        <p className="text-indigo-100 text-sm font-medium">
          {t('dashboard.farmerBanner')}
        </p>
      </div>
    </motion.div>

    {/* Stats grid */}
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[
        { icon: "🌿", label: t('dashboard.activeCrops'), value: "0" },
        { icon: "👷", label: t('dashboard.hiredLabour'), value: "0" },
        { icon: "🏪", label: t('dashboard.navDealers'), value: "0" },
        {
          icon: "📋",
          label: t('dashboard.dealerRequirements', 'Dealer Requirements'),
          value: String(requirementsCount),
          highlight: true,
          onClick: () => onNavigateTab && onNavigateTab("requirements"),
        },
      ].map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08 }}
          onClick={stat.onClick}
          className={`bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col gap-2 shadow-sm transition-all duration-300 ${
            stat.onClick ? "hover:border-[#3b38e4]/50 hover:shadow-md hover:scale-[1.02] cursor-pointer" : "cursor-default hover:border-slate-300"
          }`}
        >
          <span className="text-2xl">{stat.icon}</span>
          <div>
            <p className={`text-2xl font-bold ${stat.highlight ? "text-[#3b38e4]" : "text-slate-900"}`}>
              {stat.value}
            </p>
            <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
          </div>
        </motion.div>
      ))}
    </div>

    {/* Profile info */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm"
    >
      <h2 className="text-base font-bold text-slate-900 mb-4">{t('dashboard.yourProfile')}</h2>
      <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <p className="text-slate-400 text-xs mb-0.5 font-medium">{t('dashboard.fullName')}</p>
          <p className="font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-0.5 font-medium">{t('login.emailLabel')}</p>
          <p className="font-semibold text-slate-800">{user?.email}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-0.5 font-medium">{t('register.mobileNumber')}</p>
          <p className="font-semibold text-slate-800">{user?.mobile}</p>
        </div>
        <div>
          <p className="text-slate-400 text-xs mb-0.5 font-medium">{t('dashboard.status')}</p>
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {t('dashboard.active')}
          </span>
        </div>
        {user?.farmerProfile && (
          <>
            <div>
              <p className="text-slate-400 text-xs mb-0.5 font-medium">{t('dashboard.location')}</p>
              <p className="font-semibold text-slate-800">
                {user.farmerProfile.village}, {user.farmerProfile.taluka}, {user.farmerProfile.district}
              </p>
            </div>
            <div>
              <p className="text-slate-400 text-xs mb-0.5 font-medium">{t('dashboard.gatNo')}</p>
              <p className="font-semibold text-slate-800">{user.farmerProfile.gatNo}</p>
            </div>
          </>
        )}
      </div>
    </motion.div>

    {/* ── Section: Dealer Purchase Requirements ── */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
    >
      <DealerRequirements embedded={true} />
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
      className="bg-white border border-slate-200/90 rounded-2xl p-16 text-center shadow-sm"
    >
      <p className="text-5xl mb-4">{icon}</p>
      <h2 className="text-slate-900 font-bold text-lg mb-2">{label}</h2>
      <p className="text-slate-500 text-sm font-medium">{t('dashboard.comingSoon')}</p>
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
      case "dashboard":    return <DashboardHome user={user} onNavigateTab={setActiveTab} />;
      case "requirements": return <DealerRequirements />;
      case "labour":       return <HireLabour />;
      case "dealers":      return <ViewDealers />;
      case "land":         return <ComingSoon label={t('dashboard.navMyLand')} icon="🌍" />;
      case "crops":        return <ComingSoon label={t('dashboard.navCrops')} icon="🌱" />;
      default:             return <DashboardHome user={user} onNavigateTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-b from-[#f3f7ff] via-[#ffffff] to-[#f8faff] text-slate-800 font-sans">
      {/* SapphireIQ Ambient Glow Backdrop (Light) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff25_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff25_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Ambient floating pastel orbs */}
        <motion.div
          animate={{
            x: [0, 25, 0],
            y: [0, -30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-[#3b38e4]/08 blur-[130px]"
        />
        <motion.div
          animate={{
            x: [0, -30, 0],
            y: [0, 35, 0],
            scale: [1, 1.08, 1],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-[#00b4d8]/08 blur-[140px]"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -25, 0],
            scale: [1, 1.12, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-28 left-1/3 w-[650px] h-[650px] rounded-full bg-[#8b5cf6]/06 blur-[150px]"
        />
      </div>

      {/* Header — clean white glass */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/95 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="KrishiDhara Logo" className="h-14 sm:h-16 w-auto object-contain rounded-lg drop-shadow-sm" />
            <span className="hidden sm:inline-block ml-2 text-xs font-bold bg-indigo-50 text-[#3b38e4] rounded-full px-3 py-1 border border-indigo-200/80 shadow-sm">
              • {t('register.farmer')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher light={true} />
            <ProfileAvatar />
            <span className="hidden sm:block text-sm text-slate-800 font-semibold">
              {user?.firstName} {user?.lastName}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Page body */}
      <div className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar — clean white card */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 gap-1.5 bg-white border border-slate-200/90 rounded-2xl p-3 h-fit shadow-sm sticky top-24">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 w-full text-left ${
                  isActive
                    ? "bg-[#3b38e4] text-white shadow-md shadow-[#3b38e4]/25"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
          <div className="mt-2 pt-2 border-t border-slate-100">
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
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#3b38e4] text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
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

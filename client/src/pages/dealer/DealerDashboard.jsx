import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import DealerHeader from "../../components/dealer/DealerHeader";
import DealerPostFeed from "./DealerPostFeed";
import { getDealerRequirements } from "../../services/dealerService";
import { Plus, ArrowRight, Package, Store } from "lucide-react";

const getNavItems = (t) => [
  { id: "dashboard", icon: "▦", label: t('dashboard.navDashboard') },
  { id: "post", icon: "📢", label: "Post Crop Need" },
  { id: "profile", icon: "📋", label: "Profile & Registered Crops", href: "/dealer/profile" },
];

const DealerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeListingsCount, setActiveListingsCount] = useState(0);
  const navItems = getNavItems(t);

  useEffect(() => {
    let isMounted = true;
    getDealerRequirements()
      .then((res) => {
        if (isMounted && res.data?.success) {
          setActiveListingsCount(res.data.data.count || res.data.data.requirements?.length || 0);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-[#f8faff] text-slate-800">
      {/* SapphireIQ Ambient Glow Backdrop (Light) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0e7ff25_1px,transparent_1px),linear-gradient(to_bottom,#e0e7ff25_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        
        {/* Ambient floating pastel orbs */}
        <motion.div
          animate={{ x: [0, 25, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-20 w-[550px] h-[550px] rounded-full bg-[#3b38e4]/08 blur-[130px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 35, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-1/4 -right-24 w-[600px] h-[600px] rounded-full bg-[#00b4d8]/08 blur-[140px]"
        />
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -25, 0], scale: [1, 1.12, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute -bottom-28 left-1/3 w-[650px] h-[650px] rounded-full bg-[#8b5cf6]/06 blur-[150px]"
        />
      </div>

      {/* Header — clean white glass */}
      <DealerHeader showBackToDashboard={false} />

      {/* Page body */}
      <div className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar — clean white card */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 gap-1.5 bg-white border border-slate-200/90 rounded-2xl p-3 h-fit shadow-sm sticky top-24">
          {navItems.map((item) => {
            if (item.href) {
              return (
                <Link
                  key={item.id}
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  <span>{item.icon}</span>{item.label}
                </Link>
              );
            }

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
                <span>{item.icon}</span>{item.label}
              </button>
            );
          })}
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Mobile tab bar */}
          <div className="flex md:hidden gap-2 pb-3 mb-4 overflow-x-auto">
            {navItems.map((item) => {
              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white text-slate-600 border border-slate-200"
                  >
                    <span>{item.icon}</span>{item.label}
                  </Link>
                );
              }

              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-[#3b38e4] text-white shadow-sm"
                      : "bg-white text-slate-600 border border-slate-200"
                  }`}
                >
                  <span>{item.icon}</span>{item.label}
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "post" ? (
              <motion.div
                key="post"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
              >
                <DealerPostFeed user={user} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Welcome banner — SapphireIQ Gradient */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#3b38e4] via-[#4338ca] to-[#6366f1] p-6 sm:p-7 text-white shadow-lg shadow-[#3b38e4]/20 border border-indigo-400/20"
                >
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h1 className="text-xl sm:text-2xl font-bold mb-1 tracking-tight">
                        {t('dashboard.welcome')}, {user?.firstName}! 👋
                      </h1>
                      <p className="text-indigo-100 text-sm font-medium">
                        {t('dashboard.dealerBanner')}
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab("post")}
                      className="px-5 py-2.5 rounded-2xl bg-white text-[#3b38e4] hover:bg-indigo-50 font-extrabold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Post Crop Need</span>
                    </button>
                  </div>
                </motion.div>

                {/* Stats grid — clean cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    {
                      icon: "🛒",
                      label: t('dashboard.activeListings'),
                      value: String(activeListingsCount),
                      highlight: true,
                      onClick: () => setActiveTab("post"),
                      action: "Manage Posts →",
                    },
                    {
                      icon: "📦",
                      label: t('dashboard.products'),
                      value: String(user?.dealerProfile?.products?.length || "0"),
                    },
                    {
                      icon: "👨‍🌾",
                      label: t('dashboard.farmerContacts'),
                      value: "Direct",
                    },
                  ].map((stat, i) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      onClick={stat.onClick}
                      className={`bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-2 shadow-sm transition-all duration-300 ${
                        stat.onClick
                          ? "hover:border-[#3b38e4]/50 hover:shadow-md hover:scale-[1.02] cursor-pointer"
                          : "cursor-default"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{stat.icon}</span>
                        {stat.action && (
                          <span className="text-[11px] font-bold text-[#3b38e4]">
                            {stat.action}
                          </span>
                        )}
                      </div>
                      <p className={`text-2xl font-bold ${stat.highlight ? "text-[#3b38e4]" : "text-slate-900"}`}>
                        {stat.value}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Profile info — white card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base font-bold text-slate-900">{t('dashboard.yourProfile')}</h2>
                    <Link
                      to="/dealer/profile"
                      className="text-xs text-[#3b38e4] hover:text-white bg-indigo-50 hover:bg-[#3b38e4] px-3.5 py-1.5 rounded-xl border border-indigo-200 transition flex items-center gap-1.5 font-semibold shadow-sm"
                    >
                      <span>Manage Products & Profile →</span>
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-0.5">{t('dashboard.fullName')}</p>
                      <p className="font-semibold text-slate-800">{user?.firstName} {user?.lastName}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-0.5">{t('login.emailLabel')}</p>
                      <p className="font-semibold text-slate-800">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-0.5">{t('register.mobileNumber')}</p>
                      <p className="font-semibold text-slate-800">{user?.mobile}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-semibold mb-0.5">{t('dashboard.address')}</p>
                      <p className="font-semibold text-slate-800">{user?.address || "—"}</p>
                    </div>
                    {user?.dealerProfile && user.dealerProfile.products.length > 0 && (
                      <div className="sm:col-span-2">
                        <p className="text-slate-500 text-xs font-semibold mb-1.5">{t('dashboard.products')}</p>
                        <div className="flex flex-wrap gap-2">
                          {user.dealerProfile.products.map((p) => (
                            <span key={p} className="px-3 py-1 bg-indigo-50 text-[#3b38e4] border border-indigo-200/80 rounded-full text-xs font-semibold">{p}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DealerDashboard;

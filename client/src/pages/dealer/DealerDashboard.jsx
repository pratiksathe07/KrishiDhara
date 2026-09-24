import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import ProfileAvatar from "../../components/ProfileAvatar";

const getNavItems = (t) => [
  { icon: "🏠", label: t('dashboard.navDashboard'), href: "/dealer/dashboard" },
  { icon: "🏪", label: t('dashboard.navMyProducts'), href: "#" },
  { icon: "🌾", label: t('dashboard.navFarmerLeads'), href: "#" },
  { icon: "📊", label: t('dashboard.navAnalytics'), href: "#" },
  { icon: "💬", label: t('dashboard.navMessages'), href: "#" },
];

const DealerDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navItems = getNavItems(t);

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
        {/* Dark gradient overlay — blue tint for dealer */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/75 via-blue-950/45 to-gray-900/85" />
      </div>

      {/* Header — glassmorphism */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/10 border-b border-white/20 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="KrishiDhara Logo" className="h-14 w-auto object-contain rounded-lg drop-shadow-md" />
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold bg-blue-500/30 text-blue-200 rounded-full px-3 py-0.5 border border-blue-400/40">
              {t('register.dealer')}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <ProfileAvatar />
            <span className="hidden sm:block text-sm text-white/80 font-medium">{user?.firstName} {user?.lastName}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Page body */}
      <div className="relative z-10 flex flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 gap-6">
        {/* Sidebar — glass */}
        <aside className="hidden md:flex flex-col w-56 shrink-0 gap-1 backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-3 h-fit shadow-lg">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:bg-white/20 hover:text-white transition-all duration-200"
            >
              <span>{item.icon}</span>{item.label}
            </a>
          ))}
          <div className="mt-1">
            <LogoutButton variant="sidebar" />
          </div>
        </aside>

        <main className="flex-1 space-y-5">
          {/* Welcome banner — glass */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="backdrop-blur-xl bg-gradient-to-r from-blue-500/30 to-indigo-600/20 border border-blue-400/30 rounded-2xl p-6 text-white shadow-lg"
          >
            <h1 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow">{t('dashboard.welcome')}, {user?.firstName}! 👋</h1>
            <p className="text-blue-100/90 text-sm">{t('dashboard.dealerBanner')}</p>
          </motion.div>

          {/* Stats grid — glass cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: "🛒", label: t('dashboard.activeListings'), value: "0" },
              { icon: "👨‍🌾", label: t('dashboard.farmerContacts'), value: "0" },
              { icon: "📦", label: t('dashboard.products'), value: user?.dealerProfile?.products?.length || "0" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-5 flex flex-col gap-2 shadow-lg hover:bg-white/15 transition-all duration-300 cursor-default"
              >
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-white/60 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Profile info — glass card */}
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
                <p className="text-white/50 text-xs mb-0.5">{t('dashboard.address')}</p>
                <p className="font-medium text-white">{user?.address || "—"}</p>
              </div>
              {user?.dealerProfile && user.dealerProfile.products.length > 0 && (
                <div className="sm:col-span-2">
                  <p className="text-white/50 text-xs mb-1.5">{t('dashboard.products')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {user.dealerProfile.products.map((p) => (
                      <span key={p} className="chip chip-selected text-xs">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default DealerDashboard;

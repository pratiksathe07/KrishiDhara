import { useAuth } from "../../context/AuthContext";
import LogoutButton from "../../components/LogoutButton";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "../../components/ui/LanguageSwitcher";
import ProfileAvatar from "../../components/ProfileAvatar";

const getNavItems = (t) => [
  { icon: "🏠", label: t('dashboard.navDashboard'), href: "/labour/dashboard" },
  { icon: "📋", label: t('dashboard.navMyProfile'), href: "#" },
  { icon: "🔍", label: t('dashboard.navFindWork'), href: "#" },
  { icon: "📅", label: t('dashboard.navMyJobs'), href: "#" },
  { icon: "💰", label: t('dashboard.navEarnings'), href: "#" },
];

const LabourDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navItems = getNavItems(t);

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
      <header className="sticky top-0 z-20 backdrop-blur-md bg-white/95 border-b border-slate-200/80 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="KrishiDhara Logo" className="h-14 sm:h-16 w-auto object-contain rounded-lg drop-shadow-sm" />
            <span className="hidden sm:inline-block ml-2 text-xs font-bold bg-indigo-50 text-[#3b38e4] rounded-full px-3 py-1 border border-indigo-200/80 shadow-sm">
              • {t('register.labour')}
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
          {navItems.map((item, index) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                index === 0
                  ? "bg-[#3b38e4] text-white shadow-md shadow-[#3b38e4]/25"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{item.icon}</span>{item.label}
            </a>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <LogoutButton variant="sidebar" />
          </div>
        </aside>

        <main className="flex-1 space-y-5">
          {/* Welcome banner — SapphireIQ Gradient */}
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
                {t('dashboard.labourBanner')}
              </p>
            </div>
          </motion.div>

          {/* Stats grid — clean cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[
              { icon: "📅", label: t('dashboard.activeJobs'), value: "0" },
              { icon: "✅", label: t('dashboard.completed'), value: "0" },
              { icon: "⭐", label: t('dashboard.rating'), value: "—" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="bg-white border border-slate-200/90 rounded-2xl p-5 flex flex-col gap-2 shadow-sm hover:border-[#3b38e4]/50 hover:shadow-md transition-all duration-300 cursor-default"
              >
                <span className="text-2xl">{stat.icon}</span>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
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
            <h2 className="text-base font-bold text-slate-900 mb-4">{t('dashboard.yourProfile')}</h2>
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
              {user?.labourProfile && (
                <>
                  <div>
                    <p className="text-slate-500 text-xs font-semibold mb-0.5">{t('dashboard.experience')}</p>
                    <p className="font-semibold text-slate-800">
                      {user.labourProfile.experienceYears} {user.labourProfile.experienceYears === 1 ? t('dashboard.yearExp') : t('dashboard.yearsExp')}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-slate-500 text-xs font-semibold mb-1.5">{t('dashboard.skills')}</p>
                    <div className="flex flex-wrap gap-2">
                      {user.labourProfile.skills.length > 0
                        ? user.labourProfile.skills.map((s) => (
                            <span key={s} className="px-3 py-1 bg-indigo-50 text-[#3b38e4] border border-indigo-200/80 rounded-full text-xs font-semibold">{s}</span>
                          ))
                        : <span className="text-xs text-slate-400">{t('dashboard.noSkillsAdded')}</span>
                      }
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default LabourDashboard;

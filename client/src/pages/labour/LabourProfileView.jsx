import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import ProfileAvatar from "../../components/ProfileAvatar";
import EditProfileModal from "../../components/EditProfileModal";
import { User, Mail, Phone, Award, Briefcase, ArrowLeft, Edit3 } from "lucide-react";

const LabourProfileView = ({ user, onBack, onNavigateTab }) => {
  const { t } = useTranslation();
  const [isEditOpen, setIsEditOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
          <button
            type="button"
            onClick={onBack}
            className="hover:text-slate-900 transition font-semibold"
          >
            {t("dashboard.navDashboard", "Dashboard")}
          </button>
          <span>/</span>
          <span className="text-slate-900 font-semibold">
            {t("dashboard.navMyProfile", "My Profile")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditOpen(true)}
            className="text-xs text-white bg-[#3b38e4] hover:bg-[#302dc4] px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 font-semibold shadow-sm shadow-[#3b38e4]/25 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-xl border border-slate-200 transition flex items-center gap-1.5 font-semibold shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t("dashboard.backToDashboard", "Back to Dashboard")}</span>
          </button>
        </div>
      </div>

      {/* Main Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-800"
      >
        {/* Header with Avatar and Basic Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="shrink-0">
              <ProfileAvatar />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {user?.firstName} {user?.lastName}
                </h1>
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-[#3b38e4] border border-indigo-200">
                  {t("register.labour", "Worker")}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {t("dashboard.active", "Active")}
                </span>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                Worker Profile & Agricultural Skills
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 self-start md:self-auto flex items-center gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">{t("dashboard.experience", "Experience")}</p>
              <p className="text-base font-bold text-slate-900">
                {user?.labourProfile?.experienceYears || 0} {user?.labourProfile?.experienceYears === 1 ? "yr" : "yrs"}
              </p>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div className="text-center">
              <p className="text-xs text-slate-500 font-medium">{t("dashboard.skills", "Skills")}</p>
              <p className="text-base font-bold text-[#3b38e4]">
                {user?.labourProfile?.skills?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <User className="w-3.5 h-3.5 text-[#3b38e4]" />
              <span>{t("dashboard.fullName", "Full Name")}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">
              {user?.firstName} {user?.lastName}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Mail className="w-3.5 h-3.5 text-[#3b38e4]" />
              <span>{t("login.emailLabel", "Email Address")}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">
              {user?.email || "—"}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
              <Phone className="w-3.5 h-3.5 text-[#3b38e4]" />
              <span>{t("register.mobileNumber", "Mobile Number")}</span>
            </div>
            <p className="text-sm font-bold text-slate-800 truncate">
              {user?.mobile || "—"}
            </p>
          </div>

          {user?.labourProfile && (
            <>
              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-1">
                  <Award className="w-3.5 h-3.5 text-[#3b38e4]" />
                  <span>{t("dashboard.experience", "Experience")}</span>
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {user.labourProfile.experienceYears}{" "}
                  {user.labourProfile.experienceYears === 1
                    ? t("dashboard.yearExp", "year experience")
                    : t("dashboard.yearsExp", "years experience")}
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 sm:col-span-2">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold mb-2">
                  <Briefcase className="w-3.5 h-3.5 text-[#3b38e4]" />
                  <span>{t("dashboard.skills", "Registered Skills")}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.labourProfile.skills && user.labourProfile.skills.length > 0 ? (
                    user.labourProfile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-indigo-50 text-[#3b38e4] border border-indigo-200/80 rounded-full text-xs font-semibold shadow-sm"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">
                      {t("dashboard.noSkillsAdded", "No skills added")}
                    </span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Quick Action Shortcut */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <button
          type="button"
          onClick={() => onNavigateTab && onNavigateTab("get-job")}
          className="w-full p-5 bg-white border border-slate-200/90 rounded-2xl text-left hover:border-[#3b38e4]/50 hover:shadow-md transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-lg">
              💼
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 group-hover:text-[#3b38e4] transition">
                {t("dashboard.navGetJob", "Browse & Get Jobs")}
              </p>
              <p className="text-xs text-slate-500">
                View latest farm work posted by local farmers
              </p>
            </div>
          </div>
          <span className="text-[#3b38e4] font-bold text-sm group-hover:translate-x-1 transition">
            →
          </span>
        </button>
      </motion.div>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
};

export default LabourProfileView;

import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import { requestOTP } from "../../services/authService";
import { ROLE_OPTIONS } from "../../constants/roles";

import AnimatedBackground from "../../components/ui/AnimatedBackground";
import { Sprout, Tractor, HardHat, Store, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";

const PREMIUM_ROLES = [
  { id: "farmer", label: "Farmer", icon: Tractor, activeBorder: "border-emerald-500", activeBg: "bg-emerald-50", iconColor: "text-emerald-500", badgeBg: "bg-emerald-500" },
  { id: "labour", label: "Labour", icon: HardHat, activeBorder: "border-amber-500", activeBg: "bg-amber-50", iconColor: "text-amber-500", badgeBg: "bg-amber-500" },
  { id: "dealer", label: "Dealer", icon: Store, activeBorder: "border-blue-500", activeBg: "bg-blue-50", iconColor: "text-blue-500", badgeBg: "bg-blue-500" },
];

/**
 * Registration Step 1 — Personal Information + Get OTP
 * On success, calls onSuccess({ email, role, firstName, lastName, mobile, experienceYears })
 */
const RegisterStep1 = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "" } });

  const selectedRole = watch("role");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        mobile: data.mobile,
        role: data.role,
      };

      if (data.role === "labour") {
        payload.experienceYears = parseInt(data.experienceYears, 10);
      }

      await requestOTP(payload);
      toast.success("OTP sent successfully! Please check your email.");
      onSuccess({
        email: data.email.trim().toLowerCase(),
        role: data.role,
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        mobile: data.mobile.trim(),
        experienceYears: data.role === "labour" ? parseInt(data.experienceYears, 10) : undefined,
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <div className="auth-card">
        {/* Brand header */}
        <div className="text-center mb-6 relative z-10 flex flex-col items-center">
          <img src="/logo.png" alt="KrishiDhara Logo" className="h-20 w-auto mx-auto object-contain mb-3 drop-shadow-sm rounded-xl" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{t('register.title')}</h1>
          <p className="text-xs font-bold text-slate-600 bg-white/80 backdrop-blur-sm inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/90 shadow-sm mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b38e4]"></span>
            {t('common.appTagline')}
          </p>
        </div>

        <StepIndicator currentStep={1} />

        <div className="auth-glass-card mt-6">
          <h2 className="text-xl font-bold text-slate-900 mb-5 tracking-tight">{t('register.personalInfo')}</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
            {/* First Name */}
            <Input
              id="firstName"
              label={t('register.firstName')}
              placeholder="Ramesh"
              error={errors.firstName?.message}
              {...register("firstName", {
                required: "First name is required.",
                maxLength: { value: 50, message: "First name is too long." },
              })}
            />

            {/* Last Name */}
            <Input
              id="lastName"
              label={t('register.lastName')}
              placeholder="Patil"
              error={errors.lastName?.message}
              {...register("lastName", {
                required: "Last name is required.",
                maxLength: { value: 50, message: "Last name is too long." },
              })}
            />

            {/* Mobile */}
            <Input
              id="mobile"
              label={t('register.mobileNumber')}
              placeholder="9876543210"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              prefix="+91"
              error={errors.mobile?.message}
              {...register("mobile", {
                required: "Mobile number is required.",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Please enter a valid 10-digit Indian mobile number.",
                },
              })}
            />

            {/* Experience — only for Labour */}
            {selectedRole === "labour" && (
              <Input
                id="experienceYears"
                label="Experience in Agricultural Labour (years)"
                placeholder="e.g. 5"
                type="number"
                min="0"
                max="60"
                step="1"
                inputMode="numeric"
                error={errors.experienceYears?.message}
                {...register("experienceYears", {
                  required: "Experience is required for Labour.",
                  min: { value: 0, message: "Experience cannot be negative." },
                  max: { value: 60, message: "Experience cannot exceed 60 years." },
                  validate: (v) =>
                    Number.isInteger(Number(v)) || "Experience must be a whole number.",
                })}
              />
            )}

            {/* Email */}
            <Input
              id="email"
              label={t('login.emailLabel')}
              placeholder={t('login.emailPlaceholder')}
              type="email"
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Please enter a valid email address.",
                },
              })}
            />

            {/* Premium Role Selector */}
            <div className="mb-6">
              <label className="input-label mb-3">{t('register.rolePrompt')}</label>
              <div className="grid grid-cols-3 gap-3">
                {PREMIUM_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isActive = selectedRole === role.id;
                  return (
                    <label
                      key={role.id}
                      className={`relative flex flex-col items-center justify-center p-4 rounded-2xl cursor-pointer border-2 transition-all duration-300 ${
                        isActive
                          ? `${role.activeBorder} ${role.activeBg} shadow-md scale-105`
                          : "border-slate-200 bg-slate-50/80 hover:bg-white hover:border-[#3b38e4]/40 hover:shadow-sm hover:-translate-y-0.5"
                      }`}
                    >
                      <input
                        type="radio"
                        value={role.id}
                        className="sr-only"
                        {...register("role", { required: "Please select your role." })}
                      />
                      <Icon className={`w-8 h-8 mb-2 transition-colors ${isActive ? role.iconColor : "text-slate-400"}`} />
                      <span className={`text-sm font-bold transition-colors ${isActive ? "text-slate-900" : "text-slate-600"}`}>
                        {t(`register.${role.id}`)}
                      </span>
                      {isActive && (
                        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full ${role.badgeBg} flex items-center justify-center shadow-sm animate-fade-in`}>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </label>
                  );
                })}
              </div>
              {errors.role && <p className="error-text mt-2" role="alert">{errors.role.message}</p>}
            </div>

            <Button type="submit" loading={loading} className="mt-4">
              {t('register.getOtp')}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-center text-sm font-medium text-slate-600">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-[#3b38e4] hover:text-[#302dc4] transition-colors">
                Log in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default RegisterStep1;

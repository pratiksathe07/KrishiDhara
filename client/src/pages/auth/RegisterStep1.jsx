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
        <div className="text-center mb-6 relative z-10">
          <img src="/logo.png" alt="KrishiDhara Logo" className="h-24 w-auto mx-auto object-contain mb-3 animate-float drop-shadow-xl rounded-xl" />
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-earth-600 drop-shadow-sm">Create Account</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 bg-white/50 backdrop-blur-sm inline-block px-3 py-1 rounded-full border border-white/40">Join the KrishiDhara community</p>
        </div>

        <StepIndicator currentStep={1} />

        <div className="card mt-6">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Personal Information</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="animate-fade-in">
            {/* First Name */}
            <Input
              id="firstName"
              label="First Name"
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
              label="Last Name"
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
              label="Mobile Number"
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
              label="Email Address"
              placeholder="ramesh@example.com"
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
              <label className="input-label mb-3">I am a</label>
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
                          : "border-surface-200 bg-white/70 hover:bg-white hover:border-primary-300 hover:shadow-sm hover:-translate-y-1"
                      }`}
                    >
                      <input
                        type="radio"
                        value={role.id}
                        className="sr-only"
                        {...register("role", { required: "Please select your role." })}
                      />
                      <Icon className={`w-8 h-8 mb-2 transition-colors ${isActive ? role.iconColor : "text-gray-400"}`} />
                      <span className={`text-sm font-bold transition-colors ${isActive ? "text-gray-900" : "text-gray-500"}`}>
                        {role.label}
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
              Get OTP
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100/50">
            <p className="text-center text-sm font-medium text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
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

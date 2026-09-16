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

      if (data.role === "labor") {
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
        experienceYears: data.role === "labor" ? parseInt(data.experienceYears, 10) : undefined,
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
          <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 mb-3 shadow-glass animate-float">
            <div className="absolute inset-0 rounded-3xl animate-pulse-ring"></div>
            <span className="text-3xl relative z-10">🌾</span>
          </div>
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
              maxLength={15}
              error={errors.mobile?.message}
              {...register("mobile", {
                required: "Mobile number is required.",
                pattern: {
                  value: /^(\+91|91|0)?[6-9]\d{9}$/,
                  message: "Please enter a valid Indian mobile number.",
                },
              })}
            />

            {/* Experience — only for Labor */}
            {selectedRole === "labor" && (
              <Input
                id="experienceYears"
                label="Experience in Agricultural Labor (years)"
                placeholder="e.g. 5"
                type="number"
                min="0"
                max="60"
                step="1"
                inputMode="numeric"
                error={errors.experienceYears?.message}
                {...register("experienceYears", {
                  required: "Experience is required for Labor.",
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

            {/* Role */}
            <Select
              id="role"
              label="I am a"
              placeholder="Select your role"
              options={ROLE_OPTIONS}
              error={errors.role?.message}
              {...register("role", {
                required: "Please select your role.",
              })}
            />

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

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
    <div className="page-container">
      <div className="auth-card">
        {/* Brand header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 mb-3 shadow-lg">
            <span className="text-2xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Join the KrishiDhara community</p>
        </div>

        <StepIndicator currentStep={1} />

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Personal Information</h2>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
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

            <Button type="submit" loading={loading} className="mt-2">
              Get OTP
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep1;

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import OTPInput from "../../components/ui/OTPInput";
import { loginRequestOTP, loginVerifyOTP } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

import AnimatedBackground from "../../components/ui/AnimatedBackground";

const RESEND_COOLDOWN = 60;

/**
 * Login page — 2-step passwordless OTP login.
 * Step 1: Enter email → request OTP
 * Step 2: Enter OTP → verify + receive auth cookie → redirect to dashboard
 */
const Login = () => {
  const navigate = useNavigate();
  const { setAuthUser, isAuthenticated, role } = useAuth();

  const [loginStep, setLoginStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && role) {
      navigate(`/${role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleRequestOTP = async (data) => {
    setLoading(true);
    setError("");
    try {
      await loginRequestOTP({ email: data.email });
      setEmail(data.email.trim().toLowerCase());
      setCooldown(RESEND_COOLDOWN);
      setLoginStep(2);
      toast.success("OTP sent! Please check your email.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await loginVerifyOTP({ email, otp });
      const user = res.data.data.user;
      setAuthUser(user);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(`/${user.role}/dashboard`, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    try {
      await loginRequestOTP({ email });
      toast.success("New OTP sent!");
      setOtpDigits(["", "", "", "", "", ""]);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <AnimatedBackground>
      <div className="auth-card">
        {/* Brand header */}
        <div className="text-center mb-8 relative z-10">
          <div className="relative inline-flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 mb-4 shadow-glass animate-float">
            <div className="absolute inset-0 rounded-3xl animate-pulse-ring"></div>
            <span className="text-4xl relative z-10">🌾</span>
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-earth-600 drop-shadow-sm">KrishiDhara</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 bg-white/50 backdrop-blur-sm inline-block px-3 py-1 rounded-full border border-white/40">Agricultural Services Platform</p>
        </div>

        <div className="card">
          {loginStep === 1 ? (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 mb-6 font-medium">Enter your email to receive a login code.</p>

              <form onSubmit={handleSubmit(handleRequestOTP)} noValidate>
                <Input
                  id="loginEmail"
                  label="Email Address"
                  placeholder="ramesh@example.com"
                  type="email"
                  error={errors.email?.message || error}
                  {...register("email", {
                    required: "Email is required.",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email address." },
                  })}
                />
                <Button type="submit" loading={loading} className="mt-4">
                  Get OTP
                </Button>
              </form>
            </div>
          ) : (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-gray-800 mb-1">Enter OTP</h2>
              <div className="flex items-center gap-2 bg-primary-50/80 backdrop-blur-sm border border-primary-200/50 rounded-xl px-4 py-3 mb-6 mt-3 shadow-inner">
                <svg className="h-5 w-5 text-primary-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-primary-800 tracking-wide">{email}</span>
              </div>

              <div className="mb-6">
                <label className="input-label block text-center mb-3 font-semibold text-gray-700">6-Digit Code</label>
                <OTPInput
                  value={otpDigits}
                  onChange={setOtpDigits}
                  disabled={loading}
                  error={!!error}
                />
                {error && <p className="error-text text-center mt-3 font-medium" role="alert">{error}</p>}
              </div>

              <Button
                onClick={handleVerifyOTP}
                loading={loading}
                disabled={otpDigits.join("").length !== 6}
              >
                Verify OTP & Login
              </Button>

              <div className="flex items-center justify-between mt-6 px-1">
                <button
                  type="button"
                  onClick={() => { setLoginStep(1); setError(""); }}
                  className="btn-ghost"
                >
                  ← Change Email
                </button>
                {cooldown > 0 ? (
                  <span className="text-sm font-medium text-gray-400 bg-surface-100 px-3 py-1 rounded-full border border-surface-200">
                    Resend in <span className="font-bold text-gray-600 tabular-nums">{cooldown}s</span>
                  </span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resending} className="btn-ghost">
                    {resending ? "Sending..." : "Resend OTP"}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100/50">
            <p className="text-center text-sm font-medium text-gray-500">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Login;

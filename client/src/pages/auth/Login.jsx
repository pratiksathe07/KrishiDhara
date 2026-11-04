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
import { Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";

const RESEND_COOLDOWN = 30;

/**
 * Login page — 2-step passwordless OTP login.
 * Step 1: Enter email → request OTP
 * Step 2: Enter OTP → verify + receive auth cookie → redirect to dashboard
 */
const Login = () => {
  const navigate = useNavigate();
  const { setAuthUser, isAuthenticated, role } = useAuth();
  const { t } = useTranslation();

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
        <div className="text-center mb-8 relative z-10 flex flex-col items-center">
          <img src="/logo.png" alt="KrishiDhara Logo" className="h-20 w-auto mx-auto object-contain mb-3 drop-shadow-sm rounded-xl" />
          <p className="text-xs font-bold text-slate-600 bg-white/80 backdrop-blur-sm inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/90 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b38e4]"></span>
            {t('common.appTagline')}
          </p>
        </div>

        <div className="auth-glass-card">
          {loginStep === 1 ? (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">{t('login.welcomeBack')}</h2>
              <p className="text-sm text-slate-500 mb-6 font-medium">{t('login.enterEmailPrompt')}</p>

              <form onSubmit={handleSubmit(handleRequestOTP)} noValidate>
                <Input
                  id="loginEmail"
                  label={t('login.emailLabel')}
                  placeholder={t('login.emailPlaceholder')}
                  type="email"
                  error={errors.email?.message || error}
                  {...register("email", {
                    required: "Email is required.",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Please enter a valid email address." },
                  })}
                />
                <Button type="submit" loading={loading} className="mt-4">
                  {t('login.getOtp')}
                </Button>
              </form>
            </div>
          ) : (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold text-slate-900 mb-1 tracking-tight">{t('login.enterOtp')}</h2>
              <div className="flex items-center gap-2 bg-indigo-50/80 border border-indigo-100 rounded-xl px-4 py-3 mb-6 mt-3 shadow-sm">
                <svg className="h-5 w-5 text-[#3b38e4] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-semibold text-slate-800 tracking-wide">{email}</span>
              </div>

              <div className="mb-6">
                <label className="input-label block text-center mb-3 font-semibold text-slate-700">{t('login.otpLabel')}</label>
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
                {t('login.verifyAndLogin')}
              </Button>

              <div className="flex items-center justify-between mt-6 px-1">
                <button
                  type="button"
                  onClick={() => { setLoginStep(1); setError(""); }}
                  className="btn-ghost"
                >
                  ← {t('login.changeEmail')}
                </button>
                {cooldown > 0 ? (
                  <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {t('login.resendIn')} <span className="font-bold text-slate-800 tabular-nums">{cooldown}s</span>
                  </span>
                ) : (
                  <button type="button" onClick={handleResend} disabled={resending} className="btn-ghost">
                    {resending ? t('login.sending') : t('login.resendOtp')}
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-center text-sm font-medium text-slate-600">
              {t('login.noAccount')}{" "}
              <Link to="/register" className="font-bold text-[#3b38e4] hover:text-[#302dc4] transition-colors">
                {t('login.registerHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default Login;

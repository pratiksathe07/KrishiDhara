import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import OTPInput from "../../components/ui/OTPInput";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import { verifyOTP, requestOTP } from "../../services/authService";

const RESEND_COOLDOWN = 60; // seconds

/**
 * Registration Step 2 — OTP Verification
 * Receives step1Data from parent.
 * On success, calls onSuccess({ verificationToken, ...data })
 */
const RegisterStep2 = ({ step1Data, onSuccess, onBack }) => {
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const otp = otpDigits.join("");

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError("Please enter all 6 digits.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await verifyOTP({ email: step1Data.email, otp });
      toast.success("Email verified successfully!");
      onSuccess(res.data.data);
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
      const payload = {
        firstName: step1Data.firstName,
        lastName: step1Data.lastName,
        email: step1Data.email,
        mobile: step1Data.mobile,
        role: step1Data.role,
      };
      if (step1Data.role === "labor") payload.experienceYears = step1Data.experienceYears;

      await requestOTP(payload);
      toast.success("New OTP sent! Please check your email.");
      setOtpDigits(["", "", "", "", "", ""]);
      setCooldown(RESEND_COOLDOWN);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 mb-3 shadow-lg">
            <span className="text-2xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
          <p className="text-sm text-gray-500 mt-1">One step closer to joining KrishiDhara</p>
        </div>

        <StepIndicator currentStep={2} />

        <div className="card">
          {/* Email display */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-200 rounded-xl px-4 py-2 mb-1">
              <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-sm font-semibold text-primary-700">{step1Data.email}</span>
            </div>
            <p className="text-sm text-gray-500">
              We sent a 6-digit code to your email address.
            </p>
          </div>

          {/* OTP Input */}
          <div className="mb-5">
            <label className="input-label text-center block mb-3">Enter OTP</label>
            <OTPInput
              value={otpDigits}
              onChange={setOtpDigits}
              disabled={loading}
              error={!!error}
            />
            {error && (
              <p className="error-text text-center mt-2" role="alert">{error}</p>
            )}
          </div>

          {/* Verify Button */}
          <Button
            onClick={handleVerify}
            loading={loading}
            disabled={otp.length !== 6}
          >
            Verify OTP
          </Button>

          {/* Resend + Back */}
          <div className="flex items-center justify-between mt-5">
            <button
              type="button"
              onClick={onBack}
              className="btn-ghost"
            >
              ← Change Email
            </button>

            {cooldown > 0 ? (
              <span className="text-sm text-gray-400">
                Resend in{" "}
                <span className="font-semibold text-gray-600 tabular-nums">{cooldown}s</span>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="btn-ghost"
              >
                {resending ? "Sending..." : "Resend OTP"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep2;

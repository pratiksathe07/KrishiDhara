import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import SkillSelector from "../../components/SkillSelector";
import { register as registerApi } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

/**
 * Registration Step 3 — Labor Profile (Address + Skills)
 * experienceYears comes from verifiedData (stored server-side, not re-submitted)
 */
const RegisterStep3Labor = ({ verifiedData }) => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillError, setSkillError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setSkillError("");
    setLoading(true);
    try {
      const res = await registerApi({
        verificationToken: verifiedData.verificationToken,
        address: formData.address.trim(),
        laborProfile: {
          skills,
        },
      });

      toast.success("Registration completed successfully! Welcome to KrishiDhara!");
      setAuthUser(res.data.data.user);
      navigate("/labor/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="auth-card" style={{ maxWidth: "560px" }}>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 mb-3 shadow-lg">
            <span className="text-2xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Labor Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Complete your agricultural labor profile</p>
        </div>

        <StepIndicator currentStep={3} />

        <div className="card">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Experience display (read-only — comes from Step 1, stored server-side) */}
            {verifiedData.experienceYears !== undefined && (
              <div className="bg-primary-50 border border-primary-200 rounded-xl px-4 py-3">
                <p className="text-xs text-primary-600 font-medium mb-0.5">Agricultural Experience</p>
                <p className="text-sm font-semibold text-primary-800">
                  {verifiedData.experienceYears} {verifiedData.experienceYears === 1 ? "year" : "years"}
                </p>
              </div>
            )}

            {/* Address */}
            <div>
              <label htmlFor="address" className="input-label">Address</label>
              <textarea
                id="address"
                placeholder="Your full address..."
                rows={3}
                className={`input-field resize-none ${errors.address ? "error" : ""}`}
                {...register("address", {
                  required: "Address is required.",
                  maxLength: { value: 300, message: "Address is too long." },
                })}
              />
              {errors.address && <p className="error-text">{errors.address.message}</p>}
            </div>

            {/* Status — display only, backend sets this */}
            <div className="bg-surface-50 border border-surface-200 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 font-medium mb-0.5">Account Status</p>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500"></span>
                <span className="text-sm font-semibold text-green-700">Active</span>
              </div>
            </div>

            {/* Skills */}
            <SkillSelector
              value={skills}
              onChange={setSkills}
              error={skillError}
            />

            <Button type="submit" loading={loading}>
              Complete Registration
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep3Labor;

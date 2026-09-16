import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import LocationSelector from "../../components/LocationSelector";
import { register as registerApi } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

import AnimatedBackground from "../../components/ui/AnimatedBackground";

/**
 * Registration Step 3 — Farmer Profile (Land Location + Gat No)
 */
const RegisterStep3Farmer = ({ verifiedData }) => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm();

  const [location, setLocation] = useState({
    stateId: "", state: "",
    districtId: "", district: "",
    talukaId: "", taluka: "",
    villageId: "", village: "",
  });
  const [locationErrors, setLocationErrors] = useState({});

  const validateLocation = () => {
    const errs = {};
    if (!location.stateId) errs.stateId = "State is required.";
    if (!location.districtId) errs.districtId = "District is required.";
    if (!location.talukaId) errs.talukaId = "Taluka is required.";
    if (!location.villageId) errs.villageId = "Village is required.";
    setLocationErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async (formData) => {
    if (!validateLocation()) return;

    setLoading(true);
    try {
      const res = await registerApi({
        verificationToken: verifiedData.verificationToken,
        farmerProfile: {
          ...location,
          gatNo: formData.gatNo.trim(),
        },
      });

      toast.success("Registration completed successfully! Welcome to KrishiDhara!");
      setAuthUser(res.data.data.user);
      navigate("/farmer/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <div className="auth-card">
        <div className="text-center mb-6 relative z-10">
          <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 mb-3 shadow-glass animate-float">
            <div className="absolute inset-0 rounded-3xl animate-pulse-ring"></div>
            <span className="text-3xl relative z-10">🌾</span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-earth-600 drop-shadow-sm">Farmer Profile</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 bg-white/50 backdrop-blur-sm inline-block px-3 py-1 rounded-full border border-white/40">Tell us about your land</p>
        </div>

        <StepIndicator currentStep={3} />

        <div className="card mt-6 animate-slide-up">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-surface-200/50">
            <span className="text-xl">📍</span>
            <h2 className="text-lg font-bold text-gray-800">Land Location</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <LocationSelector
              value={location}
              onChange={setLocation}
              errors={locationErrors}
            />

            {/* Gat No */}
            <Input
              id="gatNo"
              label="Gat No (as mentioned in 7/12 land record)"
              placeholder="e.g. 123 or 123/A"
              error={errors.gatNo?.message}
              {...register("gatNo", {
                required: "Gat No is required.",
                maxLength: { value: 50, message: "Gat No is too long." },
              })}
            />

            <div className="mt-4">
              <Button type="submit" loading={loading}>
                Complete Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AnimatedBackground>
  );
};

export default RegisterStep3Farmer;

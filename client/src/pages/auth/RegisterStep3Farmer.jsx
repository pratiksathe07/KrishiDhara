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
    <div className="page-container">
      <div className="auth-card">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary-600 mb-3 shadow-lg">
            <span className="text-2xl">🌾</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Farmer Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Tell us about your land</p>
        </div>

        <StepIndicator currentStep={3} />

        <div className="card">
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-surface-100">
            <span className="text-lg">📍</span>
            <h2 className="text-base font-semibold text-gray-800">Land Location</h2>
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

            <div className="mt-2">
              <Button type="submit" loading={loading}>
                Complete Registration
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterStep3Farmer;

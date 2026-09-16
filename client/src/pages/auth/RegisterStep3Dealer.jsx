import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Button from "../../components/ui/Button";
import StepIndicator from "../../components/ui/StepIndicator";
import ProductSelector from "../../components/ProductSelector";
import { register as registerApi } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

import AnimatedBackground from "../../components/ui/AnimatedBackground";

/**
 * Registration Step 3 — Dealer Profile (Address + Products)
 */
const RegisterStep3Dealer = ({ verifiedData }) => {
  const navigate = useNavigate();
  const { setAuthUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [productError, setProductError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (formData) => {
    setProductError("");
    setLoading(true);
    try {
      const res = await registerApi({
        verificationToken: verifiedData.verificationToken,
        address: formData.address.trim(),
        dealerProfile: {
          products,
        },
      });

      toast.success("Registration completed successfully! Welcome to KrishiDhara!");
      setAuthUser(res.data.data.user);
      navigate("/dealer/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedBackground>
      <div className="auth-card" style={{ maxWidth: "560px" }}>
        <div className="text-center mb-6 relative z-10">
          <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-gradient-to-br from-primary-400 to-primary-600 mb-3 shadow-glass animate-float">
            <div className="absolute inset-0 rounded-3xl animate-pulse-ring"></div>
            <span className="text-3xl relative z-10">🌾</span>
          </div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-earth-600 drop-shadow-sm">Dealer Profile</h1>
          <p className="text-sm font-medium text-gray-500 mt-2 bg-white/50 backdrop-blur-sm inline-block px-3 py-1 rounded-full border border-white/40">Complete your agricultural dealer profile</p>
        </div>

        <StepIndicator currentStep={3} />

        <div className="card mt-6 animate-slide-up">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

            {/* Address */}
            <div>
              <label htmlFor="address" className="input-label font-semibold text-gray-700">Address</label>
              <textarea
                id="address"
                placeholder="Your business address..."
                rows={3}
                className={`input-field resize-none ${errors.address ? "error" : ""}`}
                {...register("address", {
                  required: "Address is required.",
                  maxLength: { value: 300, message: "Address is too long." },
                })}
              />
              {errors.address && <p className="error-text font-medium">{errors.address.message}</p>}
            </div>

            {/* Status — display only */}
            <div className="bg-surface-50/80 backdrop-blur-sm border border-surface-200/50 rounded-xl px-4 py-3">
              <p className="text-xs text-gray-500 font-medium mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></span>
                <span className="text-sm font-bold text-green-700 tracking-wide">Active</span>
              </div>
            </div>

            {/* Products */}
            <ProductSelector
              value={products}
              onChange={setProducts}
              error={productError}
            />

            <div className="pt-2">
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

export default RegisterStep3Dealer;

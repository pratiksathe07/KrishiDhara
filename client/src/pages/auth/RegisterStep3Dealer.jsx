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
import { Sprout } from "lucide-react";

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
        <div className="text-center mb-6 relative z-10 flex flex-col items-center">
          <img src="/logo.png" alt="KrishiDhara Logo" className="h-20 w-auto mx-auto object-contain mb-3 drop-shadow-sm rounded-xl" />
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dealer Profile</h1>
          <p className="text-xs font-bold text-slate-600 bg-white/80 backdrop-blur-sm inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200/90 shadow-sm mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#3b38e4]"></span>
            Complete your agricultural dealer profile
          </p>
        </div>

        <StepIndicator currentStep={3} />

        <div className="auth-glass-card mt-6 animate-slide-up">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

            {/* Address */}
            <div>
              <label htmlFor="address" className="input-label font-semibold">Address</label>
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
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
              <p className="text-xs text-slate-500 font-medium mb-1">Account Status</p>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm animate-pulse"></span>
                <span className="text-sm font-bold text-slate-800 tracking-wide">Active</span>
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

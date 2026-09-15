import { useState } from "react";
import RegisterStep1 from "./RegisterStep1";
import RegisterStep2 from "./RegisterStep2";
import RegisterStep3Farmer from "./RegisterStep3Farmer";
import RegisterStep3Labor from "./RegisterStep3Labor";
import RegisterStep3Dealer from "./RegisterStep3Dealer";

/**
 * Register — orchestrates the 3-step registration flow.
 * State is held here and passed down as props.
 * The verificationToken from Step 2 is the ONLY proof of OTP verification.
 * It is never stored in localStorage — it lives in React state only
 * (for the duration of the registration session).
 */
const Register = () => {
  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [verifiedData, setVerifiedData] = useState(null); // includes verificationToken

  const handleStep1Success = (data) => {
    setStep1Data(data);
    setStep(2);
  };

  const handleStep2Success = (data) => {
    // data includes: { verificationToken, email, role, firstName, lastName, mobile, experienceYears }
    setVerifiedData(data);
    setStep(3);
  };

  const handleBack = () => {
    setStep(1);
    setVerifiedData(null);
  };

  if (step === 1) {
    return <RegisterStep1 onSuccess={handleStep1Success} />;
  }

  if (step === 2) {
    return (
      <RegisterStep2
        step1Data={step1Data}
        onSuccess={handleStep2Success}
        onBack={handleBack}
      />
    );
  }

  // Step 3 — role-specific
  if (step === 3 && verifiedData) {
    switch (verifiedData.role) {
      case "farmer":
        return <RegisterStep3Farmer verifiedData={verifiedData} />;
      case "labor":
        return <RegisterStep3Labor verifiedData={verifiedData} />;
      case "dealer":
        return <RegisterStep3Dealer verifiedData={verifiedData} />;
      default:
        return <div className="page-container"><p className="text-red-500">Invalid role.</p></div>;
    }
  }

  return null;
};

export default Register;

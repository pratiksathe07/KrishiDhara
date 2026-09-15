/**
 * 3-step registration progress indicator.
 * Shows current, completed, and pending steps clearly.
 */
const STEPS = [
  { number: 1, label: "Personal Details" },
  { number: 2, label: "Verify OTP" },
  { number: 3, label: "Complete Profile" },
];

const StepIndicator = ({ currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-center">
        {STEPS.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* Step circle */}
            <div className="flex flex-col items-center">
              <div
                className={`step-dot ${
                  currentStep === step.number
                    ? "step-dot-active"
                    : currentStep > step.number
                    ? "step-dot-completed"
                    : "step-dot-pending"
                }`}
                aria-current={currentStep === step.number ? "step" : undefined}
              >
                {currentStep > step.number ? (
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium hidden sm:block ${
                  currentStep >= step.number ? "text-primary-700" : "text-gray-400"
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 w-16 sm:w-20 mx-1 transition-all duration-300 ${
                  currentStep > step.number ? "bg-primary-500" : "bg-surface-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default StepIndicator;

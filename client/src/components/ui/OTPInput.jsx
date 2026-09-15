import { useRef, useCallback } from "react";

/**
 * 6-box OTP input with automatic focus advancement.
 * - Typing a digit moves focus to the next box
 * - Backspace on empty box moves focus back
 * - Paste support (pastes all 6 digits at once)
 *
 * @param {Object} props
 * @param {string[]} props.value - Array of 6 single-digit strings
 * @param {Function} props.onChange - Called with new value array
 * @param {boolean} props.disabled
 * @param {boolean} props.error
 */
const OTPInput = ({ value = ["", "", "", "", "", ""], onChange, disabled = false, error = false }) => {
  const refs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const updateValue = useCallback(
    (index, digit) => {
      const next = [...value];
      next[index] = digit;
      onChange(next);
    },
    [value, onChange]
  );

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        updateValue(index, "");
      } else if (index > 0) {
        refs[index - 1].current?.focus();
        updateValue(index - 1, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      refs[index - 1].current?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handleChange = (e, index) => {
    const raw = e.target.value;
    const digit = raw.replace(/\D/g, "").slice(-1); // Only digits, last char
    if (!digit) return;

    updateValue(index, digit);
    if (index < 5) {
      refs[index + 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = [...value];
    for (let i = 0; i < 6; i++) {
      next[i] = pasted[i] || "";
    }
    onChange(next);
    // Focus the last filled box or first empty
    const lastIndex = Math.min(pasted.length, 5);
    refs[lastIndex].current?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" role="group" aria-label="OTP input">
      {value.map((digit, index) => (
        <input
          key={index}
          ref={refs[index]}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          disabled={disabled}
          aria-label={`OTP digit ${index + 1}`}
          className={`otp-box ${error ? "border-red-400" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={index === 0 ? handlePaste : undefined}
          onFocus={(e) => e.target.select()}
          autoComplete="one-time-code"
        />
      ))}
    </div>
  );
};

export default OTPInput;

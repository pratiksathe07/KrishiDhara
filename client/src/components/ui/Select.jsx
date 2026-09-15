import { forwardRef } from "react";

/**
 * Reusable Select / Dropdown component.
 * Accepts an `options` array of { value, label } objects.
 */
const Select = forwardRef(function Select(
  { label, id, error, options = [], placeholder = "Select...", className = "", ...props },
  ref
) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`input-field appearance-none cursor-pointer ${error ? "error" : ""} ${className}`}
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
});

export default Select;

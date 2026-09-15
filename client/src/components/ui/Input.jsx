import { forwardRef } from "react";

/**
 * Reusable Input component.
 * Accepts all native input props + label + error message.
 */
const Input = forwardRef(function Input(
  { label, id, error, className = "", ...props },
  ref
) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`input-field ${error ? "error" : ""} ${className}`}
        {...props}
      />
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
});

export default Input;

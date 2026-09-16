import { forwardRef } from "react";

/**
 * Reusable Input component.
 * Accepts all native input props + label + error message.
 */
const Input = forwardRef(function Input(
  { label, id, error, className = "", prefix, ...props },
  ref
) {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <div className="relative">
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none z-10 text-gray-700 font-bold text-sm">
            {prefix}
          </div>
        )}
        <input
          ref={ref}
          id={id}
          className={`input-field ${error ? "error" : ""} ${prefix ? "pl-12" : ""} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
});

export default Input;

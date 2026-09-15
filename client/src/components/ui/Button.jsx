/**
 * Reusable Button.
 * variant: 'primary' | 'outline' | 'ghost'
 * loading: shows spinner + disables button
 */
const Button = ({
  children,
  variant = "primary",
  loading = false,
  type = "button",
  className = "",
  ...props
}) => {
  const variantClass =
    variant === "outline"
      ? "btn-outline"
      : variant === "ghost"
      ? "btn-ghost"
      : "btn-primary";

  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`${variantClass} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;

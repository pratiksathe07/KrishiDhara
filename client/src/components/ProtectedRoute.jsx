import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute — blocks unauthenticated users.
 * While auth is loading, shows a full-screen spinner.
 * After load: if not authenticated, redirects to /login.
 */
export const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) return <FullPageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
};

/**
 * RoleProtectedRoute — blocks users whose role is not in allowedRoles.
 * Must be nested inside ProtectedRoute.
 */
export const RoleProtectedRoute = ({ children, allowedRoles }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-50">
    <div className="flex flex-col items-center gap-3">
      <svg className="h-10 w-10 animate-spin text-primary-600" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <p className="text-sm text-gray-500 font-medium">Loading KrishiDhara...</p>
    </div>
  </div>
);

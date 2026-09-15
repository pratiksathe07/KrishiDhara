import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getMe, logout as logoutApi } from "../services/authService";

const AuthContext = createContext(null);

/**
 * AuthProvider wraps the entire app.
 * On mount, calls GET /api/auth/me to restore auth state from the HTTP-only cookie.
 * The cookie is the source of truth — not localStorage.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while initial auth check runs

  // Called once on app load to restore session from cookie
  const checkAuth = useCallback(async () => {
    try {
      const res = await getMe();
      setUser(res.data.data.user);
    } catch {
      setUser(null); // Not authenticated — treat as logged out
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /** Called after successful registration or login */
  const setAuthUser = useCallback((userData) => {
    setUser(userData);
  }, []);

  /** Logout: clear cookie via API, then clear local state */
  const logout = useCallback(async () => {
    try {
      await logoutApi();
    } catch {
      // Even if the API call fails, clear local state
    }
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    setAuthUser,
    logout,
    isAuthenticated: !!user,
    role: user?.role || null,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Hook to access auth context anywhere in the app */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

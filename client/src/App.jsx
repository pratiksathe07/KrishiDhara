import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, RoleProtectedRoute } from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import FarmerDashboard from "./pages/farmer/FarmerDashboard";
import LaborDashboard from "./pages/labor/LaborDashboard";
import DealerDashboard from "./pages/dealer/DealerDashboard";
import { Unauthorized, NotFound } from "./pages/ErrorPages";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Toast notifications — positioned top-center, mobile-friendly */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
              maxWidth: "380px",
            },
            success: {
              iconTheme: { primary: "#16a34a", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected — Farmer */}
          <Route
            path="/farmer/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["farmer"]}>
                  <FarmerDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected — Labor */}
          <Route
            path="/labor/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["labor"]}>
                  <LaborDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Protected — Dealer */}
          <Route
            path="/dealer/dashboard"
            element={
              <ProtectedRoute>
                <RoleProtectedRoute allowedRoles={["dealer"]}>
                  <DealerDashboard />
                </RoleProtectedRoute>
              </ProtectedRoute>
            }
          />

          {/* Error pages */}
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

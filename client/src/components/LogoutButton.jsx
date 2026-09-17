import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const LogoutButton = ({ className, variant = "default" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Sidebar variant styling
  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 px-4 py-2.5 mt-4 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition w-full text-left ${className || ""}`}
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    );
  }

  // Default header variant styling
  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 text-sm font-medium text-red-500 hover:text-red-600 transition ${className || ""}`}
    >
      <LogOut size={16} />
      <span>Logout</span>
    </button>
  );
};

export default LogoutButton;

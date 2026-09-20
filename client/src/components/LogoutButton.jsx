import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

const LogoutButton = ({ className, variant = "default" }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  // Sidebar variant styling
  if (variant === "sidebar") {
    return (
      <button
        onClick={handleLogout}
        className={`flex items-center gap-3 px-4 py-2.5 mt-4 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition w-full shadow-md ${className || ""}`}
      >
        <LogOut size={18} />
        <span>{t('dashboard.logout')}</span>
      </button>
    );
  }

  // Default header variant styling
  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition shadow-sm ${className || ""}`}
    >
      <LogOut size={16} />
      <span>{t('dashboard.logout')}</span>
    </button>
  );
};

export default LogoutButton;

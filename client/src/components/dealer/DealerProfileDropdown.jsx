import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getProfileImageUrl } from "../ProfileAvatar";
import { User, LogOut, ChevronDown, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

/**
 * DealerProfileDropdown — Header profile avatar & name trigger
 * with dropdown menu containing "My Profile" and "Logout".
 * Closes on outside click or option selection.
 */
const DealerProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`.toUpperCase() || "KD";
  const avatarUrl = user?.profilePicture ? getProfileImageUrl(user.profilePicture) : null;

  const handleProfileClick = () => {
    setIsOpen(false);
    navigate("/dealer/profile");
  };

  const handleLogoutClick = async () => {
    setIsOpen(false);
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger: Profile Picture + Name + Chevron */}
      <button
        type="button"
        id="dealer-profile-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Dealer profile menu"
        className="flex items-center gap-2.5 px-2 py-1.5 rounded-2xl hover:bg-white/10 active:bg-white/15 transition-all duration-200 border border-transparent hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400/50 cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-white/30 bg-gray-800 flex items-center justify-center shrink-0 shadow-md">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${user?.firstName || "Dealer"}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm tracking-wider select-none shadow-inner">
              {initials}
            </div>
          )}
        </div>

        {/* Name */}
        <span className="hidden sm:inline-block text-sm text-white/90 font-medium max-w-[140px] truncate">
          {user?.firstName} {user?.lastName}
        </span>

        {/* Chevron icon */}
        <ChevronDown
          className={`w-4 h-4 text-white/70 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="dealer-profile-dropdown-menu"
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 backdrop-blur-2xl bg-gray-900/95 border border-white/20 rounded-2xl shadow-2xl p-2 z-50 text-white animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Info */}
          <div className="px-3 py-2.5 bg-white/5 rounded-xl border border-white/10 mb-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-semibold text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                Dealer
              </span>
            </div>
            <p className="text-xs text-white/60 truncate">{user?.email}</p>
          </div>

          {/* Option 1: My Profile */}
          <button
            type="button"
            id="dealer-profile-menu-item"
            role="menuitem"
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/90 hover:bg-white/15 hover:text-white transition-all duration-150 cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-blue-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">My Profile</p>
              <p className="text-[11px] text-white/50">Details & Purchase Requirements</p>
            </div>
          </button>

          <div className="my-1.5 h-px bg-white/10" />

          {/* Option 2: Logout */}
          <button
            type="button"
            id="dealer-logout-menu-item"
            role="menuitem"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-300 hover:text-red-100 hover:bg-red-500/20 transition-all duration-150 cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-red-300" />
            </div>
            <div>
              <p className="font-semibold text-sm">Logout</p>
              <p className="text-[11px] text-red-300/70">Sign out of your session</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default DealerProfileDropdown;

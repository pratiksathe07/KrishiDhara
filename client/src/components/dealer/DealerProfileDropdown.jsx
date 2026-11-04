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
        className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl hover:bg-slate-100 active:bg-slate-200/70 transition-all duration-200 border border-slate-200/60 focus:outline-none focus:ring-2 focus:ring-[#3b38e4]/30 cursor-pointer"
      >
        {/* Avatar */}
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 shadow-sm">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={`${user?.firstName || "Dealer"}'s profile`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#3b38e4] to-indigo-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm tracking-wider select-none shadow-inner">
              {initials}
            </div>
          )}
        </div>

        {/* Name */}
        <span className="hidden sm:inline-block text-sm text-slate-800 font-semibold max-w-[140px] truncate">
          {user?.firstName} {user?.lastName}
        </span>

        {/* Chevron icon */}
        <ChevronDown
          className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-slate-800" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id="dealer-profile-dropdown-menu"
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 bg-white border border-slate-200/90 rounded-2xl shadow-xl p-2 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header Info */}
          <div className="px-3 py-2.5 bg-slate-50 rounded-xl border border-slate-200/60 mb-2">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="text-sm font-bold text-slate-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-[#3b38e4] border border-indigo-200">
                Dealer
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>

          {/* Option 1: My Profile */}
          <button
            type="button"
            id="dealer-profile-menu-item"
            role="menuitem"
            onClick={handleProfileClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all duration-150 cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200/80 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-[#3b38e4]" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">My Profile</p>
              <p className="text-[11px] text-slate-500">Details & Purchase Requirements</p>
            </div>
          </button>

          <div className="my-1.5 h-px bg-slate-100" />

          {/* Option 2: Logout */}
          <button
            type="button"
            id="dealer-logout-menu-item"
            role="menuitem"
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <LogOut className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-red-600">Logout</p>
              <p className="text-[11px] text-red-400">Sign out of your session</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default DealerProfileDropdown;

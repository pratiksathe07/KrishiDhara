import React, { useState } from "react";
import { Search, Bell, Menu } from "lucide-react";

/**
 * TopBar component for Admin Dashboard
 * 
 * Props:
 * - activeTab: current active sidebar tab ("overview", "users", "complaints", etc.)
 * - onMenuClick: callback to open the mobile sidebar drawer
 * - title: optional override for the page title
 * - breadcrumb: optional override for the breadcrumb text
 */
const TopBar = ({ activeTab = "overview", onMenuClick, title, breadcrumb }) => {
  const [searchValue, setSearchValue] = useState("");

  // Map activeTab to display titles and breadcrumbs
  const tabTitles = {
    overview: "Overview",
    users: "User Management",
    complaints: "Reports & Complaints",
    settings: "System Settings",
  };

  const currentTitle = title || tabTitles[activeTab] || "Overview";
  const currentBreadcrumb = breadcrumb || (
    <>
      <span>Dashboard</span>
      <span className="text-white/30">/</span>
      <span className="text-white/80">{currentTitle}</span>
    </>
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);
    console.log("Search query:", value);
  };

  return (
    <header className="sticky top-3 sm:top-4 z-30 mx-4 sm:mx-6 lg:mx-8 mb-4 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl px-5 sm:px-6 py-3.5 flex items-center justify-between gap-4 shadow-xl shadow-black/20 transition-all">
      {/* Left side: Page Title & Breadcrumb (plus mobile menu toggle) */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors focus:outline-none"
            aria-label="Open sidebar"
          >
            <Menu size={22} />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-tight truncate">
            {currentTitle}
          </h1>
          <p className="text-xs text-white/50 font-medium mt-0.5 truncate flex items-center gap-1.5">
            {currentBreadcrumb}
          </p>
        </div>
      </div>

      {/* Middle: Search input (hidden on small screens) */}
      <div className="hidden md:flex flex-1 max-w-md mx-4 lg:mx-8">
        <div className="relative w-full">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder="Search farmers, dealers, labourers…"
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500/50 hover:bg-white/[0.08] transition-all"
          />
        </div>
      </div>

      {/* Right side: Notification bell with badge & Admin initials avatar */}
      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        {/* Notification Bell */}
        <button
          type="button"
          className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all focus:outline-none"
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-black/40">
            3
          </span>
        </button>

        {/* Circular Avatar showing "AD" */}
        <div
          className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-xs font-bold text-white shadow-md border border-white/20 select-none ring-2 ring-white/10 hover:ring-emerald-500/50 transition-all cursor-pointer"
          title="Admin"
        >
          AD
        </div>
      </div>
    </header>
  );
};

export default TopBar;

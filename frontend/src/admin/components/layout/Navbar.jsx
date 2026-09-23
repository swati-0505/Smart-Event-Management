// Navbar.jsx
// Top bar — responsive search + theme + notifications + profile.

import { useState, useRef, useEffect } from "react";
import { Search, Bell, Menu, X, ChevronDown, ChevronLeft } from "lucide-react";

const mockNotifications = [
  { id: 1, title: "New event created", description: "Tech Fest 2025 has been created.", time: "12 min ago", unread: true },
  { id: 2, title: "Registration received", description: "Rahul Sharma registered for Cultural Fest.", time: "25 min ago", unread: true },
  { id: 3, title: "Reminder", description: "Workshop starts in 30 minutes.", time: "1 hr ago", unread: false },
];

function Navbar({
  searchQuery,
  onSearchChange,
  onMenuClick,
  sidebarOpen,
  theme,
  onToggleTheme,
  onLogout,
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  const adminName = localStorage.getItem("admin-name") || "Admin";
  const adminEmail = localStorage.getItem("admin-email") || "admin@test.com";
  const adminInitial = adminName.charAt(0).toUpperCase();

  useEffect(() => {
    function handleClick(e) {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const unreadCount = mockNotifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 border-b border-theme bg-theme-secondary/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-2 px-3 sm:h-18 sm:gap-4 sm:px-6 lg:px-8">
        {/* ============ LEFT ============ */}
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="nav-toggle-btn"
            aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
            title={sidebarOpen ? "Close sidebar" : "Open sidebar"}
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={18} />}
          </button>

          <div className="hidden w-full max-w-md items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3.5 py-2.5 sm:flex">
            <Search size={16} className="shrink-0 text-theme-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, users, or anything..."
              className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowMobileSearch(true)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary sm:hidden"
            aria-label="Search"
          >
            <Search size={18} />
          </button>
        </div>

        {/* ============ RIGHT ============ */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <label className="bb8-toggle" aria-label="Toggle theme">
            <input
              className="bb8-toggle__checkbox"
              type="checkbox"
              checked={theme === "light"}
              onChange={onToggleTheme}
            />
            <div className="bb8-toggle__container">
              <div className="bb8-toggle__scenery">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="bb8-toggle__star" />
                ))}
                <div className="tatto-1" />
                <div className="tatto-2" />
                <div className="gomrassen" />
                <div className="hermes" />
                <div className="chenini" />
                <div className="bb8-toggle__cloud" />
                <div className="bb8-toggle__cloud" />
                <div className="bb8-toggle__cloud" />
              </div>
              <div className="bb8">
                <div className="bb8__head-container">
                  <div className="bb8__antenna" />
                  <div className="bb8__antenna" />
                  <div className="bb8__head" />
                </div>
                <div className="bb8__body" />
              </div>
              <div className="artificial__hidden">
                <div className="bb8__shadow" />
              </div>
            </div>
          </label>

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-ghost relative"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="animate-scale-in absolute right-0 top-full mt-2 w-[calc(100vw-1.5rem)] max-w-sm overflow-hidden rounded-xl border border-theme bg-theme-secondary shadow-xl sm:w-80">
                <div className="flex items-center justify-between border-b border-theme px-4 py-3">
                  <h3 className="text-sm font-semibold text-theme-primary">
                    Notifications
                  </h3>
                  <button type="button" onClick={() => setShowNotifications(false)} className="btn-ghost">
                    <X size={14} />
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {mockNotifications.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      className="flex w-full items-start gap-3 border-b border-theme px-4 py-3 text-left last:border-b-0 hover:bg-theme-hover"
                    >
                      <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-500" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-theme-primary">{n.title}</p>
                        <p className="mt-0.5 text-xs text-theme-muted">{n.description}</p>
                        <p className="mt-1 text-[11px] text-theme-dim">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 rounded-xl px-1.5 py-1.5 transition hover:bg-theme-hover"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                {adminInitial}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-theme-primary">
                  {adminName}
                </p>
                <p className="text-[11px] text-theme-muted">Admin</p>
              </div>
              <ChevronDown size={14} className="hidden text-theme-muted sm:block" />
            </button>

            {showProfile && (
              <div className="animate-scale-in absolute right-0 top-full mt-2 w-56 overflow-hidden rounded-xl border border-theme bg-theme-secondary shadow-xl">
                <div className="border-b border-theme px-4 py-3">
                  <p className="text-sm font-semibold text-theme-primary">{adminName}</p>
                  <p className="text-xs text-theme-muted">{adminEmail}</p>
                </div>
                <button type="button" className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-theme-secondary hover:bg-theme-hover">
                  My Profile
                </button>
                <button
                  type="button"
                  onClick={onLogout}
                  className="flex w-full items-center gap-2 border-t border-theme px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="animate-fade-in border-t border-theme bg-theme-secondary p-3 sm:hidden">
          <div className="flex items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5">
            <Search size={16} className="text-theme-muted" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search events, users..."
              className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
            />
            <button
              type="button"
              onClick={() => setShowMobileSearch(false)}
              className="rounded-lg p-1 text-theme-muted hover:text-theme-primary"
              aria-label="Close search"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
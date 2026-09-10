// Navbar.jsx
// Top navigation bar with search, notifications, BB-8 theme toggle, and user info.

import { useState, useRef, useEffect } from "react";
import { Bell, Menu, Search, X } from "lucide-react";

// Mock notifications data
// Later, this will come from backend API
const mockNotifications = [
  {
    id: 1,
    title: "New Event Created",
    description: "Tech Summit 2026 has been created.",
    time: "12 min ago",
    type: "event",
  },
  {
    id: 2,
    title: "Registration Received",
    description: "Rahul Sharma registered for Design Workshop.",
    time: "25 min ago",
    type: "registration",
  },
  {
    id: 3,
    title: "Venue Updated",
    description: "Innovation Hall capacity updated to 200.",
    time: "1 hr ago",
    type: "venue",
  },
  {
    id: 4,
    title: "Event Status Changed",
    description: "Startup Meetup status changed to PENDING.",
    time: "2 hrs ago",
    type: "status",
  },
];

function Navbar({
  onMenuClick,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}) {
  // State for notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState(mockNotifications);

  // Ref for closing dropdown on outside click
  const notificationRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-30 h-[72px] border-b border-theme bg-theme-primary/95 backdrop-blur lg:left-64">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left Section - Menu and Title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md p-2 text-theme-muted transition hover:bg-white/[0.05] hover:text-theme-primary lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent/75">
              SmartEvent
            </p>

            <h2 className="mt-0.5 truncate text-sm font-semibold tracking-[-0.01em] text-theme-secondary sm:text-base">
              Event Operations
            </h2>
          </div>
        </div>

        {/* Right Section - Search, BB-8 Toggle, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex w-[150px] items-center gap-2 rounded-md border border-theme-accent/25 bg-theme-accent/5 px-3 py-2 shadow-[0_0_0_1px_rgba(215,166,58,0.04)] sm:w-[220px] lg:w-[260px]">
            <Search
              size={15}
              strokeWidth={1.7}
              className="shrink-0 text-theme-accent/80"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search events..."
              className="min-w-0 flex-1 bg-transparent text-xs text-theme-secondary outline-none placeholder:text-theme-dim"
            />
          </div>

          {/* BB-8 Theme Toggle */}
          <label className="bb8-toggle" aria-label="Toggle theme">
            <input
              className="bb8-toggle__checkbox"
              type="checkbox"
              checked={theme === "light"}
              onChange={onToggleTheme}
            />
            <div className="bb8-toggle__container">
              <div className="bb8-toggle__scenery">
                <div className="bb8-toggle__star"></div>
                <div className="bb8-toggle__star"></div>
                <div className="bb8-toggle__star"></div>
                <div className="bb8-toggle__star"></div>
                <div className="bb8-toggle__star"></div>
                <div className="bb8-toggle__star"></div>
                <div className="bb8-toggle__star"></div>
                <div className="tatto-1"></div>
                <div className="tatto-2"></div>
                <div className="gomrassen"></div>
                <div className="hermes"></div>
                <div className="chenini"></div>
                <div className="bb8-toggle__cloud"></div>
                <div className="bb8-toggle__cloud"></div>
                <div className="bb8-toggle__cloud"></div>
              </div>
              <div className="bb8">
                <div className="bb8__head-container">
                  <div className="bb8__antenna"></div>
                  <div className="bb8__antenna"></div>
                  <div className="bb8__head"></div>
                </div>
                <div className="bb8__body"></div>
              </div>
              <div className="artificial__hidden">
                <div className="bb8__shadow"></div>
              </div>
            </div>
          </label>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-md p-2 text-theme-muted transition hover:bg-white/[0.05] hover:text-theme-primary"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={1.6} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-theme-accent" />
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-lg border border-theme bg-theme-secondary shadow-2xl">
                <div className="flex items-center justify-between border-b border-theme px-4 py-3">
                  <h3 className="text-sm font-semibold text-theme-primary">
                    Notifications
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-theme-muted transition hover:text-theme-primary"
                  >
                    <X size={14} />
                  </button>
                </div>

                <div className="notification-scroll max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        className="flex w-full items-start gap-3 border-b border-theme px-4 py-3 text-left transition hover:bg-theme-primary/5 last:border-b-0"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-accent/10">
                          <span className="text-sm">📢</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-theme-secondary">
                            {notification.title}
                          </p>

                          <p className="mt-0.5 text-xs text-theme-muted line-clamp-2">
                            {notification.description}
                          </p>

                          <p className="mt-1 text-[10px] text-theme-dim">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-theme-muted">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden h-8 w-px bg-theme sm:block" />

          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-theme-secondary">
              Admin
            </p>

            <p className="text-[10px] text-theme-dim">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
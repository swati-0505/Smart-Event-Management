// Navbar.jsx
// Top navigation bar with search, notifications, and user info.

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
    <header className="fixed left-0 right-0 top-0 z-30 h-[72px] border-b border-white/[0.08] bg-[#090909]/95 backdrop-blur lg:left-64">
      <div className="flex h-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left Section - Menu and Title */}
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="rounded-md p-2 text-white/50 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>

          <div className="min-w-0">
            <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]/75">
              SmartEvent
            </p>

            <h2 className="mt-0.5 truncate text-sm font-semibold tracking-[-0.01em] text-white/90 sm:text-base">
              Event Operations
            </h2>
          </div>
        </div>

        {/* Right Section - Search, Notifications, User */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex w-[150px] items-center gap-2 rounded-md border border-[#d7a63a]/25 bg-[#d7a63a]/[0.06] px-3 py-2 shadow-[0_0_0_1px_rgba(215,166,58,0.04)] sm:w-[220px] lg:w-[260px]">
            <Search
              size={15}
              strokeWidth={1.7}
              className="shrink-0 text-[#d7a63a]/80"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search events..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>

          {/* Notification Bell with Dropdown */}
          <div className="relative" ref={notificationRef}>
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-md p-2 text-white/40 transition hover:bg-white/[0.04] hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={1.6} />

              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#d7a63a]" />
            </button>

            {/* Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 overflow-hidden rounded-lg border border-white/[0.08] bg-[#111111] shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-3">
                  <h3 className="text-sm font-semibold text-white">
                    Notifications
                  </h3>

                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-white/30 transition hover:text-white"
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
                        className="flex w-full items-start gap-3 border-b border-white/[0.05] px-4 py-3 text-left transition hover:bg-white/[0.02] last:border-b-0"
                      >
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7a63a]/10">
                          <span className="text-sm">📢</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-white/85">
                            {notification.title}
                          </p>

                          <p className="mt-0.5 text-xs text-white/45 line-clamp-2">
                            {notification.description}
                          </p>

                          <p className="mt-1 text-[10px] text-white/25">
                            {notification.time}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-sm text-white/30">
                      No notifications yet.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="hidden h-8 w-px bg-white/[0.08] sm:block" />

          <div className="hidden text-right sm:block">
            <p className="text-xs font-semibold text-white/80">
              Thangrasu
            </p>

            <p className="text-[10px] text-white/30">
              Administrator
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
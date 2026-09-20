import {
  LayoutDashboard,
  Calendar,
  Users,
  BarChart3,
  Bot,
  Settings,
  Plus,
  ClipboardList,
  FileText,
  Sparkles,
} from "lucide-react";

const mainNav = [
  { label: "Home", page: "home", icon: LayoutDashboard },
  { label: "Calendar", page: "calendar", icon: Calendar },
  { label: "Events", page: "events", icon: Calendar },
  { label: "Registrations", page: "registrations", icon: ClipboardList },
  { label: "Users", page: "users", icon: Users },
  { label: "Reports & Analytics", page: "reports", icon: BarChart3 },
  { label: "AI Assistant", page: "ai-assistant", icon: Bot },
  { label: "Settings", page: "settings", icon: Settings },
];

const quickActions = [
  { label: "Create Event", page: "events", icon: Plus },
  { label: "View Registrations", page: "registrations", icon: Users },
  { label: "Generate Report", page: "reports", icon: FileText },
];

function Sidebar({ currentPage, onPageChange, sidebarOpen, onClose }) {
  function handleNavClick(page) {
    onPageChange(page);
    // Auto-close sidebar on mobile/tablet after selecting a page
    if (typeof window !== "undefined" && window.innerWidth < 1024 && onClose) {
      onClose();
    }
  }

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-50 flex w-65 flex-col",
        "border-r border-theme bg-theme-secondary",
        "transition-transform duration-300 ease-in-out",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      {/* Logo */}
      <div className="flex h-18 items-center gap-3 border-b border-theme px-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 shadow-lg">
          <Sparkles size={20} className="text-white" />
        </div>
        <div>
          <h1 className="text-[15px] font-bold leading-tight text-theme-primary">
            Smart Event
          </h1>
          <p className="text-[11px] font-medium text-theme-muted">Management</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        {/* Main nav */}
        <div className="space-y-1">
          {mainNav.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                type="button"
                onClick={() => handleNavClick(item.page)}
                className={`nav-item ${isActive ? "active" : ""}`}
              >
                <Icon size={18} strokeWidth={1.9} />
                <span className="flex-1">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-5 border-t border-theme" />

        {/* Quick Actions */}
        <div>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-theme-dim">
            Quick Actions
          </p>
          <div className="space-y-1">
            {quickActions.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleNavClick(item.page)}
                  className="nav-item"
                >
                  <Icon size={17} strokeWidth={1.9} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
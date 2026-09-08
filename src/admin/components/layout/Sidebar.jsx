// Sidebar.jsx
// Left navigation sidebar with sections and navigation items.

import {
  Activity,
  Bot,
  Building2,
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings,
  Users,
  ClipboardList,
  X,
} from "lucide-react";

import logo from "../../../assets/smartevent-logo.png.png";

const sections = [
  {
    title: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        page: "dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "EVENT MANAGEMENT",
    items: [
      {
        label: "Events",
        page: "events",
        icon: CalendarDays,
      },
    ],
  },
  {
    title: "OPERATIONS",
    items: [
      {
        label: "Venues",
        page: "venues",
        icon: Building2,
      },
      {
        label: "Registrations",
        page: "registrations",
        icon: ClipboardList,
      },
      {
        label: "Payments",
        page: "payments",
        icon: CreditCard,
      },
      {
        label: "Feedback",
        page: "feedback",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "INTELLIGENCE",
    items: [
      {
        label: "AI Assistant",
        page: "ai-assistant",
        icon: Bot,
      },
      {
        label: "Agent Activity",
        page: "agent-activity",
        icon: Activity,
      },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      {
        label: "Users",
        page: "users",
        icon: Users,
      },
      {
        label: "Settings",
        page: "settings",
        icon: Settings,
      },
    ],
  },
];

function Sidebar({
  currentPage,
  onPageChange,
  sidebarOpen,
  onClose,
}) {
  function handlePageChange(page) {
    onPageChange(page);

    // Close the mobile sidebar after selecting a page.
    if (onClose) {
      onClose();
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/65 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col",
          "border-r border-white/[0.08] bg-[#090909]",
          "transition-transform duration-300 ease-out",
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo Section */}
        <div className="flex h-[72px] items-center justify-center border-b border-white/[0.08] px-5">
          <img
            src={logo}
            alt="SmartEvent"
            className="h-30 w-auto object-contain"
          />
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-2 text-white/35 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
          aria-label="Close sidebar"
        >
          <X size={18} strokeWidth={1.7} />
        </button>

        {/* Navigation Sections */}
        <nav className="admin-sidebar-scroll flex-1 overflow-y-auto px-3 py-6">
          {sections.map((section) => (
            <div
              key={section.title}
              className="mb-7"
            >
              <p className="mb-2 px-3 text-[9px] font-semibold tracking-[0.2em] text-[#d7a63a]/70">
                {section.title}
              </p>

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.page;

                  return (
                    <button
                      key={item.page}
                      type="button"
                      onClick={() => handlePageChange(item.page)}
                      className={[
                        "flex w-full items-center gap-3 rounded-md border-l-2",
                        "px-3 py-2.5 text-left text-[13px]",
                        "transition-all duration-200",
                        isActive
                          ? "border-[#d7a63a] bg-[#d7a63a]/10 text-[#e0ad3c]"
                          : "border-transparent text-white/45 hover:bg-white/[0.045] hover:text-white",
                      ].join(" ")}
                    >
                      <Icon
                        size={16}
                        strokeWidth={1.7}
                        className="shrink-0"
                      />

                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-white/[0.08] p-4">
          <div className="flex items-center gap-3 rounded-md px-2 py-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#d7a63a]/15 text-sm font-semibold text-[#d7a63a]">
              T
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/85">
                Thangrasu
              </p>

              <p className="mt-0.5 text-[10px] text-white/30">
                Administrator
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
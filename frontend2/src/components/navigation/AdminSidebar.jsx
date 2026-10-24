import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Ticket,
  Users,
  MapPin,
  MessageSquare,
  CreditCard,
  Bot,
  BookOpen,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

const ADMIN_LINKS = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/admin/events", label: "Events", icon: Calendar },
  { path: "/admin/registrations", label: "Registrations", icon: Ticket },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/venues", label: "Venues", icon: MapPin },
  { path: "/admin/feedback", label: "Feedback", icon: MessageSquare },
  { path: "/admin/payments", label: "Payments", icon: CreditCard },
  { path: "/admin/ai-chat", label: "AI Assistant", icon: Bot },
  { path: "/admin/knowledge", label: "Knowledge Base", icon: BookOpen },
  { path: "/admin/agent-activity", label: "Agent Logs", icon: Activity },
];

export default function AdminSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const sidebarContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "1.25rem 0.75rem",
        backgroundColor: "var(--bg-secondary)",
        borderRight: "1px solid var(--border-color)",
      }}
    >
      
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          padding: "0 0.5rem 1.25rem",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "1.25rem",
        }}
      >
        {!collapsed && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 800, fontSize: "1.1rem" }}>
            <span style={{ color: "var(--color-primary)" }}>SmartEvent</span>
            <span
              style={{
                fontSize: "0.65rem",
                padding: "0.1rem 0.4rem",
                background: "var(--color-primary)",
                color: "#fff",
                borderRadius: "var(--radius-sm)",
                letterSpacing: "0.05em",
              }}
            >
              ADMIN
            </span>
          </div>
        )}

        
        <button
          onClick={onCloseMobile}
          className="btn btn-ghost btn-icon mobile-close-btn"
          style={{ display: "none" }}
          aria-label="Close menu"
        >
          <X size={18} />
        </button>

        
        <button
          onClick={onToggleCollapse}
          className="btn btn-ghost btn-icon desktop-collapse-btn"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      
      <nav style={{ display: "flex", flexDirection: "column", gap: "0.375rem", flex: 1, overflowY: "auto" }}>
        {ADMIN_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              onClick={onCloseMobile}
              title={collapsed ? link.label : undefined}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: collapsed ? "0.625rem" : "0.625rem 0.875rem",
                justifyContent: collapsed ? "center" : "flex-start",
                borderRadius: "var(--radius-md)",
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
                backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
                transition: "all var(--transition-fast)",
              })}
            >
              <Icon size={18} style={{ flexShrink: 0 }} />
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      
      <aside
        style={{
          width: collapsed ? "70px" : "var(--sidebar-width)",
          transition: "width var(--transition-base)",
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 90,
          flexShrink: 0,
        }}
        className="admin-desktop-sidebar"
      >
        {sidebarContent}
      </aside>

      
      {mobileOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(2px)",
          }}
          onClick={onCloseMobile}
        >
          <div
            style={{
              width: "260px",
              height: "100%",
              backgroundColor: "var(--bg-elevated)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .admin-desktop-sidebar { display: none !important; }
          .mobile-close-btn { display: flex !important; }
          .desktop-collapse-btn { display: none !important; }
        }
      `}</style>
    </>
  );
}

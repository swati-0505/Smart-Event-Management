import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, LogOut, ExternalLink, Menu, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { useAIChat } from "../../context/AIChatContext";

export default function AdminNavbar({ onOpenMobile }) {
  const { user, logout } = useAuth();
  const { toggleAIChat } = useAIChat();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header
      style={{
        height: "var(--navbar-height)",
        backgroundColor: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 80,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={onOpenMobile}
          className="btn btn-ghost btn-icon admin-mobile-toggle"
          aria-label="Open sidebar"
          style={{ display: "none" }}
        >
          <Menu size={20} />
        </button>
        <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--text-secondary)" }}>
          Administrator Workspace
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <button
          onClick={toggleAIChat}
          className="btn btn-secondary btn-sm"
          style={{
            background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(129, 140, 248, 0.15))",
            borderColor: "rgba(99, 102, 241, 0.3)",
            color: "var(--color-primary)",
            fontWeight: 600,
          }}
        >
          <Sparkles size={16} style={{ color: "var(--color-primary)" }} /> AI Assistant
        </button>

        <Link
          to="/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-ghost btn-sm"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
        >
          <span>Live Site</span>
          <ExternalLink size={14} />
        </Link>

        <div style={{ height: "24px", width: "1px", backgroundColor: "var(--border-color)" }} />

        <div style={{ display: "flex", alignItems: "center", gap: "0.625rem" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              background: "var(--color-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={16} />}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "0.85rem", fontWeight: 600, lineHeight: 1.2 }}>{user?.name || "Admin"}</span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{user?.email}</span>
          </div>
        </div>

        <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Sign out">
          <LogOut size={18} />
        </button>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-mobile-toggle { display: flex !important; }
        }
      `}</style>
    </header>
  );
}

import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Calendar, User, LogOut, LayoutDashboard, Ticket, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { useAIChat } from "../../context/AIChatContext";

export default function UserNavbar() {
  const { user, logout } = useAuth();
  const { toggleAIChat } = useAIChat();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        backgroundColor: "var(--bg-elevated)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <div
        className="container"
        style={{
          height: "var(--navbar-height)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/dashboard"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.625rem",
            fontWeight: 800,
            fontSize: "1.25rem",
            color: "var(--color-primary)",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--color-primary), #818cf8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
            }}
          >
            <Calendar size={20} />
          </div>
          <span>SmartEvent</span>
        </Link>

        
        <nav style={{ display: "none", alignItems: "center", gap: "1.5rem" }} className="desktop-user-nav">
          <NavLink
            to="/events"
            style={({ isActive }) => ({
              fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
            })}
          >
            Explore Events
          </NavLink>
          <NavLink
            to="/dashboard"
            style={({ isActive }) => ({
              fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            })}
          >
            <LayoutDashboard size={16} /> Dashboard
          </NavLink>
          <NavLink
            to="/my-events"
            style={({ isActive }) => ({
              fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            })}
          >
            <Ticket size={16} /> My Registrations
          </NavLink>
        </nav>

        
        <div style={{ display: "none", alignItems: "center", gap: "1rem" }} className="desktop-user-nav">
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
            to="/profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              padding: "0.375rem 0.75rem",
              borderRadius: "var(--radius-full)",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "var(--color-primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
              }}
            >
              {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
            </div>
            <span>{user?.name || "User"}</span>
          </Link>

          <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Sign out">
            <LogOut size={18} />
          </button>
        </div>

        
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn btn-ghost btn-icon user-mobile-toggle"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      
      {mobileOpen && (
        <div
          style={{
            padding: "1rem var(--space-lg) 1.5rem",
            borderTop: "1px solid var(--border-color)",
            backgroundColor: "var(--bg-elevated)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <NavLink to="/events" onClick={() => setMobileOpen(false)} style={{ padding: "0.5rem 0", fontWeight: 500 }}>
            Explore Events
          </NavLink>
          <NavLink to="/dashboard" onClick={() => setMobileOpen(false)} style={{ padding: "0.5rem 0", fontWeight: 500 }}>
            Dashboard
          </NavLink>
          <NavLink to="/my-events" onClick={() => setMobileOpen(false)} style={{ padding: "0.5rem 0", fontWeight: 500 }}>
            My Registrations
          </NavLink>
          <NavLink to="/profile" onClick={() => setMobileOpen(false)} style={{ padding: "0.5rem 0", fontWeight: 500 }}>
            My Profile
          </NavLink>
          <button
            onClick={() => {
              handleLogout();
              setMobileOpen(false);
            }}
            className="btn btn-danger"
            style={{ justifyContent: "flex-start", marginTop: "0.5rem" }}
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-user-nav { display: flex !important; }
          .user-mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}

import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Calendar, User, LogOut, LayoutDashboard, Shield, Menu, X, Sparkles } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { useAIChat } from "../../context/AIChatContext";

export default function PublicNavbar() {
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
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
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(12px)",
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
          to="/"
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
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <Calendar size={20} />
          </div>
          <span>SmartEvent</span>
        </Link>

        
        <nav style={{ display: "none", alignItems: "center", gap: "1.5rem" }} className="desktop-nav">
          <NavLink
            to="/"
            end
            style={({ isActive }) => ({
              fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            style={({ isActive }) => ({
              fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            Events
          </NavLink>
          <NavLink
            to="/about"
            style={({ isActive }) => ({
              fontWeight: 500,
              color: isActive ? "var(--color-primary)" : "var(--text-secondary)",
              transition: "color var(--transition-fast)",
            })}
          >
            About
          </NavLink>
        </nav>

        
        <div style={{ display: "none", alignItems: "center", gap: "0.75rem" }} className="desktop-nav">
          {isAuthenticated ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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

              {isAdmin ? (
                <Link to="/admin" className="btn btn-secondary btn-sm">
                  <Shield size={16} /> Admin Portal
                </Link>
              ) : (
                <Link to="/dashboard" className="btn btn-secondary btn-sm">
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Link to="/profile" className="btn btn-ghost btn-icon" title={user?.name || "Profile"}>
                  <User size={18} />
                </Link>
                <button onClick={handleLogout} className="btn btn-ghost btn-icon" title="Logout">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>

        
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="btn btn-ghost btn-icon mobile-toggle"
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
          <NavLink to="/" end onClick={() => setMobileOpen(false)} style={{ padding: "0.5rem 0", fontWeight: 500 }}>
            Home
          </NavLink>
          <NavLink to="/events" onClick={() => setMobileOpen(false)} style={{ padding: "0.5rem 0", fontWeight: 500 }}>
            Events
          </NavLink>
          <NavLink to="/about" onClick={() => setMobileOpen(false)} style={{ padding: "0.5rem 0", fontWeight: 500 }}>
            About
          </NavLink>
          <div style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-secondary"
                  style={{ justifyContent: "flex-start" }}
                >
                  <LayoutDashboard size={16} /> {isAdmin ? "Admin Portal" : "Dashboard"}
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileOpen(false);
                  }}
                  className="btn btn-danger"
                  style={{ justifyContent: "flex-start" }}
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn btn-secondary">
                  Sign In
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn btn-primary">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .mobile-toggle { display: none !important; }
        }
      `}</style>
    </header>
  );
}

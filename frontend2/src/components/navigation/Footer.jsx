import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Globe, Share2, Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-color)",
        padding: "3rem 0 2rem",
        marginTop: "auto",
      }}
    >
      <div className="container" style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "2rem",
          }}
        >
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <Link
              to="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontWeight: 800,
                fontSize: "1.2rem",
                color: "var(--color-primary)",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "8px",
                  background: "var(--color-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                }}
              >
                <Calendar size={18} />
              </div>
              <span>SmartEvent</span>
            </Link>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", lineHeight: 1.6, maxWidth: "280px" }}>
              Next-generation intelligent event discovery, venue allocation, and registration management platform.
            </p>
          </div>

          
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Navigation</h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <li><Link to="/" style={{ transition: "color var(--transition-fast)" }}>Home</Link></li>
              <li><Link to="/events" style={{ transition: "color var(--transition-fast)" }}>All Events</Link></li>
              <li><Link to="/about" style={{ transition: "color var(--transition-fast)" }}>About Us</Link></li>
              <li><Link to="/login" style={{ transition: "color var(--transition-fast)" }}>Sign In</Link></li>
            </ul>
          </div>

          
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Platform</h4>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
              <li>Real-time Registrations</li>
              <li>AI Event Assistant</li>
              <li>Intelligent RAG Knowledge</li>
              <li>Venue Capacity Analytics</li>
            </ul>
          </div>

          
          <div>
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, marginBottom: "1rem" }}>Connect</h4>
            <div style={{ display: "flex", gap: "0.75rem", color: "var(--text-secondary)" }}>
              <a href="#" className="btn btn-ghost btn-icon" aria-label="Website"><Globe size={18} /></a>
              <a href="#" className="btn btn-ghost btn-icon" aria-label="Social Share"><Share2 size={18} /></a>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            paddingTop: "1.5rem",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            fontSize: "0.825rem",
            color: "var(--text-muted)",
          }}
        >
          <span>© {new Date().getFullYear()} SmartEvent. All rights reserved.</span>
          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            Built with <Heart size={14} style={{ color: "var(--color-danger)" }} /> for modern web apps
          </span>
        </div>
      </div>
    </footer>
  );
}

import React from "react";
import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "var(--bg-secondary)",
        textAlign: "center",
      }}
    >
      <div className="card" style={{ maxWidth: "450px", padding: "3rem 2rem" }}>
        <div style={{ fontSize: "5rem", fontWeight: 900, color: "var(--color-primary)", lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 800, margin: "1rem 0 0.5rem" }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "2rem" }}>
          The page you are looking for doesn't exist or has been moved.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Return Home
          </Link>
        </div>
      </div>
    </div>
  );
}

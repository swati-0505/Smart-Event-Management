import React from "react";
import { User, Mail, Shield, Calendar } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import Badge from "../../components/common/Badge";

export default function Profile() {
  const { user } = useAuth();

  const joinedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
    : "Member";

  return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800, marginBottom: "0.25rem" }}>
          User Profile
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage your account credentials and personal preferences.
        </p>
      </div>

      <div className="card" style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, var(--color-primary), #818cf8)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.75rem",
              fontWeight: 800,
              boxShadow: "var(--shadow-md)",
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={32} />}
          </div>

          <div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {user?.name || "Attendee"}
            </h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
              <Badge variant={user?.role === "ADMIN" ? "primary" : "info"}>
                {user?.role || "USER"}
              </Badge>
              <span style={{ fontSize: "0.825rem", color: "var(--text-muted)" }}>
                Member since {joinedDate}
              </span>
            </div>
          </div>
        </div>

        <hr style={{ border: "none", borderTop: "1px solid var(--border-color)" }} />

        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Account Information</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="form-input" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                {user?.name}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input" style={{ backgroundColor: "var(--bg-tertiary)" }}>
                {user?.email}
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
            <div className="form-group">
              <label className="form-label">Account Role</label>
              <div className="form-input" style={{ backgroundColor: "var(--bg-tertiary)", textTransform: "capitalize" }}>
                {user?.role?.toLowerCase()}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">User Identifier</label>
              <div className="form-input" style={{ backgroundColor: "var(--bg-tertiary)", fontSize: "0.75rem", fontFamily: "monospace" }}>
                {user?.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

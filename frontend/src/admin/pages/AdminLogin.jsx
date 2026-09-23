// AdminLogin.jsx
// Admin authentication — real backend login, with demo-mode fallback.

import { useState } from "react";
import { apiRequest } from "../services/api";
import "./AdminLogin.css";

const AUTH_KEYS = [
  "admin-auth-token",
  "admin-token-type",
  "admin-name",
  "admin-email",
  "admin-role",
];

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [demoNotice, setDemoNotice] = useState(false);

  function saveDemoSession(email) {
    localStorage.setItem("admin-auth-token", "demo-token");
    localStorage.setItem("admin-name", email.split("@")[0] || "Admin");
    localStorage.setItem("admin-email", email);
    localStorage.setItem("admin-role", "Admin");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Real backend login
      const authData = await apiRequest("/auth/login", {
        method: "POST",
        body: { email, password },
      });

      if (!authData?.access_token) {
        throw new Error("Invalid response from server.");
      }

      localStorage.setItem("admin-auth-token", authData.access_token);
      if (authData.token_type) {
        localStorage.setItem("admin-token-type", authData.token_type);
      }

      // Fetch user info (non-fatal if fails)
      try {
        const userData = await apiRequest("/auth/me", { method: "GET" });
        if (userData?.name) localStorage.setItem("admin-name", userData.name);
        if (userData?.email) localStorage.setItem("admin-email", userData.email);
        if (userData?.role) localStorage.setItem("admin-role", userData.role);
      } catch {
        /* fallback to defaults */
      }

      onLoginSuccess();
    } catch (err) {
      // If backend unreachable → demo mode
      const isNetworkError =
        err?.message?.includes("timed out") ||
        err?.message?.includes("Failed to fetch") ||
        err?.message?.includes("NetworkError") ||
        err?.name === "TypeError";

      if (isNetworkError) {
        saveDemoSession(email);
        setDemoNotice(true);
        setTimeout(() => onLoginSuccess(), 800);
        return;
      }

      // Real auth error (wrong password, etc.)
      AUTH_KEYS.forEach((k) => localStorage.removeItem(k));
      setError(err?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-box">
        <div className="admin-login-brand">
          Smart<span>Event</span>
          <p>Admin Panel</p>
        </div>

        <h2>Sign in to Admin</h2>

        {error && <p className="admin-login-error">{error}</p>}

        {demoNotice && (
          <div className="admin-login-error" style={{ background: "#fef3c7", color: "#92400e" }}>
            Backend offline — entering demo mode…
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="admin-login-field">
            <label htmlFor="admin-email">Email Address</label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="admin-login-field">
            <label htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading || demoNotice}
          >
            {loading ? "Signing in…" : demoNotice ? "Entering…" : "Sign In"}
          </button>
        </form>

        <p style={{ marginTop: 16, fontSize: 11, color: "#64748b", textAlign: "center" }}>
          Backend offline? Any credentials work in demo mode.
        </p>
      </div>
    </main>
  );
}

export default AdminLogin;
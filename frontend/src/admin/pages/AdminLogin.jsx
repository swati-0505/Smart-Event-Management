// AdminLogin.jsx
// Admin authentication page.

import { useState } from "react";
import { apiRequest } from "../services/api";
import "./AdminLogin.css";

function AdminLogin({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // Backend login API
      const data = await apiRequest("/auth/login", {
        method: "POST",
        body: {
          email,
          password,
        },
      });

      // Save authentication token
      localStorage.setItem("admin-token", data.access_token);

      if (data.token_type) {
        localStorage.setItem(
          "admin-token-type",
          data.token_type
        );
      }

      // Tell AdminApp that login was successful
      onLoginSuccess();
    } catch (err) {
      console.error("Admin login failed:", err);

      setError(
        typeof err?.message=== "string"
          ? err.message
          : "Login failed. Please check your credentials and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="admin-login-page">
      <div className="admin-login-box">

        {/* Brand */}
        <div className="admin-login-brand">
          Smart<span>Event</span>
          <p>Admin Panel</p>
        </div>

        {/* Heading */}
        <h2>Sign in to Admin</h2>

        {/* Error */}
        {error && (
          <p className="admin-login-error">
            {error}
          </p>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>

          {/* Email */}
          <div className="admin-login-field">
            <label htmlFor="admin-email">
              Email Address
            </label>

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

          {/* Password */}
          <div className="admin-login-field">
            <label htmlFor="admin-password">
              Password
            </label>

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

          {/* Submit */}
          <button
            type="submit"
            className="admin-login-submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

        </form>
      </div>
    </main>
  );
}

export default AdminLogin;
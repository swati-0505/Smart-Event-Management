import "./Register.css";
import { useState } from "react";
function Register({ onNavigate }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  return (
    <main className="register-page">

      {/* LEFT SIDE */}
      <div className="register-left">

        <div className="register-brand">
          Smart<span>Event</span>
        </div>

        <div className="register-content">

          <p className="register-eyebrow">
            JOIN SMARTEVENT
          </p>

          <h1>
            Your next
            <br />
            <span>experience starts here.</span>
          </h1>

          <p>
            Create your account and discover events,
            connect with people, and experience more.
          </p>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">

        <div className="register-box">

          <button
            className="register-back-btn"
            onClick={() => onNavigate("login")}
          >
            ← Back to Login
          </button>

          <p className="register-label">
            CREATE ACCOUNT
          </p>

          <h2>Get started.</h2>

          <p className="register-subtitle">
            Create your SmartEvent account.
          </p>

          <form
  onSubmit={async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }
      alert("Account created! Please sign in.");
      onNavigate("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }}
>
            <div className="register-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className="register-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

            <button className="register-submit" type="submit" disabled={loading}>
  {loading ? "Creating..." : "Create Account →"}
</button>
          </form>

          <p className="login-account-text">
            Already have an account?

            <button
              type="button"
              onClick={() => onNavigate("login")}
            >
              Sign In
            </button>
          </p>

        </div>

      </div>

    </main>
  );
}

export default Register;
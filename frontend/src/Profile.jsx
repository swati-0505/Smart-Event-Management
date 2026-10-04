import "./Profile.css";
import { useState, useEffect } from "react";

function Profile({ onNavigate }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const token = localStorage.getItem("user-auth-token");
      if (!token) {
        onNavigate("login");
        return;
      }

      try {
        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("user-auth-token");
            onNavigate("login");
            return;
          }
          throw new Error("Failed to load profile");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [onNavigate]);

  function handleLogout() {
    localStorage.removeItem("user-auth-token");
    onNavigate("login");
  }

  if (loading) {
    return (
      <main className="profile-page">
        <p style={{ padding: "40px", textAlign: "center" }}>Loading profile...</p>
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="profile-page">
        <p style={{ padding: "40px", textAlign: "center", color: "red" }}>
          {error || "Could not load profile."}
        </p>
      </main>
    );
  }

  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  return (
    <main className="profile-page">

      {/* NAVBAR */}
      <nav className="profile-nav">

        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="profile-nav-links">

          <button onClick={() => onNavigate("home")}>
            Home
          </button>

          <button onClick={() => onNavigate("events")}>
            Events
          </button>

          <button onClick={() => onNavigate("myEvents")}>
            My Events
          </button>

          <button className="active">
            Profile
          </button>

          <button onClick={() => onNavigate("about")}>
            About
          </button>

          <button onClick={() => onNavigate("contact")}>
            Contact
          </button>

        </div>

        <button
          className="profile-login"
          onClick={handleLogout}
        >
          Logout
        </button>

      </nav>

      {/* HERO */}
      <section className="profile-hero">

        <p className="profile-eyebrow">
          YOUR ACCOUNT
        </p>

        <h1>
          My <span>Profile.</span>
        </h1>

        <p>
          Manage your personal information and keep track
          of your SmartEvent experience.
        </p>

      </section>

      {/* PROFILE CONTENT */}
      <section className="profile-section">

        <div className="profile-card">

          <div className="profile-avatar">
            {initials}
          </div>

          <div className="profile-main">

            <p className="profile-label">
              PERSONAL INFORMATION
            </p>

            <h2>
              {user.name}
            </h2>

            <div className="profile-details">

              <div>
                <span>EMAIL ADDRESS</span>
                <strong>{user.email}</strong>
              </div>

              <div>
                <span>ROLE</span>
                <strong>{user.role}</strong>
              </div>

            </div>

          </div>

        </div>

        {/* ACCOUNT STATS */}
        <div className="profile-stats">

          <div className="profile-stat">
            <span>ACCOUNT STATUS</span>
            <strong>ACTIVE</strong>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="profile-actions">

          <button
            className="profile-primary-btn"
            onClick={() => onNavigate("myEvents")}
          >
            View My Events →
          </button>

          <button
            className="profile-secondary-btn"
            onClick={() => onNavigate("home")}
          >
            Back to Home
          </button>

        </div>

      </section>

    </main>
  );
}

export default Profile;
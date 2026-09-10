import "./Profile.css";

function Profile({ onNavigate }) {
  const user = {
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    phone: "+91 98765 43210",
    events: 2,
  };

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
          onClick={() => onNavigate("login")}
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
            RS
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
                <span>PHONE NUMBER</span>
                <strong>{user.phone}</strong>
              </div>

            </div>

          </div>

        </div>

        {/* ACCOUNT STATS */}
        <div className="profile-stats">

          <div className="profile-stat">
            <span>REGISTERED EVENTS</span>
            <strong>
              {String(user.events).padStart(2, "0")}
            </strong>
          </div>

          <div className="profile-stat">
            <span>ACCOUNT STATUS</span>
            <strong>ACTIVE</strong>
          </div>

          <div className="profile-stat">
            <span>MEMBER SINCE</span>
            <strong>2026</strong>
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
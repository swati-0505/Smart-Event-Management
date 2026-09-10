import "./EventDetails.css";

function EventDetails({ onNavigate }) {
  return (
    <main className="event-details-page">

      {/* NAVBAR */}
      <nav className="event-details-nav">

        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="event-details-nav-links">

          <button onClick={() => onNavigate("home")}>
            Home
          </button>

          <button
            className="active"
            onClick={() => onNavigate("events")}
          >
            Events
          </button>

          <button onClick={() => onNavigate("about")}>
            About
          </button>

          <button onClick={() => onNavigate("contact")}>
            Contact
          </button>

        </div>

        <button
          className="event-details-login"
          onClick={() => onNavigate("login")}
        >
          Login
        </button>

      </nav>

      {/* MAIN EVENT */}
      <section className="event-details-hero">

        <div className="event-details-image">

          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85"
            alt="Live Music Night"
          />

        </div>

        <div className="event-details-content">

          <button
            className="event-back-btn"
            onClick={() => onNavigate("events")}
          >
            ← Back to Events
          </button>

          <p className="event-details-label">
            MUSIC · HYDERABAD
          </p>

          <h1>
            Live Music
            <br />
            <span>Night.</span>
          </h1>

          <p className="event-details-description">
            A night of live music, great energy, and unforgettable
            moments with people who love music as much as you do.
          </p>

          <div className="event-meta">

            <div>
              <span>DATE</span>
              <strong>18 SEP 2026</strong>
            </div>

            <div>
              <span>TIME</span>
              <strong>07:00 PM</strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>Hyderabad</strong>
            </div>

          </div>

          <button
            className="event-register-btn"
            onClick={() => onNavigate("eventRegistration")}
          >
            Register for Event →
          </button>

        </div>

      </section>

      {/* EVENT OVERVIEW */}
      <section className="event-overview-section">

        <div className="event-overview-heading">

          <div>
            <p className="event-details-label">
              THE EXPERIENCE
            </p>

            <h2>
              Music.
              <br />
              <span>People. Moments.</span>
            </h2>
          </div>

          <p className="event-overview-intro">
            Everything you need for a memorable night in
            one unforgettable experience.
          </p>

        </div>

        <div className="event-overview-grid">

          <div className="overview-card">

            <span className="overview-number">
              01
            </span>

            <div className="overview-line"></div>

            <h3>
              Live Performances
            </h3>

            <p>
              Experience live music and performances
              throughout the evening.
            </p>

          </div>

          <div className="overview-card">

            <span className="overview-number">
              02
            </span>

            <div className="overview-line"></div>

            <h3>
              Vibrant Atmosphere
            </h3>

            <p>
              Enjoy an energetic setting created for
              music lovers and good moments.
            </p>

          </div>

          <div className="overview-card">

            <span className="overview-number">
              03
            </span>

            <div className="overview-line"></div>

            <h3>
              Shared Experiences
            </h3>

            <p>
              Meet new people, enjoy the music, and
              make memories together.
            </p>

          </div>

        </div>

      </section>

      {/* FINAL CTA */}
      <section className="event-details-cta">

        <div className="event-cta-content">

          <p className="event-details-label">
            18 SEP 2026 · HYDERABAD
          </p>

          <h2>
            Your night
            <br />
            <span>starts here.</span>
          </h2>

        </div>

        <div className="event-cta-action">

          <p>
            Secure your place at Live Music Night.
          </p>

          <button
            onClick={() => onNavigate("eventRegistration")}
          >
            Register Now
            <span>→</span>
          </button>

        </div>

      </section>

    </main>
  );
}

export default EventDetails;
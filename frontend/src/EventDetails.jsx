import "./EventDetails.css";
const CATEGORY_IMAGES = {
  "Tech Conference": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=85",
  "Technology": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1400&q=85",
  "Workshop": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1400&q=85",
  "Networking": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1400&q=85",
  "Corporate Event": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85",
  "Business": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1400&q=85",
  "Cultural": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85",
  "International": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85",
  "Office": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=85",
  "Personal": "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1400&q=85",
  "Misc": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=85",
  "Holiday": "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=1400&q=85",
};

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1400&q=85";

function getEventImage(event) {
  return event.image || CATEGORY_IMAGES[event.category] || DEFAULT_EVENT_IMAGE;
}

function EventDetails({ onNavigate, event, onSelectEvent }) {
  if (!event) {
    return (
      <main className="event-details-page">
        <div style={{ padding: "60px", textAlign: "center" }}>
          <p>No event selected.</p>
          <button onClick={() => onNavigate("events")}>← Back to Events</button>
        </div>
      </main>
    );
  }

  const dateObj = event.event_date ? new Date(event.event_date) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "Date TBA";
  const timeStr = dateObj
    ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const venueName = event.venue_name || event.venue || "Venue TBA";

  function goToRegistration() {
    if (onSelectEvent) {
      onSelectEvent("eventRegistration", event);
    } else {
      onNavigate("eventRegistration");
    }
  }

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
            src={getEventImage(event)}
            alt={event.title}
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
            {(event.category || "EVENT").toUpperCase()} · {venueName.toUpperCase()}
          </p>

          <h1>
            {event.title}
          </h1>

          <p className="event-details-description">
            {event.description || "No description provided for this event."}
          </p>

          <div className="event-meta">

            <div>
              <span>DATE</span>
              <strong>{dateStr}</strong>
            </div>

            <div>
              <span>TIME</span>
              <strong>{timeStr || "—"}</strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>{venueName}</strong>
            </div>

          </div>

          <button
            className="event-register-btn"
            onClick={goToRegistration}
          >
            Register for Event →
          </button>

        </div>

      </section>

      {/* FINAL CTA */}
      <section className="event-details-cta">

        <div className="event-cta-content">

          <p className="event-details-label">
            {dateStr} · {venueName}
          </p>

          <h2>
            Your experience
            <br />
            <span>starts here.</span>
          </h2>

        </div>

        <div className="event-cta-action">

          <p>
            Secure your place at {event.title}.
          </p>

          <button onClick={goToRegistration}>
            Register Now
            <span>→</span>
          </button>

        </div>

      </section>

    </main>
  );
}

export default EventDetails;
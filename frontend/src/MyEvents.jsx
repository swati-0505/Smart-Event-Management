import "./MyEvents.css";
import { useState, useEffect } from "react";

function MyEvents({ onNavigate }) {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMyEvents() {
      const token = localStorage.getItem("user-auth-token");
      if (!token) {
        onNavigate("login");
        return;
      }

      try {
        const meResponse = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!meResponse.ok) throw new Error("Could not verify user");
        const me = await meResponse.json();

        const regResponse = await fetch(
          `/api/registrations/user/${me.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!regResponse.ok) throw new Error("Could not load registrations");
        const registrations = await regResponse.json();

        const withEventDetails = await Promise.all(
          registrations.map(async (reg) => {
            try {
              const eventRes = await fetch(
                `/api/events/${reg.event_id}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const event = eventRes.ok ? await eventRes.json() : null;
              return { ...reg, event };
            } catch {
              return { ...reg, event: null };
            }
          })
        );

        setRegisteredEvents(withEventDetails);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadMyEvents();
  }, [onNavigate]);

  const now = new Date();
  const upcomingEvents = registeredEvents.filter(
    (reg) => reg.event?.event_date && new Date(reg.event.event_date) >= now
  );
  const pastEvents = registeredEvents.filter(
    (reg) => reg.event?.event_date && new Date(reg.event.event_date) < now
  );

  return (
    <main className="my-events-page">

      <nav className="my-events-nav">

        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="my-events-nav-links">

          <button onClick={() => onNavigate("home")}>
            Home
          </button>

          <button onClick={() => onNavigate("events")}>
            Events
          </button>

          <button className="active">
            My Events
          </button>

          <button onClick={() => onNavigate("profile")}>
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
          className="my-events-login"
          onClick={() => onNavigate("login")}
        >
          Login
        </button>

      </nav>

      <section className="my-events-hero">

        <p className="my-events-eyebrow">
          YOUR EXPERIENCES
        </p>

        <h1>
          My <span>Events.</span>
        </h1>

        <p>
          Keep track of the events you've registered for
          and never miss an experience worth remembering.
        </p>

      </section>

      <section className="my-events-section">

        <div className="my-events-heading">

          <div>
            <p className="section-label">
              REGISTERED EVENTS
            </p>

            <h2>
              Your upcoming experiences
            </h2>
          </div>

          <span>
            {String(upcomingEvents.length).padStart(2, "0")} EVENTS
          </span>

        </div>

        {loading && <p style={{ padding: "20px" }}>Loading your events...</p>}
        {error && <p style={{ padding: "20px", color: "red" }}>{error}</p>}

        {!loading && !error && registeredEvents.length === 0 && (
          <p style={{ padding: "20px" }}>
            You haven't registered for any events yet.
          </p>
        )}

        <div className="my-events-list">

          {upcomingEvents.map((reg, index) => (

            <div className="my-event-card" key={reg.id || index}>

              <div className="my-event-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="my-event-main">

                <p className="my-event-category">
                  {reg.event?.category || "Event"}
                </p>

                <h3>
                  {reg.event?.title || "Event details unavailable"}
                </h3>

                <div className="my-event-meta">

                  <span>
                    <small>DATE</small>
                    {reg.event?.event_date
                      ? new Date(reg.event.event_date).toLocaleDateString()
                      : "—"}
                  </span>

                  <span>
                    <small>TIME</small>
                    {reg.event?.event_date
                      ? new Date(reg.event.event_date).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </span>

                </div>

              </div>

              <div className="my-event-status">
                <span>●</span>
                {reg.status}
              </div>

            </div>

          ))}

        </div>

        {pastEvents.length > 0 && (
          <>
            <div className="my-events-heading" style={{ marginTop: "40px" }}>
              <div>
                <p className="section-label">PAST EVENTS</p>
                <h2>Events you've attended</h2>
              </div>
              <span>{String(pastEvents.length).padStart(2, "0")} EVENTS</span>
            </div>

            <div className="my-events-list">
              {pastEvents.map((reg, index) => (
                <div className="my-event-card" key={reg.id || `past-${index}`}>
                  <div className="my-event-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="my-event-main">
                    <p className="my-event-category">
                      {reg.event?.category || "Event"}
                    </p>
                    <h3>{reg.event?.title || "Event details unavailable"}</h3>
                    <div className="my-event-meta">
                      <span>
                        <small>DATE</small>
                        {reg.event?.event_date
                          ? new Date(reg.event.event_date).toLocaleDateString()
                          : "—"}
                      </span>
                    </div>
                  </div>

                  <div className="my-event-status">
                    <span>●</span>
                    Completed
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </section>

      <section className="my-events-empty-cta">

        <p>
          Looking for your next experience?
        </p>

        <button
          onClick={() => onNavigate("events")}
        >
          Explore More Events →
        </button>

      </section>

    </main>
  );
}

export default MyEvents;
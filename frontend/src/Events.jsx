import { useEffect, useState } from "react";
import "./Events.css";
import eventService from "./admin/services/eventService";

function Events({ onNavigate }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);

      const data = await eventService.getEvents();

      console.log("EVENTS FROM BACKEND:", data);

      setEvents(data);
    } catch (error) {
      console.error("FAILED TO LOAD EVENTS:", error);
      setError("Failed to load events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  return (
    <div className="events-page">

      {/* NAVBAR */}
      <nav className="events-nav">

        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="events-nav-links">
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
          className="login-btn"
          onClick={() => onNavigate("login")}
        >
          Login
        </button>

      </nav>

      {/* HERO */}
      <section className="events-hero">

        <p className="eyebrow">
          SMART EVENT MANAGEMENT
        </p>

        <h1>
          Discover experiences
          <br />
          <span>worth remembering.</span>
        </h1>

        <p className="events-intro">
          Explore concerts, technology summits, business gatherings,
          cultural festivals and more — all in one place.
        </p>

      </section>

      {/* EVENTS */}
      <section className="events-list">

        <div className="events-heading">
          <p className="eyebrow">
            EXPLORE
          </p>

          <h2>
            Upcoming Events
          </h2>

          <p>
            Find experiences that match your interests.
          </p>
        </div>

        <div className="events-grid">

          {events.map((event, index) => (
            <div className="event-card" key={index}>

              <div className="event-image">
                <img
                  src={event.image}
                  alt={event.title}
                />
              </div>

              <div className="event-info">

                <span className="event-category">
                  {event.category}
                </span>

                <h3>
                  {event.title}
                </h3>

                <p className="event-location">
                  📍 {event.location}
                </p>

                <div className="event-bottom">

                  <span>
                    {event.date}
                  </span>

                  <button
                    onClick={() => onNavigate("eventDetails")}
                  >
                    View Event →
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
}

export default Events;
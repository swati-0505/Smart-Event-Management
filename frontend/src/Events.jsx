import { useEffect, useState } from "react";
import "./Events.css";
import eventService from "./admin/services/eventService";
const CATEGORY_IMAGES = {
  "Tech Conference": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
  "Technology": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
  "Workshop": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=85",
  "Networking": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85",
  "Corporate Event": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  "Business": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  "Cultural": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  "International": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  "Office": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85",
  "Personal": "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",
  "Misc": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=85",
  "Holiday": "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=900&q=85",
};

const DEFAULT_EVENT_IMAGE =
  "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=85";

function getEventImage(event) {
  return event.image || CATEGORY_IMAGES[event.category] || DEFAULT_EVENT_IMAGE;
}

function Events({ onNavigate, onSelectEvent }) {
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
  onClick={() => {
    if (onSelectEvent) {
      onSelectEvent("eventDetails", event);
    } else {
      onNavigate("eventDetails");
    }
  }}
>
  View Event →
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
    src={getEventImage(event)}
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
                    onClick={() => {
                      if (onSelectEvent) {
                        onSelectEvent("eventDetails", event);
                      } else {
                        onNavigate("eventDetails");
                      }
                    }}
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
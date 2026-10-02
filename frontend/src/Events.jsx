import { useEffect, useState } from "react";
import "./Events.css";
import eventService from "./admin/services/eventService";

const IMG = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=85`;

const IMAGES = {
  tech: IMG("photo-1505373877841-8d25f7d46678"),
  workshop: IMG("photo-1517048676732-d65bc937f952"),
  networking: IMG("photo-1511578314322-379afb476865"),
  business: IMG("photo-1540575467063-178a50c2df87"),
  cultural: IMG("photo-1492684223066-81342ee5ff30"),
  office: IMG("photo-1522071820081-009f0129c71c"),
  personal: IMG("photo-1531058020387-3be344556be6"),
  misc: IMG("photo-1501281668745-f7f57925c3b4"),
  holiday: IMG("photo-1482517967863-00e15c9b44be"),
};

// "TECHNICA;", "Tech Conference", "Technology" sab ko tech image milti hai
const CATEGORY_KEYWORDS = [
  { match: ["tech", "ai", "ml", "hack", "coding", "summit"], image: IMAGES.tech },
  { match: ["workshop", "training", "class", "seminar"], image: IMAGES.workshop },
  { match: ["network", "meetup", "startup"], image: IMAGES.networking },
  { match: ["business", "corporate", "conference"], image: IMAGES.business },
  { match: ["cultur", "fest", "music", "concert", "international", "dance"], image: IMAGES.cultural },
  { match: ["office", "team"], image: IMAGES.office },
  { match: ["personal", "party", "birthday", "wedding"], image: IMAGES.personal },
  { match: ["holiday", "trip", "travel"], image: IMAGES.holiday },
];

// Kuch match na ho to event id se alag-alag image milti hai
const FALLBACK_POOL = Object.values(IMAGES);

function hashKey(value) {
  const s = String(value ?? "");
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function getEventImage(event, index) {
  const own = event.image || event.image_url;
  if (own) return own;

  const text = `${event.category || ""} ${event.title || ""}`.toLowerCase();
  for (const group of CATEGORY_KEYWORDS) {
    if (group.match.some((k) => text.includes(k))) return group.image;
  }

  return FALLBACK_POOL[hashKey(event.id ?? event.title ?? index) % FALLBACK_POOL.length];
}

// "TECHNICA;" -> "TECHNICA"
function cleanLabel(value) {
  return String(value || "").replace(/[;:,.\s]+$/, "").trim();
}

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = toDate(value);
  if (!d) return value || "Date TBA";
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function Events({ onNavigate, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await eventService.getEvents();
      const list = Array.isArray(data) ? data : [];

      // Sirf upcoming events (aaj ya uske baad), jaldi wale pehle
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcoming = list
        .filter((e) => {
          const d = toDate(e.date);
          return !d || d >= today;
        })
        .sort((a, b) => {
          const da = toDate(a.date);
          const db = toDate(b.date);
          if (!da) return 1;
          if (!db) return -1;
          return da - db;
        });

      setEvents(upcoming);
    } catch (err) {
      console.error("FAILED TO LOAD EVENTS:", err);
      setError("Failed to load events. Check that the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const openEvent = (event) => {
    if (onSelectEvent) {
      onSelectEvent("eventDetails", event);
    } else {
      onNavigate("eventDetails");
    }
  };

  return (
    <div className="events-page">
      {/* NAVBAR */}
      <nav className="events-nav">
        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="events-nav-links">
          <button onClick={() => onNavigate("home")}>Home</button>
          <button onClick={() => onNavigate("about")}>About</button>
          <button onClick={() => onNavigate("contact")}>Contact</button>
        </div>

        <button className="login-btn" onClick={() => onNavigate("login")}>
          Login
        </button>
      </nav>

      {/* HERO */}
      <section className="events-hero">
        <p className="eyebrow">SMART EVENT MANAGEMENT</p>

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
          <p className="eyebrow">EXPLORE</p>
          <h2>Upcoming Events</h2>
          <p>Find experiences that match your interests.</p>
        </div>

        {loading && <p className="events-intro">Loading events...</p>}

        {!loading && error && (
          <div className="events-intro">
            <p>{error}</p>
            <button onClick={loadEvents}>Try again</button>
          </div>
        )}

        {!loading && !error && events.length === 0 && (
          <p className="events-intro">No upcoming events right now. Check back soon.</p>
        )}

        <div className="events-grid">
          {events.map((event, index) => (
            <div className="event-card" key={event.id ?? index}>
              <div className="event-image">
                <img
                  src={getEventImage(event, index)}
                  alt={event.title}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = IMAGES.misc;
                  }}
                />
              </div>

              <div className="event-info">
                <span className="event-category">{cleanLabel(event.category)}</span>

                <h3>{event.title}</h3>

                <p className="event-location">📍 {event.location || "TBA"}</p>

                <div className="event-bottom">
                  <span>{formatDate(event.date)}</span>

                  <button onClick={() => openEvent(event)}>View Event →</button>
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
// UpcomingEvents.jsx
// Shows upcoming events in a clean table format.

import { useState, useEffect } from "react";
import { ArrowRight, Calendar } from "lucide-react";
import { getEvents } from "../../services/eventService";

function UpcomingEvents({ searchQuery = "" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      const data = await getEvents();
      const upcoming = data.filter(
        (event) => event.status === "UPCOMING" || event.status === "ACTIVE"
      );

      setEvents(upcoming);
    } catch (err) {
      setError("Failed to load upcoming events.");
      console.error("Error loading upcoming events:", err);
    } finally {
      setLoading(false);
    }
  }

  function getStatusClass(status) {
    switch (status) {
      case "UPCOMING":
        return "admin-status admin-status-upcoming";
      case "ACTIVE":
      case "CONFIRMED":
        return "admin-status admin-status-confirmed";
      case "PENDING":
        return "admin-status admin-status-pending";
      case "CANCELLED":
        return "admin-status admin-status-cancelled";
      default:
        return "admin-status admin-status-pending";
    }
  }

  return (
    <section className="dash-panel">
      {/* Header */}
      <div className="dash-panel-header">
        <div>
          <p className="dash-panel-tag">Schedule</p>
          <h2 className="dash-panel-title">Upcoming Events</h2>
        </div>

        <button type="button" className="dash-panel-action">
          <span>View all</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Body */}
      {loading && (
        <div className="dash-empty">
          <p>Loading events...</p>
        </div>
      )}

      {error && (
        <div className="dash-empty">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="dash-empty">
          <Calendar size={24} className="mx-auto mb-2 opacity-40" />
          <p>No upcoming events</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="events-list">
          {events.map((event) => (
            <div key={event.event_id} className="event-row">
              <div className="event-date-box">
                <span className="event-day">
                  {new Date(event.start_time).toLocaleDateString("en-GB", {
                    day: "2-digit",
                  })}
                </span>
                <span className="event-month">
                  {new Date(event.start_time).toLocaleDateString("en-GB", {
                    month: "short",
                  })}
                </span>
              </div>

              <div className="event-info">
                <p className="event-title">{event.title}</p>
                <p className="event-venue">{event.venue_name}</p>
              </div>

              <div className="event-capacity">
                <span className="event-capacity-num">{event.capacity}</span>
                <span className="event-capacity-label">seats</span>
              </div>

              <span className={getStatusClass(event.status)}>
                {event.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default UpcomingEvents;
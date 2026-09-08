// UpcomingEvents.jsx
// This component displays upcoming events in the dashboard.
// It fetches data from the event service.

import { useState, useEffect } from "react";
import { getEvents } from "../../services/eventService";

function UpcomingEvents({ searchQuery = "" }) {
  // State for upcoming events
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load upcoming events on component mount
  useEffect(() => {
    loadEvents();
  }, []);

  // Function to load events from service
  async function loadEvents() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get events
      const data = await getEvents();
      
      // Filter only upcoming events (status UPCOMING or ACTIVE)
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

  // Helper to get status badge class
  function getStatusClass(status) {
    switch (status) {
      case "UPCOMING":
        return "admin-status-upcoming";
      case "ACTIVE":
      case "CONFIRMED":
        return "admin-status-confirmed";
      case "PENDING":
        return "admin-status-pending";
      case "CANCELLED":
        return "admin-status-cancelled";
      default:
        return "admin-status-pending";
    }
  }

  return (
    <section className="admin-section overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
            Schedule
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">
            Upcoming Events
          </h2>
        </div>

        <button
          type="button"
          className="text-xs text-white/40 transition hover:text-[#d7a63a]"
        >
          View all
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/[0.07] text-left">
              <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                Event
              </th>
              <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                Date
              </th>
              <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                Venue
              </th>
              <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                Capacity
              </th>
              <th className="px-5 py-3 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-sm text-white/30">
                  Loading upcoming events...
                </td>
              </tr>
            )}

            {!loading && error && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-sm text-red-400">
                  {error}
                </td>
              </tr>
            )}

            {!loading && !error && events.length > 0 && (
              events.map((event) => (
                <tr
                  key={event.event_id}
                  className="border-b border-white/[0.055] transition hover:bg-white/[0.02] last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-white/85">
                      {event.title}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/55">
                    {new Date(event.start_time).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 text-sm text-white/45">
                    {event.venue_name}
                  </td>
                  <td className="px-5 py-4 text-sm text-white/50">
                    {event.capacity}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`admin-status ${getStatusClass(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                </tr>
              ))
            )}

            {!loading && !error && events.length === 0 && (
              <tr>
                <td colSpan="5" className="px-5 py-8 text-center text-sm text-white/30">
                  No upcoming events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default UpcomingEvents;
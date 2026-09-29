import { useEffect, useState } from "react";
import { Clock, MapPin, ChevronRight } from "lucide-react";
import { getEvents } from "../../services/eventService";

const gradients = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-purple-500 to-pink-600",
  "from-orange-500 to-red-600",
];
function UpcomingEvents({ onViewAll, onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEvents();

        const data = Array.isArray(response)
          ? response
          : response?.data ||
            response?.items ||
            response?.events ||
            [];

        setEvents(data);
      } catch (err) {
        console.error("Failed to load events:", err);
        setError("Unable to load events.");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  return (
    <div className="card animate-fade-in-up p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-theme-primary">
          Upcoming Events
        </h2>

        <button
          type="button"
          onClick={onViewAll}
          className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          View All →
        </button>
      </div>

      {loading && (
        <div className="py-8 text-center text-sm text-theme-muted">
          Loading events...
        </div>
      )}

      {!loading && error && (
        <div className="py-8 text-center text-sm text-red-500">
          {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="py-8 text-center text-sm text-theme-muted">
          No upcoming events found.
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="space-y-3">
          {events.map((event, index) => {
            const image =
              event.image_url ||
              event.imageUrl ||
              event.image ||
              event.banner_url ||
              event.bannerUrl;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelectEvent && onSelectEvent(event)}
                className="flex w-full items-center gap-4 rounded-xl border border-theme bg-theme-secondary p-3 text-left transition hover:border-indigo-200 hover:bg-theme-hover"
                >
                {/* Image */}
                {image ? (
                  <img
                    src={image}
                    alt={event.title || "Event"}
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className={`h-14 w-14 shrink-0 rounded-xl bg-linear-to-br ${
                      gradients[index % gradients.length]
                    }`}
                  />
                )}

                {/* Details */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-theme-primary">
                    {event.title || event.name || "Untitled Event"}
                  </p>

                  <p className="mt-0.5 text-xs text-theme-muted">
                    {event.category || event.event_type || "Event"}
                  </p>

                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-theme-muted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {event.date ||
                        event.event_date ||
                        "Date not available"}
                      {event.time && ` · ${event.time}`}
                    </span>

                    <span className="flex items-center gap-1">
                      <MapPin size={12} />
                      {event.venue ||
                        event.location ||
                        "Venue not available"}
                    </span>
                  </div>
                </div>

                {/* Status */}
                <span className="badge badge-success shrink-0">
                  {event.status || "Upcoming"}
                </span>

                <ChevronRight
                  size={16}
                  className="shrink-0 text-theme-dim"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default UpcomingEvents;
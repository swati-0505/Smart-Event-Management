import { useEffect, useMemo, useState } from "react";
import { CalendarDays, MapPin, Users, Search, Filter } from "lucide-react";
import eventService from "../services/eventService";

function toDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatDate(value) {
  const d = toDate(value);
  if (!d) return "Date TBA";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cleanLabel(value) {
  return String(value || "").replace(/[;:,.\s]+$/, "").trim();
}

function Events({ searchQuery = "", onSelectEvent }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await eventService.getEvents();
      setEvents(Array.isArray(data) ? data : []);
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

  // Chips are built from the categories that actually exist
  const categories = useMemo(() => {
    const set = new Set(
      events.map((e) => cleanLabel(e.category)).filter(Boolean)
    );
    return ["All", ...set];
  }, [events]);

  const visible = useMemo(() => {
    const q = `${query} ${searchQuery}`.trim().toLowerCase();
    return events
      .filter((e) => category === "All" || cleanLabel(e.category) === category)
      .filter((e) => {
        if (!q) return true;
        return `${e.title} ${e.description} ${e.category}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => (toDate(a.date) ?? 0) - (toDate(b.date) ?? 0));
  }, [events, category, query, searchQuery]);

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Heading */}
      <p className="text-xs font-semibold tracking-widest text-indigo-500 uppercase">
        Live Schedule
      </p>
      <h1 className="mt-2 text-4xl font-bold">Published Events</h1>
      <p className="mt-3 opacity-70">
        Discover upcoming conferences, seminars, and technical workshops
        available for enrollment.
      </p>

      {/* Search + category filter */}
      <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm text-slate-800">
        <div className="flex flex-1 min-w-55 items-center gap-3 px-3">
          <Search size={18} className="text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, description, or keyword..."
            className="w-full bg-transparent py-2 text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Filter size={14} /> Category:
          </span>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                category === c
                  ? "border-indigo-500 bg-indigo-500 text-white"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      {loading && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-80 animate-pulse rounded-2xl bg-slate-200/60"
            />
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 space-y-3">
          <p>{error}</p>
          <button
            onClick={loadEvents}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </div>
      )}

      {!loading && !error && visible.length === 0 && (
        <p className="mt-8 opacity-70">No events found.</p>
      )}

      {/* Cards */}
      {!loading && !error && visible.length > 0 && (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((event, i) => {
            const venue = event.venue_id ?? event.venueId ?? event.venue;
            const capacity =
              event.capacity ?? event.max_attendees ?? event.maxAttendees;

            return (
              <div
                key={event.id ?? i}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* Gradient header */}
                <div className="flex h-52 items-center justify-center bg-linear-to-br from-[#1e1b4b] to-[#4338ca]">
                  <CalendarDays size={48} strokeWidth={1.5} className="text-white/80" />
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium text-indigo-500">
                      {cleanLabel(event.category) || "General"}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-500">{formatDate(event.date)}</span>
                  </div>

                  <h3 className="mt-2 text-xl font-bold">{event.title}</h3>

                  <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                    {event.description || "Join us for this exclusive event experience."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                    {venue && (
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {String(venue).length > 14
                          ? `Venue ID: ${String(venue).slice(0, 8)}...`
                          : venue}
                      </span>
                    )}
                    {capacity && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {capacity} capacity
                      </span>
                    )}
                  </div>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => onSelectEvent?.("eventDetails", event)}
                      className="w-full rounded-lg border border-slate-200 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Events;
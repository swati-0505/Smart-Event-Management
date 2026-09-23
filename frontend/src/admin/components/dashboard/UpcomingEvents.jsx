// UpcomingEvents.jsx
// Upcoming events list with image thumbnails.

import { Clock, MapPin, ChevronRight } from "lucide-react";

// Sample data — replace with /events/ API when ready
const events = [
  {
    id: 1,
    title: "AI for a Better Tomorrow",
    category: "Tech Conference",
    date: "20 Sep 2026",
    time: "9:00 AM - 5:00 PM",
    venue: "Chennai Convention Center",
    status: "Upcoming",
    statusVariant: "success",
    gradient: "from-blue-500 to-indigo-600",
  },
  {
    id: 2,
    title: "Product Innovation Workshop",
    category: "Workshop",
    date: "25 Sep 2026",
    time: "10:00 AM - 1:00 PM",
    venue: "T-Hub, Chennai",
    status: "Upcoming",
    statusVariant: "success",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: 3,
    title: "Networking Night",
    category: "Networking",
    date: "28 Sep 2026",
    time: "6:00 PM - 9:00 PM",
    venue: "ITC Grand Chola, Chennai",
    status: "Upcoming",
    statusVariant: "info",
    gradient: "from-purple-500 to-pink-600",
  },
  {
    id: 4,
    title: "Annual Company Meet",
    category: "Corporate Event",
    date: "10 Oct 2026",
    time: "9:00 AM - 6:00 PM",
    venue: "Chennai Trade Center",
    status: "Draft",
    statusVariant: "neutral",
    gradient: "from-slate-600 to-slate-800",
  },
];

function UpcomingEvents({ onViewAll }) {
  return (
    <div className="card animate-fade-in-up p-5">
      {/* Header */}
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

      {/* List */}
      <div className="space-y-3">
        {events.map((event) => (
          <button
            key={event.id}
            type="button"
            className="flex w-full items-center gap-4 rounded-xl border border-theme bg-theme-secondary p-3 text-left transition hover:border-indigo-200 hover:bg-theme-hover"
          >
            {/* Image / Gradient */}
            <div
              className={`h-14 w-14 shrink-0 rounded-xl bg-gradient-to-br ${event.gradient}`}
            />

            {/* Details */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-theme-primary">
                {event.title}
              </p>
              <p className="mt-0.5 text-xs text-theme-muted">
                {event.category}
              </p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-theme-muted">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {event.date} · {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {event.venue}
                </span>
              </div>
            </div>

            {/* Status */}
            <span className={`badge badge-${event.statusVariant} shrink-0`}>
              {event.status}
            </span>

            <ChevronRight size={16} className="shrink-0 text-theme-dim" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default UpcomingEvents;
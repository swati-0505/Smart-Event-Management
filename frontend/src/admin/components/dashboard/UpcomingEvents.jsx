// UpcomingEvents.jsx
// Widget showing list of upcoming events.

import { Clock, MapPin, MoreVertical, ArrowRight } from "lucide-react";

const events = [
  {
    day: "08",
    month: "Jul",
    title: "Tech Fest 2025",
    time: "10:00 AM - 4:00 PM",
    venue: "Auditorium",
    status: "Upcoming",
    statusVariant: "success",
  },
  {
    day: "12",
    month: "Jul",
    title: "Cultural Fest",
    time: "2:00 PM - 6:00 PM",
    venue: "Main Ground",
    status: "Upcoming",
    statusVariant: "success",
  },
  {
    day: "15",
    month: "Jul",
    title: "Workshop on Web Development",
    time: "9:00 AM - 12:00 PM",
    venue: "Computer Lab 1",
    status: "Upcoming",
    statusVariant: "warning",
  },
  {
    day: "20",
    month: "Jul",
    title: "College Annual Day",
    time: "5:00 PM - 10:00 PM",
    venue: "Main Auditorium",
    status: "Today",
    statusVariant: "info",
  },
];

const dayColorMap = {
  0: "bg-indigo-100 text-indigo-600",
  1: "bg-purple-100 text-purple-600",
  2: "bg-orange-100 text-orange-600",
  3: "bg-red-100 text-red-600",
};

function UpcomingEvents({ onViewAll }) {
  return (
    <div className="card animate-fade-in-up p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-theme-primary">Upcoming Events</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View All <ArrowRight size={13} />
        </button>
      </div>

      <div className="space-y-3">
        {events.map((event, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 rounded-xl border border-theme p-3 transition hover:border-indigo-200 hover:bg-theme-hover"
          >
            <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${dayColorMap[idx] || dayColorMap[0]}`}>
              <span className="text-lg font-bold leading-none">{event.day}</span>
              <span className="text-[10px] font-semibold uppercase">{event.month}</span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-theme-primary">
                {event.title}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-theme-muted">
                <span className="flex items-center gap-1">
                  <Clock size={12} /> {event.time}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {event.venue}
                </span>
              </div>
            </div>

            <span className={`badge badge-${event.statusVariant}`}>{event.status}</span>
            <button type="button" className="btn-ghost">
              <MoreVertical size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpcomingEvents;
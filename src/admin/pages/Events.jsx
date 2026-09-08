import { useMemo, useState } from "react";
import { CalendarPlus, Search } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Tech Summit 2026",
    date: "12 Sep 2026",
    time: "10:00 AM - 4:00 PM",
    venue: "Main Auditorium",
    capacity: "420 / 500",
    status: "UPCOMING",
    statusClass: "admin-status-upcoming",
    createdBy: "Yugant",
  },
  {
    id: 2,
    title: "Design Workshop",
    date: "18 Sep 2026",
    time: "11:00 AM - 2:00 PM",
    venue: "Innovation Hall",
    capacity: "78 / 120",
    status: "ACTIVE",
    statusClass: "admin-status-confirmed",
    createdBy: "Yugant",
  },
  {
    id: 3,
    title: "Startup Meetup",
    date: "24 Sep 2026",
    time: "5:00 PM - 8:00 PM",
    venue: "Conference Room A",
    capacity: "95 / 100",
    status: "PENDING",
    statusClass: "admin-status-pending",
    createdBy: "Yugant",
  },
  {
    id: 4,
    title: "Music Night",
    date: "03 Oct 2026",
    time: "7:00 PM - 10:00 PM",
    venue: "Open Air Stage",
    capacity: "210 / 300",
    status: "CANCELLED",
    statusClass: "admin-status-cancelled",
    createdBy: "Yugant",
  },
];

function Events() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredEvents = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        !search ||
        event.title.toLowerCase().includes(search) ||
        event.venue.toLowerCase().includes(search) ||
        event.createdBy.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  return (
    <div>
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          Event Management
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              Events
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Create, manage, and monitor your events from one place.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#d7a63a] px-4 py-2.5 text-sm font-semibold text-[#0b0b0b] transition hover:bg-[#e3b957]"
          >
            <CalendarPlus size={16} strokeWidth={2} />
            Create Event
          </button>
        </div>
      </header>

      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-[#d7a63a]/20 bg-[#d7a63a]/[0.05] px-3 py-2.5">
            <Search
              size={15}
              strokeWidth={1.7}
              className="shrink-0 text-[#d7a63a]/75"
            />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search events..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-xs text-white/65 outline-none transition focus:border-[#d7a63a]/40 sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="UPCOMING">Upcoming</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px]">
            <thead>
              <tr className="border-b border-white/[0.07] text-left">
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Event
                </th>

                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Date & Time
                </th>

                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Venue
                </th>

                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Capacity
                </th>

                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Status
                </th>

                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Created By
                </th>

                <th className="px-6 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-white/[0.055] transition hover:bg-white/[0.02] last:border-b-0"
                  >
                    <td className="px-6 py-5">
                      <p className="text-sm font-medium text-white/85">
                        {event.title}
                      </p>
                    </td>

                    <td className="px-6 py-5">
                      <p className="text-sm text-white/55">{event.date}</p>
                      <p className="mt-1 text-[11px] text-white/30">
                        {event.time}
                      </p>
                    </td>

                    <td className="px-6 py-5 text-sm text-white/45">
                      {event.venue}
                    </td>

                    <td className="px-6 py-5 text-sm text-white/50">
                      {event.capacity}
                    </td>

                    <td className="px-6 py-5">
                      <span className={`admin-status ${event.statusClass}`}>
                        {event.status}
                      </span>
                    </td>

                    <td className="px-6 py-5 text-sm text-white/45">
                      {event.createdBy}
                    </td>

                    <td className="px-6 py-5 text-right">
                      <button
                        type="button"
                        className="text-xs text-white/40 transition hover:text-[#d7a63a]"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-sm text-white/30"
                  >
                    No events match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Events;
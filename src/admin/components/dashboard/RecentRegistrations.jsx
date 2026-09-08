const registrations = [
  {
    name: "Rahul Sharma",
    event: "Tech Summit 2026",
    date: "Today, 10:42 AM",
    status: "CONFIRMED",
    statusClass: "admin-status-confirmed",
  },
  {
    name: "Ananya Verma",
    event: "Design Workshop",
    date: "Today, 09:18 AM",
    status: "CONFIRMED",
    statusClass: "admin-status-confirmed",
  },
  {
    name: "Arjun Mehta",
    event: "Startup Meetup",
    date: "Yesterday",
    status: "PENDING",
    statusClass: "admin-status-pending",
  },
];

function RecentRegistrations() {
  return (
    <section className="admin-section overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5 sm:px-6">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#d7a63a]">
            Activity
          </p>

          <h3 className="mt-1.5 text-base font-semibold text-white">
            Recent Registrations
          </h3>
        </div>

        <button className="text-xs text-white/35 transition hover:text-[#d7a63a]">
          View all
        </button>
      </div>

      <div>
        {registrations.map((registration) => (
          <div
            key={`${registration.name}-${registration.event}`}
            className="flex items-center justify-between gap-4 border-b border-white/[0.055] px-5 py-5 last:border-b-0 sm:px-6"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white/85">
                {registration.name}
              </p>

              <p className="mt-1 truncate text-xs text-white/35">
                {registration.event}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-end gap-2">
              <p className="text-[10px] text-white/30">
                {registration.date}
              </p>

              <span
                className={`admin-status ${registration.statusClass}`}
              >
                {registration.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default RecentRegistrations;
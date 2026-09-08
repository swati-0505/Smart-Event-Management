const activities = [
  {
    action: "New event created",
    detail: "Tech Summit 2026",
    time: "12 min ago",
  },
  {
    action: "Registration received",
    detail: "Design Workshop",
    time: "28 min ago",
  },
  {
    action: "Venue updated",
    detail: "Innovation Hall",
    time: "1 hr ago",
  },
  {
    action: "Event status changed",
    detail: "Startup Meetup",
    time: "2 hrs ago",
  },
];

function ActivityFeed() {
  return (
    <section className="admin-section overflow-hidden">
      <div className="border-b border-white/[0.07] px-5 py-5 sm:px-6">
        <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#d7a63a]">
          System
        </p>

        <h3 className="mt-1.5 text-base font-semibold text-white">
          Recent Activity
        </h3>
      </div>

      <div>
        {activities.map((activity) => (
          <div
            key={`${activity.action}-${activity.detail}`}
            className="flex gap-4 border-b border-white/[0.055] px-5 py-5 last:border-b-0 sm:px-6"
          >
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d7a63a]" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white/80">
                {activity.action}
              </p>

              <p className="mt-1 text-xs text-white/35">
                {activity.detail}
              </p>
            </div>

            <span className="shrink-0 pt-0.5 text-[10px] text-white/25">
              {activity.time}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ActivityFeed;
// ActivityFeed.jsx
// This component displays recent system activity in the dashboard.

import { useState } from "react";

// Mock activity data
// Later, this will come from backend API
const mockActivities = [
  {
    id: 1,
    type: "event",
    title: "New event created",
    description: "Tech Summit 2026",
    time: "12 min ago",
  },
  {
    id: 2,
    type: "registration",
    title: "Registration received",
    description: "Design Workshop",
    time: "25 min ago",
  },
  {
    id: 3,
    type: "venue",
    title: "Venue updated",
    description: "Innovation Hall",
    time: "1 hr ago",
  },
  {
    id: 4,
    type: "status",
    title: "Event status changed",
    description: "Startup Meetup",
    time: "2 hrs ago",
  },
];

function ActivityFeed() {
  // State for activities
  const [activities] = useState(mockActivities);

  // Helper to get activity icon
  function getActivityIcon(type) {
    switch (type) {
      case "event":
        return "📅";
      case "registration":
        return "📝";
      case "venue":
        return "🏛️";
      case "status":
        return "⚡";
      default:
        return "🔔";
    }
  }

  return (
    <section className="admin-section overflow-hidden">
      <div className="flex items-center justify-between border-b border-theme px-5 py-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            System
          </p>
          <h2 className="mt-1 text-lg font-semibold text-theme-primary">
            Recent Activity
          </h2>
        </div>
      </div>

      <div className="divide-y divide-theme">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 px-5 py-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-theme-accent/10 text-sm">
                {getActivityIcon(activity.type)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-theme-primary">
                  {activity.title}
                </p>
                <p className="mt-0.5 text-xs text-theme-muted">
                  {activity.description}
                </p>
                <p className="mt-1 text-[10px] text-theme-dim">
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="px-5 py-8 text-center text-sm text-theme-muted">
            No recent activity.
          </div>
        )}
      </div>
    </section>
  );
}

export default ActivityFeed;
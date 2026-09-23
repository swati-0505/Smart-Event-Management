// RecentActivity.jsx
// Recent activity feed.

import { UserPlus, Edit3, Star, Ticket } from "lucide-react";

const activities = [
  {
    icon: UserPlus,
    color: "blue",
    title: "New registration",
    time: "2 minutes ago",
  },
  {
    icon: Edit3,
    color: "green",
    title: "Event updated",
    time: "15 minutes ago",
  },
  {
    icon: Star,
    color: "amber",
    title: "New feedback received",
    time: "1 hour ago",
  },
  {
    icon: Ticket,
    color: "purple",
    title: "Ticket sold (₹499)",
    time: "2 hours ago",
  },
];

const colorMap = {
  blue: "bg-blue-100 text-blue-600",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  purple: "bg-purple-100 text-purple-600",
};

function RecentActivity() {
  return (
    <div className="card animate-fade-in-up p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-bold text-theme-primary">
          Recent Activity
        </h2>
        <button
          type="button"
          className="text-xs font-semibold text-indigo-600 transition hover:text-indigo-700"
        >
          View All →
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((act, idx) => {
          const Icon = act.icon;
          return (
            <div key={idx} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${colorMap[act.color]}`}
              >
                <Icon size={14} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-theme-primary">
                  {act.title}
                </p>
                <p className="text-[11px] text-theme-dim">{act.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RecentActivity;
// Reminders.jsx
// Reminders list — removed left-border accent pattern (AI cliché).
// Now uses icon badge + filled card style.

import { Bell, Clock, Edit2, Trash2, AlertCircle, Flag } from "lucide-react";

const reminders = [
  {
    title: "Assess any new risks identified in the morning meeting.",
    time: "10:00 AM",
    type: "urgent",
  },
  {
    title: "Outline key points for tomorrow's stand-up meeting.",
    time: "2:00 PM",
    type: "normal",
  },
];

const TYPE_STYLES = {
  urgent: {
    icon: AlertCircle,
    badge: "bg-rose-100 text-rose-600",
    accent: "text-rose-600",
  },
  normal: {
    icon: Flag,
    badge: "bg-indigo-100 text-indigo-600",
    accent: "text-indigo-600",
  },
};

function Reminders() {
  return (
    <div className="card animate-fade-in-up p-5">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-indigo-600" />
          <h2 className="text-base font-bold text-theme-primary">
            Reminders
          </h2>
        </div>
        <span className="text-xs text-theme-muted">
          Today · {reminders.length}
        </span>
      </div>

      {/* List */}
      <div className="space-y-3">
        {reminders.map((r, idx) => {
          const style = TYPE_STYLES[r.type] || TYPE_STYLES.normal;
          const Icon = style.icon;

          return (
            <div
              key={idx}
              className="card-flat group p-3 transition-colors hover:border-indigo-300"
            >
              <div className="flex items-start gap-3">
                {/* Icon badge */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${style.badge}`}
                >
                  <Icon size={14} />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium leading-snug text-theme-primary">
                    {r.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-theme-muted">
                    <Clock size={11} />
                    {r.time}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-theme-muted transition hover:bg-theme-hover hover:text-theme-primary"
                    aria-label="Edit reminder"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-theme-muted transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Delete reminder"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Reminders;
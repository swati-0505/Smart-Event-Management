// Reminders.jsx
// Reminders list widget.

import { Bell, Clock, Edit2, Trash2 } from "lucide-react";

const reminders = [
  { title: "Assess any new risks identified in the morning meeting.", time: "10:00 AM", color: "border-indigo-500" },
  { title: "Outline key points for tomorrow's stand-up meeting.", time: "2:00 PM", color: "border-red-500" },
];

function Reminders() {
  return (
    <div className="card animate-fade-in-up p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-indigo-600" />
          <h2 className="text-base font-bold text-theme-primary">Reminders</h2>
        </div>
        <span className="text-xs text-theme-muted">Today · {reminders.length}</span>
      </div>

      <div className="space-y-3">
        {reminders.map((r, idx) => (
          <div key={idx} className={`flex items-start gap-3 rounded-xl border-l-4 ${r.color} bg-theme-tertiary p-3`}>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-theme-primary">{r.title}</p>
              <p className="mt-1 flex items-center gap-1 text-xs text-theme-muted">
                <Clock size={11} /> {r.time}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button type="button" className="btn-ghost"><Edit2 size={13} /></button>
              <button type="button" className="btn-ghost"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Reminders;
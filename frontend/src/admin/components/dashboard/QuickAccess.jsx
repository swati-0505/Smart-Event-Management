// QuickAccess.jsx
// Quick access shortcuts to common actions.

import { Plus, Rocket, Users, FileText, ArrowRight } from "lucide-react";

const actions = [
  { label: "Create New Event", desc: "Start a new event in minutes", icon: Plus, color: "indigo", page: "events" },
  { label: "Event Dashboard", desc: "View all events & stats", icon: Rocket, color: "pink", page: "reports" },
  { label: "Team Management", desc: "Manage organizers & volunteers", icon: Users, color: "green", page: "users" },
  { label: "Reports & Analytics", desc: "Get insights and reports", icon: FileText, color: "blue", page: "reports" },
];

const colorMap = {
  indigo: "bg-indigo-100 text-indigo-600",
  pink: "bg-pink-100 text-pink-600",
  green: "bg-emerald-100 text-emerald-600",
  blue: "bg-blue-100 text-blue-600",
};

function QuickAccess({ onNavigate }) {
  return (
    <div className="card animate-fade-in-up p-5">
      <h2 className="mb-4 text-base font-bold text-theme-primary">Quick Access</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onNavigate(action.page)}
              className="group flex items-start gap-3 rounded-xl border border-theme p-4 text-left transition hover:border-indigo-200 hover:bg-theme-hover"
            >
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${colorMap[action.color]}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-theme-primary">{action.label}</p>
                <p className="mt-0.5 text-xs text-theme-muted">{action.desc}</p>
              </div>
              <ArrowRight size={14} className="mt-1 shrink-0 text-theme-dim transition group-hover:translate-x-0.5 group-hover:text-indigo-600" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickAccess;
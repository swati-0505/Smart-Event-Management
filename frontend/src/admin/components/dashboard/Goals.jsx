// Goals.jsx
// My Goals widget with progress bars.

import { Target, ArrowRight } from "lucide-react";

const goals = [
  { title: "Check Emails and Messages", subtitle: "Product launch · My Projects", progress: 72, color: "bg-emerald-500" },
  { title: "Prepare a brief status update to the client", subtitle: "Product launch · My Projects", progress: 11, color: "bg-orange-500" },
  { title: "Update project documentation", subtitle: "Team brainstorm · My Projects", progress: 63, color: "bg-blue-500" },
];

function Goals() {
  return (
    <div className="card animate-fade-in-up p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-600" />
          <h2 className="text-base font-bold text-theme-primary">My Goals</h2>
        </div>
        <button type="button" className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700">
          View Reports <ArrowRight size={13} />
        </button>
      </div>

      <div className="space-y-4">
        {goals.map((goal, idx) => (
          <div key={idx}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-theme-primary">{goal.title}</p>
                <p className="mt-0.5 text-xs text-theme-muted">{goal.subtitle}</p>
              </div>
              <span className="text-sm font-bold text-theme-primary">{goal.progress}%</span>
            </div>
            <div className="mt-2 progress-bar">
              <div className={`progress-fill ${goal.color}`} style={{ width: `${goal.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Goals;
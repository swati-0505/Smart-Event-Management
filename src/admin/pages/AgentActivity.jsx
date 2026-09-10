// AgentActivity.jsx
// Displays logs of AI agent activities and tool executions.

import { useState, useEffect } from "react";
import { Activity, Bot, CheckCircle2, Clock, XCircle } from "lucide-react";

// Mock agent activity data
// Later, this will come from backend logging
const mockActivities = [
  {
    id: 1,
    request_id: "REQ-001",
    user: "Admin",
    intent: "Search events",
    tool: "search_events",
    status: "SUCCESS",
    latency: "1.2s",
    timestamp: "2026-09-08T10:30:00",
  },
  {
    id: 2,
    request_id: "REQ-002",
    user: "Admin",
    intent: "Check venue availability",
    tool: "check_venue_availability",
    status: "SUCCESS",
    latency: "0.8s",
    timestamp: "2026-09-08T10:28:00",
  },
  {
    id: 3,
    request_id: "REQ-003",
    user: "Admin",
    intent: "Create event",
    tool: "create_event",
    status: "FAILED",
    latency: "2.1s",
    timestamp: "2026-09-08T10:25:00",
  },
  {
    id: 4,
    request_id: "REQ-004",
    user: "Admin",
    intent: "Register participant",
    tool: "register_participant",
    status: "SUCCESS",
    latency: "1.5s",
    timestamp: "2026-09-08T10:20:00",
  },
];

function AgentActivity() {
  // State for activities
  const [activities] = useState(mockActivities);

  // Helper to get status badge class
  function getStatusClass(status) {
    switch (status) {
      case "SUCCESS":
        return "admin-status-confirmed";
      case "FAILED":
        return "admin-status-cancelled";
      case "PENDING":
        return "admin-status-pending";
      default:
        return "admin-status-pending";
    }
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Intelligence
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-theme-primary sm:text-[34px]">
              Agent Activity
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-theme-muted">
              Monitor AI agent activities and tool executions.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-theme bg-theme-primary/5 px-3 py-2">
            <Activity size={14} className="text-theme-accent" />
            <span className="text-xs text-theme-secondary">Live Activity</span>
          </div>
        </div>
      </header>

      {/* Activity table */}
      <section className="admin-section overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-theme text-left">
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                  Request ID
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                  User
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                  Intent
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                  Tool
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                  Status
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                  Latency
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                  Timestamp
                </th>
              </tr>
            </thead>

            <tbody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-theme transition hover:bg-theme-primary/5 last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm text-theme-secondary">
                      {activity.request_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-muted">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-secondary">
                      {activity.intent}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-theme-primary/5 px-2 py-1 text-xs text-theme-secondary">
                        <Bot size={12} className="text-theme-accent" />
                        {activity.tool}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`admin-status ${getStatusClass(activity.status)}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-muted">
                      {activity.latency}
                    </td>
                    <td className="px-6 py-4 text-sm text-theme-muted">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-theme-muted">
                    No agent activity found.
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

export default AgentActivity;
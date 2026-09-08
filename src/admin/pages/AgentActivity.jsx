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
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          Intelligence
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              Agent Activity
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Monitor AI agent activities and tool executions.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-white/[0.02] px-3 py-2">
            <Activity size={14} className="text-[#d7a63a]" />
            <span className="text-xs text-white/60">Live Activity</span>
          </div>
        </div>
      </header>

      {/* Activity table */}
      <section className="admin-section overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-white/[0.07] text-left">
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Request ID
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  User
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Intent
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Tool
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Status
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Latency
                </th>
                <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                  Timestamp
                </th>
              </tr>
            </thead>

            <tbody>
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <tr
                    key={activity.id}
                    className="border-b border-white/[0.055] transition hover:bg-white/[0.02] last:border-b-0"
                  >
                    <td className="px-6 py-4 text-sm text-white/60">
                      {activity.request_id}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/50">
                      {activity.user}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {activity.intent}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.05] px-2 py-1 text-xs text-white/60">
                        <Bot size={12} className="text-[#d7a63a]" />
                        {activity.tool}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`admin-status ${getStatusClass(activity.status)}`}>
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/40">
                      {activity.latency}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/40">
                      {new Date(activity.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-sm text-white/30">
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
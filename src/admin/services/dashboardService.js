// dashboardService.js
// Dashboard metrics — backend-ready.

import { apiGet } from "./api";

/* ---------------- Mock ---------------- */
const MOCK = {
  total_events: 12,
  total_registrations: 1248,
  active_users: 956,
  ai_queries: 24,
  trends: {
    total_events: "+20%",
    total_registrations: "+15%",
    active_users: "+32%",
    ai_queries: "Queries this week",
  },
};

/* ---------------- Service ---------------- */

/**
 * Fetch dashboard KPI metrics.
 * 🚀 Backend: GET /admin/dashboard/metrics
 */
export async function getDashboardMetrics() {
  // ✅ MOCK
  await new Promise((r) => setTimeout(r, 300));
  return MOCK;

  // 🚀 PRODUCTION
  // return apiGet("/admin/dashboard/metrics");
}

export default { getDashboardMetrics };
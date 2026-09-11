// dashboardService.js
// Handles all dashboard-related API calls.
// Returns metrics for the dashboard page.

import apiRequest from "./api";

// Mock data based on database counts
const mockDashboardData = {
  total_events: 24,
  total_registrations: 486,
  total_venues: 12,
  upcoming_events: 8,
};

// 👇 TOGGLE: Set to false when backend is ready
const USE_MOCK_DATA = true;

/**
 * Fetch dashboard metrics.
 */
export async function getDashboardMetrics() {
  // ✅ MOCK MODE (when backend not ready)
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockDashboardData;
  }

  // ✅ REAL API CALL (when backend ready)
  return apiRequest("/api/admin/dashboard");
}

export default {
  getDashboardMetrics,
};
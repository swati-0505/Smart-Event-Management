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

/**
 * Fetch dashboard metrics.
 * Later: return apiRequest("/api/admin/dashboard");
 */
export async function getDashboardMetrics() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For development, return mock data
  return mockDashboardData;
}

export default {
  getDashboardMetrics,
};
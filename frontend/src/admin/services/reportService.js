// reportService.js
// Handles all report/analytics API calls.
// Currently uses mock data. When backend is ready, switch to real API.

import apiRequest from "./api";

// ============================================
// MOCK DATA (Development)
// ============================================
// This structure matches the backend API response.
// When backend is ready, comment out mock and use apiRequest.

const mockReportData = {
  kpis: {
    total_events: { value: 52, trend: "+18%", trend_up: true },
    total_registrations: { value: 2470, trend: "+24%", trend_up: true },
    avg_attendance: { value: "82%", trend: "+5%", trend_up: true },
    cancellations: { value: 43, trend: "-12%", trend_up: false },
  },
  monthly: [
    { month: "Jan", events: 4, registrations: 120 },
    { month: "Feb", events: 6, registrations: 180 },
    { month: "Mar", events: 5, registrations: 220 },
    { month: "Apr", events: 8, registrations: 340 },
    { month: "May", events: 7, registrations: 410 },
    { month: "Jun", events: 10, registrations: 520 },
    { month: "Jul", events: 12, registrations: 680 },
  ],
  categories: [
    { name: "Technology", value: 35, color: "bg-indigo-500" },
    { name: "Cultural", value: 25, color: "bg-purple-500" },
    { name: "Workshop", value: 20, color: "bg-blue-500" },
    { name: "Business", value: 12, color: "bg-emerald-500" },
    { name: "Other", value: 8, color: "bg-orange-500" },
  ],
  top_events: [
    { name: "Tech Fest 2025", registrations: 420, attendance: "94%", rating: 4.8 },
    { name: "Cultural Fest", registrations: 650, attendance: "88%", rating: 4.6 },
    { name: "College Annual Day", registrations: 950, attendance: "92%", rating: 4.9 },
    { name: "Startup Pitch Night", registrations: 120, attendance: "78%", rating: 4.4 },
  ],
};

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Fetch all report data.
 * @param {string} period - Filter period (This Week / This Month / This Quarter / This Year)
 */
export async function getReportData(period = "This Month") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // ✅ DEVELOPMENT: Return mock data
  return mockReportData;

  // 🚀 PRODUCTION: Uncomment this when backend is ready
  // return apiRequest(`/api/admin/reports?period=${encodeURIComponent(period)}`);
}

/**
 * Export report data (CSV / PDF).
 * @param {string} format - "csv" or "pdf"
 */
export async function exportReport(format = "csv") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // ✅ DEVELOPMENT: Fake success
  return { success: true, message: `Report exported as ${format.toUpperCase()}` };

  // 🚀 PRODUCTION: Uncomment this when backend is ready
  // return apiRequest(`/api/admin/reports/export?format=${format}`, {
  //   method: "POST",
  // });
}

export default {
  getReportData,
  exportReport,
};
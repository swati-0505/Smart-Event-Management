// reportService.js
// Handles all report/analytics API calls.
// Provides period-based mock data — backend ready hone pe real API use hoga.

import { apiRequest } from "./api";

// ============================================
// MOCK DATA — period-based
// ============================================

function getMockData(period) {
  // Base metrics — same for all periods (in real backend, these will differ)
  const kpis = {
    total_events: { value: 52, trend: "+18%", trend_up: true },
    total_registrations: { value: 2470, trend: "+24%", trend_up: true },
    avg_attendance: { value: "82%", trend: "+5%", trend_up: true },
    cancellations: { value: 43, trend: "-12%", trend_up: false },
  };

  const categories = [
    { name: "Technology", value: 35, color: "bg-indigo-500" },
    { name: "Cultural", value: 25, color: "bg-purple-500" },
    { name: "Workshop", value: 20, color: "bg-blue-500" },
    { name: "Business", value: 12, color: "bg-emerald-500" },
    { name: "Other", value: 8, color: "bg-orange-500" },
  ];

  const top_events = [
    { name: "Tech Fest 2025", registrations: 420, attendance: "94%", rating: 4.8 },
    { name: "Cultural Fest", registrations: 650, attendance: "88%", rating: 4.6 },
    { name: "College Annual Day", registrations: 950, attendance: "92%", rating: 4.9 },
    { name: "Startup Pitch Night", registrations: 120, attendance: "78%", rating: 4.4 },
  ];

  // Period-specific chart data
  let monthly = [];
  let chartLabel = "Monthly";
  let trendLabel = "Registrations over time";

  if (period === "This Week") {
    chartLabel = "Daily";
    trendLabel = "Registrations this week";
    monthly = [
      { month: "Mon", events: 2, registrations: 45 },
      { month: "Tue", events: 3, registrations: 78 },
      { month: "Wed", events: 4, registrations: 120 },
      { month: "Thu", events: 3, registrations: 95 },
      { month: "Fri", events: 5, registrations: 180 },
      { month: "Sat", events: 6, registrations: 240 },
      { month: "Sun", events: 2, registrations: 85 },
    ];
  } else if (period === "This Month") {
    chartLabel = "Weekly";
    trendLabel = "Registrations this month";
    monthly = [
      { month: "Week 1", events: 8, registrations: 320 },
      { month: "Week 2", events: 10, registrations: 450 },
      { month: "Week 3", events: 9, registrations: 380 },
      { month: "Week 4", events: 12, registrations: 520 },
    ];
  } else if (period === "This Quarter") {
    chartLabel = "Monthly";
    trendLabel = "Registrations this quarter";
    monthly = [
      { month: "Jul", events: 12, registrations: 680 },
      { month: "Aug", events: 14, registrations: 820 },
      { month: "Sep", events: 11, registrations: 750 },
    ];
  } else if (period === "This Year") {
    chartLabel = "Monthly";
    trendLabel = "Registrations this year";
    monthly = [
      { month: "Jan", events: 4, registrations: 120 },
      { month: "Feb", events: 6, registrations: 180 },
      { month: "Mar", events: 5, registrations: 220 },
      { month: "Apr", events: 8, registrations: 340 },
      { month: "May", events: 7, registrations: 410 },
      { month: "Jun", events: 10, registrations: 520 },
      { month: "Jul", events: 12, registrations: 680 },
      { month: "Aug", events: 14, registrations: 820 },
      { month: "Sep", events: 11, registrations: 750 },
      { month: "Oct", events: 13, registrations: 890 },
      { month: "Nov", events: 15, registrations: 1050 },
      { month: "Dec", events: 18, registrations: 1240 },
    ];
  }

  return { kpis, monthly, categories, top_events, chartLabel, trendLabel };
}

// ============================================
// SERVICE FUNCTIONS
// ============================================

export async function getReportData(period = "This Month") {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400));

  // ✅ DEVELOPMENT: Return period-based mock data
  return getMockData(period);

  // 🚀 PRODUCTION: Uncomment this when backend is ready
  // return apiRequest(`/admin/reports?period=${encodeURIComponent(period)}`);
}

export async function exportReport(format = "csv") {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    message: `Report exported as ${format.toUpperCase()}`,
  };

  // 🚀 PRODUCTION
  // return apiRequest(`/admin/reports/export?format=${format}`, {
  //   method: "POST",
  // });
}

export default {
  getReportData,
  exportReport,
};
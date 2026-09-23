// calendarService.js
// Handles all calendar/events API calls.
// Uses mock data now — switches to real backend when ready.

import { apiRequest } from "./api";

// ============================================
// MOCK DATA (Development)
// ============================================

const mockCalendarEvents = {
  "2026-6-3": [
    { id: 1, title: "Team Discussion", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Office", status: "confirmed" },
  ],
  "2026-6-5": [
    { id: 2, title: "Client Meeting", time: "10:00", duration: "1h", color: "bg-purple-500", category: "International", status: "confirmed" },
  ],
  "2026-6-7": [
    { id: 3, title: "Sprint Planning", time: "11:00", duration: "2h", color: "bg-blue-500", category: "Office", status: "confirmed" },
    { id: 4, title: "Lunch with Team", time: "13:00", duration: "1h", color: "bg-emerald-500", category: "Personal", status: "confirmed" },
  ],
  "2026-6-11": [
    { id: 5, title: "Interview Round", time: "09:00", duration: "1h", color: "bg-purple-500", category: "Office", status: "confirmed" },
    { id: 6, title: "Design Review", time: "14:00", duration: "1h", color: "bg-emerald-500", category: "Personal", status: "pending" },
  ],
  "2026-6-12": [
    { id: 7, title: "Real Estate Call", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Office", status: "confirmed" },
    { id: 8, title: "Mid Year Report", time: "08:30", duration: "2h", color: "bg-blue-500", category: "Misc", status: "confirmed" },
  ],
  "2026-6-16": [
    { id: 9, title: "Quarterly Review", time: "09:00", duration: "2h", color: "bg-purple-500", category: "Office", status: "confirmed" },
  ],
  "2026-6-17": [
    { id: 10, title: "Product Demo", time: "09:00", duration: "1h", color: "bg-blue-500", category: "Personal", status: "confirmed" },
  ],
  "2026-6-18": [
    { id: 11, title: "Birthday Event", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Personal", status: "confirmed" },
    { id: 12, title: "Client Call", time: "11:00", duration: "1h", color: "bg-pink-500", category: "International", status: "confirmed" },
    { id: 13, title: "Team Outing", time: "15:00", duration: "3h", color: "bg-orange-500", category: "Holiday", status: "pending" },
  ],
  "2026-6-19": [
    { id: 14, title: "Property Tour", time: "09:00", duration: "1h", color: "bg-purple-500", category: "Office", status: "confirmed" },
    { id: 15, title: "Conference", time: "13:00", duration: "4h", color: "bg-blue-500", category: "Misc", status: "confirmed" },
  ],
  "2026-6-22": [
    { id: 16, title: "Team Interview", time: "09:00", duration: "1h", color: "bg-emerald-500", category: "Office", status: "confirmed" },
  ],
  "2026-6-24": [
    { id: 17, title: "Team Lunch", time: "12:00", duration: "1h", color: "bg-blue-500", category: "Office", status: "confirmed" },
  ],
  "2026-6-25": [
    { id: 18, title: "Strategy Meeting", time: "09:00", duration: "2h", color: "bg-purple-500", category: "Personal", status: "confirmed" },
  ],
  "2026-6-26": [
    { id: 19, title: "Product Launch", time: "10:00", duration: "3h", color: "bg-purple-500", category: "Office", status: "confirmed" },
  ],
  "2026-6-30": [
    { id: 20, title: "Monthly Reporting", time: "09:00", duration: "2h", color: "bg-pink-500", category: "Office", status: "confirmed" },
  ],
};

const mockUpcomingEvents = [
  {
    id: 101,
    time: "09:00 - 12:00",
    date: "18 June, 2026",
    title: "Next Quarterly Staff Briefing: Company Growth & Future Market Trends",
    location: "Cornevie, New York",
    color: "bg-emerald-500",
  },
  {
    id: 102,
    time: "13:00 - 14:00",
    date: "18 June, 2026",
    title: "Zoom Meeting With Our Paris Branch: Ways To Attract More Customers",
    location: "Online, Zoom",
    color: "bg-purple-500",
  },
  {
    id: 103,
    time: "10:00 - 11:30",
    date: "20 June, 2026",
    title: "Design System Review: Component Library v2 Updates",
    location: "Design Studio, Floor 3",
    color: "bg-indigo-500",
  },
];

// ============================================
// SERVICE FUNCTIONS
// ============================================

/**
 * Fetch all events.
 * @param {object} filters - Optional filters { categories, search, status, period }
 */
export async function getCalendarEvents(filters = {}) {
  // Simulate API delay
  await new Promise((r) => setTimeout(r, 300));

  // ✅ DEVELOPMENT: Return mock data
  return {
    events: mockCalendarEvents,
    upcoming: mockUpcomingEvents,
  };

  // 🚀 PRODUCTION: Uncomment when backend ready
  // const params = new URLSearchParams();
  // if (filters.categories?.length) params.set("categories", filters.categories.join(","));
  // if (filters.search) params.set("search", filters.search);
  // if (filters.status && filters.status !== "all") params.set("status", filters.status);
  // if (filters.period) params.set("period", filters.period);
  // return apiRequest(`/api/admin/calendar/events?${params.toString()}`);
}

/**
 * Fetch upcoming events for sidebar.
 */
export async function getUpcomingEvents(limit = 3) {
  await new Promise((r) => setTimeout(r, 200));

  // ✅ DEVELOPMENT
  return mockUpcomingEvents.slice(0, limit);

  // 🚀 PRODUCTION
  // return apiRequest(`/api/admin/calendar/upcoming?limit=${limit}`);
}

/**
 * Create a new event.
 */
export async function createEvent(eventData) {
  await new Promise((r) => setTimeout(r, 500));

  const newEvent = { id: Date.now(), ...eventData };

  // ✅ DEVELOPMENT — not saved to mock, just returns
  return { success: true, event: newEvent };

  // 🚀 PRODUCTION
  // return apiRequest("/api/admin/calendar/events", {
  //   method: "POST",
  //   body: JSON.stringify(eventData),
  // });
}

export default {
  getCalendarEvents,
  getUpcomingEvents,
  createEvent,
};
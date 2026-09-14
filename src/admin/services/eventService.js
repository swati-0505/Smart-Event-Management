// eventService.js
// Events CRUD — backend-ready.

import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./api";

/* ---------------- Mock ---------------- */
let MOCK_EVENTS = [
  { id: 1, title: "Tech Fest 2025", date: "08 Jul 2025", time: "10:00 AM - 4:00 PM", venue: "Auditorium", capacity: 500, registered: 420, status: "Upcoming", category: "Technology" },
  { id: 2, title: "Cultural Fest", date: "12 Jul 2025", time: "2:00 PM - 6:00 PM", venue: "Main Ground", capacity: 800, registered: 650, status: "Upcoming", category: "Cultural" },
  { id: 3, title: "Workshop on Web Development", date: "15 Jul 2025", time: "9:00 AM - 12:00 PM", venue: "Computer Lab 1", capacity: 60, registered: 58, status: "Active", category: "Workshop" },
  { id: 4, title: "College Annual Day", date: "20 Jul 2025", time: "5:00 PM - 10:00 PM", venue: "Main Auditorium", capacity: 1000, registered: 950, status: "Today", category: "Ceremony" },
  { id: 5, title: "Startup Pitch Night", date: "25 Jul 2025", time: "6:00 PM - 9:00 PM", venue: "Conference Hall", capacity: 200, registered: 120, status: "Upcoming", category: "Business" },
];

/* ---------------- Service ---------------- */

/**
 * Fetch events with optional filters.
 * 🚀 Backend: GET /admin/events?status=Upcoming&search=tech
 */
export async function getEvents(filters = {}) {
  // ✅ MOCK — filter locally
  await new Promise((r) => setTimeout(r, 300));

  let result = [...MOCK_EVENTS];

  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (e) => e.title.toLowerCase().includes(s) || e.venue.toLowerCase().includes(s)
    );
  }
  if (filters.status && filters.status !== "All") {
    result = result.filter((e) => e.status === filters.status);
  }
  return result;

  // 🚀 PRODUCTION
  // const q = buildQuery(filters);
  // return apiGet(`/admin/events${q}`);
}

/**
 * Get single event.
 * 🚀 Backend: GET /admin/events/:id
 */
export async function getEventById(id) {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_EVENTS.find((e) => e.id === id);

  // 🚀 PRODUCTION
  // return apiGet(`/admin/events/${id}`);
}

/**
 * Create a new event.
 * 🚀 Backend: POST /admin/events
 */
export async function createEvent(data) {
  await new Promise((r) => setTimeout(r, 400));

  const newEvent = { id: Date.now(), ...data, registered: 0, status: "Upcoming" };
  MOCK_EVENTS = [newEvent, ...MOCK_EVENTS];
  return newEvent;

  // 🚀 PRODUCTION
  // return apiPost("/admin/events", data);
}

/**
 * Update an event.
 * 🚀 Backend: PUT /admin/events/:id
 */
export async function updateEvent(id, data) {
  await new Promise((r) => setTimeout(r, 400));

  MOCK_EVENTS = MOCK_EVENTS.map((e) => (e.id === id ? { ...e, ...data } : e));
  return MOCK_EVENTS.find((e) => e.id === id);

  // 🚀 PRODUCTION
  // return apiPut(`/admin/events/${id}`, data);
}

/**
 * Delete an event.
 * 🚀 Backend: DELETE /admin/events/:id
 */
export async function deleteEvent(id) {
  await new Promise((r) => setTimeout(r, 300));

  MOCK_EVENTS = MOCK_EVENTS.filter((e) => e.id !== id);
  return { success: true };

  // 🚀 PRODUCTION
  // return apiDelete(`/admin/events/${id}`);
}

export default { getEvents, getEventById, createEvent, updateEvent, deleteEvent };
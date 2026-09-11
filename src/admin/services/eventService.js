// eventService.js
// Handles all event-related API calls.

import apiRequest from "./api";

// Mock data based on database schema fields:
// event_id, title, capacity, description, start_time, end_time,
// venue_id, created_by, status, created_at
const mockEvents = [
  {
    event_id: 1,
    title: "Tech Summit 2026",
    description: "Annual technology conference with industry leaders.",
    capacity: 500,
    start_time: "2026-09-12T10:00:00",
    end_time: "2026-09-12T16:00:00",
    venue_id: 1,
    venue_name: "Main Auditorium", // joined from venues table
    created_by: "Admin",
    status: "UPCOMING",
    created_at: "2026-08-01T10:00:00",
  },
  {
    event_id: 2,
    title: "Design Workshop",
    description: "Hands-on design thinking workshop.",
    capacity: 120,
    start_time: "2026-09-18T11:00:00",
    end_time: "2026-09-18T14:00:00",
    venue_id: 2,
    venue_name: "Innovation Hall",
    created_by: "Admin",
    status: "ACTIVE",
    created_at: "2026-08-05T10:00:00",
  },
  {
    event_id: 3,
    title: "Startup Meetup",
    description: "Networking event for startup founders.",
    capacity: 100,
    start_time: "2026-09-24T17:00:00",
    end_time: "2026-09-24T20:00:00",
    venue_id: 3,
    venue_name: "Conference Room A",
    created_by: "Admin",
    status: "PENDING",
    created_at: "2026-08-10T10:00:00",
  },
];

// 👇 TOGGLE: Set to false when backend is ready
const USE_MOCK_DATA = true;

/**
 * Fetch all events.
 */
export async function getEvents() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockEvents;
  }

  return apiRequest("/api/admin/events");
}

/**
 * Fetch a single event by ID.
 */
export async function getEventById(eventId) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockEvents.find((event) => event.event_id === eventId);
  }

  return apiRequest(`/api/admin/events/${eventId}`);
}

/**
 * Create a new event.
 */
export async function createEvent(eventData) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newEvent = {
      event_id: Date.now(),
      ...eventData,
      created_by: "Admin",
      created_at: new Date().toISOString(),
    };

    mockEvents.push(newEvent);
    return newEvent;
  }

  return apiRequest("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(eventData),
  });
}

/**
 * Update an existing event.
 */
export async function updateEvent(eventId, eventData) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockEvents.findIndex((event) => event.event_id === eventId);
    if (index !== -1) {
      mockEvents[index] = { ...mockEvents[index], ...eventData };
      return mockEvents[index];
    }

    throw new Error("Event not found");
  }

  return apiRequest(`/api/admin/events/${eventId}`, {
    method: "PUT",
    body: JSON.stringify(eventData),
  });
}

/**
 * Cancel an event (change status to CANCELLED).
 */
export async function cancelEvent(eventId) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const event = mockEvents.find((event) => event.event_id === eventId);
    if (event) {
      event.status = "CANCELLED";
      return event;
    }

    throw new Error("Event not found");
  }

  return apiRequest(`/api/admin/events/${eventId}/cancel`, {
    method: "PATCH",
  });
}

/**
 * Delete an event.
 */
export async function deleteEvent(eventId) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockEvents.findIndex((event) => event.event_id === eventId);
    if (index !== -1) {
      mockEvents.splice(index, 1);
    }
    return { success: true };
  }

  return apiRequest(`/api/admin/events/${eventId}`, {
    method: "DELETE",
  });
}

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
  deleteEvent,
};
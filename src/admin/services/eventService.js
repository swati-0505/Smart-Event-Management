// eventService.js
// Handles all event-related API calls.
// Currently using mock data for development.
// Later, replace mock data with real API calls.

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

/**
 * Fetch all events.
 * Later: return apiRequest("/api/admin/events");
 */
export async function getEvents() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For development, return mock data
  return mockEvents;
}

/**
 * Fetch a single event by ID.
 */
export async function getEventById(eventId) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For development, return from mock data
  return mockEvents.find((event) => event.event_id === eventId);
}

/**
 * Create a new event.
 */
export async function createEvent(eventData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For development, create a mock event
  const newEvent = {
    event_id: Date.now(), // temporary ID
    ...eventData,
    created_by: "Admin",
    created_at: new Date().toISOString(),
  };

  // Add to mock array (in real app, backend will handle this)
  mockEvents.push(newEvent);

  return newEvent;
}

/**
 * Update an existing event.
 */
export async function updateEvent(eventId, eventData) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For development, update mock data
  const index = mockEvents.findIndex((event) => event.event_id === eventId);
  if (index !== -1) {
    mockEvents[index] = { ...mockEvents[index], ...eventData };
    return mockEvents[index];
  }

  throw new Error("Event not found");
}

/**
 * Cancel an event (change status to CANCELLED).
 */
export async function cancelEvent(eventId) {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For development, update mock data
  const event = mockEvents.find((event) => event.event_id === eventId);
  if (event) {
    event.status = "CANCELLED";
    return event;
  }

  throw new Error("Event not found");
}

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  cancelEvent,
};
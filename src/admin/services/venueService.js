// venueService.js
// Handles all venue-related API calls.
// Database fields: venue_id, name, address, city, capacity, created_at

import apiRequest from "./api";

// Mock data based on database schema
const mockVenues = [
  {
    venue_id: 1,
    name: "Main Auditorium",
    address: "123 University Road",
    city: "Hyderabad",
    capacity: 500,
    created_at: "2026-01-15T10:00:00",
  },
  {
    venue_id: 2,
    name: "Innovation Hall",
    address: "45 Tech Park",
    city: "Hyderabad",
    capacity: 200,
    created_at: "2026-02-20T10:00:00",
  },
  {
    venue_id: 3,
    name: "Conference Room A",
    address: "78 Business District",
    city: "Bengaluru",
    capacity: 100,
    created_at: "2026-03-10T10:00:00",
  },
];

// 👇 TOGGLE: Set to false when backend is ready
const USE_MOCK_DATA = true;

/**
 * Fetch all venues.
 */
export async function getVenues() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockVenues;
  }

  return apiRequest("/api/admin/venues");
}

/**
 * Create a new venue.
 */
export async function createVenue(venueData) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newVenue = {
      venue_id: Date.now(),
      ...venueData,
      created_at: new Date().toISOString(),
    };

    mockVenues.push(newVenue);
    return newVenue;
  }

  return apiRequest("/api/admin/venues", {
    method: "POST",
    body: JSON.stringify(venueData),
  });
}

/**
 * Delete a venue.
 */
export async function deleteVenue(venueId) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockVenues.findIndex((v) => v.venue_id === venueId);
    if (index !== -1) mockVenues.splice(index, 1);

    return { success: true };
  }

  return apiRequest(`/api/admin/venues/${venueId}`, {
    method: "DELETE",
  });
}

export default {
  getVenues,
  createVenue,
  deleteVenue,
};
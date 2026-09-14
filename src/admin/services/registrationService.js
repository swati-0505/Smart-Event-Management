// registrationService.js
// Handles all registration-related API calls.
// Database fields: registration_id, user_id, event_id,
// registration_date, status, created_at

import apiRequest from "./api";

// Mock data based on database schema
const mockRegistrations = [
  {
    registration_id: 1,
    user_id: 101,
    user_name: "Rahul Sharma",
    event_id: 1,
    event_title: "Tech Summit 2026",
    registration_date: "2026-08-15T10:00:00",
    status: "CONFIRMED",
    created_at: "2026-08-15T10:00:00",
  },
  {
    registration_id: 2,
    user_id: 102,
    user_name: "Ananya Verma",
    event_id: 2,
    event_title: "Design Workshop",
    registration_date: "2026-08-18T10:00:00",
    status: "CONFIRMED",
    created_at: "2026-08-18T10:00:00",
  },
  {
    registration_id: 3,
    user_id: 103,
    user_name: "Arjun Mehta",
    event_id: 3,
    event_title: "Startup Meetup",
    registration_date: "2026-08-20T10:00:00",
    status: "PENDING",
    created_at: "2026-08-20T10:00:00",
  },
];

// 👇 TOGGLE: Set to false when backend is ready
const USE_MOCK_DATA = true;

/**
 * Fetch all registrations.
 */
export async function getRegistrations() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockRegistrations;
  }

  return apiRequest("/api/admin/registrations");
}

/**
 * Update registration status.
 */
export async function updateRegistrationStatus(registrationId, status) {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const registration = mockRegistrations.find(
      (reg) => reg.registration_id === registrationId
    );

    if (registration) {
      registration.status = status;
      return registration;
    }

    throw new Error("Registration not found");
  }

  return apiRequest(`/api/admin/registrations/${registrationId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export default {
  getRegistrations,
  updateRegistrationStatus,
};
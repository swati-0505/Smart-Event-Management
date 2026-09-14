// registrationService.js
// Registrations — backend-ready.

import { apiGet, apiPatch, buildQuery } from "./api";

/* ---------------- Mock ---------------- */
let MOCK_REGISTRATIONS = [
  { id: 1, user: "Rahul Sharma", email: "rahul@example.com", event: "Tech Fest 2025", date: "02 Jul 2025", status: "Confirmed" },
  { id: 2, user: "Ananya Verma", email: "ananya@example.com", event: "Cultural Fest", date: "03 Jul 2025", status: "Confirmed" },
  { id: 3, user: "Arjun Mehta", email: "arjun@example.com", event: "Tech Fest 2025", date: "04 Jul 2025", status: "Pending" },
  { id: 4, user: "Priya Singh", email: "priya@example.com", event: "Workshop on Web Dev", date: "05 Jul 2025", status: "Confirmed" },
  { id: 5, user: "Karan Kumar", email: "karan@example.com", event: "College Annual Day", date: "06 Jul 2025", status: "Cancelled" },
  { id: 6, user: "Sneha Patel", email: "sneha@example.com", event: "Startup Pitch Night", date: "07 Jul 2025", status: "Pending" },
];

/**
 * Get registrations with filters.
 * 🚀 Backend: GET /admin/registrations
 */
export async function getRegistrations(filters = {}) {
  await new Promise((r) => setTimeout(r, 300));

  let result = [...MOCK_REGISTRATIONS];
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (r) => r.user.toLowerCase().includes(s) || r.event.toLowerCase().includes(s)
    );
  }
  if (filters.status && filters.status !== "All") {
    result = result.filter((r) => r.status === filters.status);
  }
  return result;

  // 🚀 PRODUCTION
  // return apiGet(`/admin/registrations${buildQuery(filters)}`);
}

/**
 * Update registration status.
 * 🚀 Backend: PATCH /admin/registrations/:id
 */
export async function updateRegistrationStatus(id, status) {
  await new Promise((r) => setTimeout(r, 300));

  MOCK_REGISTRATIONS = MOCK_REGISTRATIONS.map((r) =>
    r.id === id ? { ...r, status } : r
  );
  return MOCK_REGISTRATIONS.find((r) => r.id === id);

  // 🚀 PRODUCTION
  // return apiPatch(`/admin/registrations/${id}`, { status });
}

export default { getRegistrations, updateRegistrationStatus };
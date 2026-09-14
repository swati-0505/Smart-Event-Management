// userService.js
// Users — backend-ready.

import { apiGet, apiPost, buildQuery } from "./api";

/* ---------------- Mock ---------------- */
let MOCK_USERS = [
  { id: 1, name: "Yugant", email: "yugant@smartevent.com", role: "Admin", joined: "01 Jan 2025" },
  { id: 2, name: "Rahul Sharma", email: "rahul@example.com", role: "User", joined: "15 Mar 2025" },
  { id: 3, name: "Ananya Verma", email: "ananya@example.com", role: "Organizer", joined: "20 Apr 2025" },
  { id: 4, name: "Arjun Mehta", email: "arjun@example.com", role: "User", joined: "10 May 2025" },
  { id: 5, name: "Priya Singh", email: "priya@example.com", role: "Organizer", joined: "22 Jun 2025" },
  { id: 6, name: "Sneha Patel", email: "sneha@example.com", role: "User", joined: "05 Jul 2025" },
];

/**
 * Get users with filters.
 * 🚀 Backend: GET /admin/users
 */
export async function getUsers(filters = {}) {
  await new Promise((r) => setTimeout(r, 300));

  let result = [...MOCK_USERS];
  if (filters.search) {
    const s = filters.search.toLowerCase();
    result = result.filter(
      (u) => u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s)
    );
  }
  if (filters.role && filters.role !== "All") {
    result = result.filter((u) => u.role === filters.role);
  }
  return result;

  // 🚀 PRODUCTION
  // return apiGet(`/admin/users${buildQuery(filters)}`);
}

/**
 * Create a new user.
 * 🚀 Backend: POST /admin/users
 */
export async function createUser(data) {
  await new Promise((r) => setTimeout(r, 400));

  const newUser = {
    id: Date.now(),
    ...data,
    joined: new Date().toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  };
  MOCK_USERS = [newUser, ...MOCK_USERS];
  return newUser;

  // 🚀 PRODUCTION
  // return apiPost("/admin/users", data);
}

export default { getUsers, createUser };
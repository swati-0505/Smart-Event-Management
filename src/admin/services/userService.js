// userService.js
// Handles all user-related API calls.
// Database fields: user_id, name, email, password_hash,
// role, created_at

import apiRequest from "./api";

// Mock data based on database schema
const mockUsers = [
  {
    user_id: 1,
    name: "Admin",
    email: "Admin@smartevent.com",
    role: "ADMIN",
    created_at: "2026-01-01T10:00:00",
  },
  {
    user_id: 101,
    name: "Rahul Sharma",
    email: "rahul@example.com",
    role: "USER",
    created_at: "2026-03-15T10:00:00",
  },
  {
    user_id: 102,
    name: "Ananya Verma",
    email: "ananya@example.com",
    role: "USER",
    created_at: "2026-04-20T10:00:00",
  },
];

// 👇 TOGGLE: Set to false when backend is ready
const USE_MOCK_DATA = true;

/**
 * Fetch all users.
 */
export async function getUsers() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockUsers;
  }

  return apiRequest("/api/admin/users");
}

export default {
  getUsers,
};
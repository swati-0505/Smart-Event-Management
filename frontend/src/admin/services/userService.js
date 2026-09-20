// userService.js
// User service — connected to backend API.

import { apiGet, apiPost, apiDelete, buildQuery } from "./api";

export async function getUsers(filters = {}) {
  const q = buildQuery(filters);
  return apiGet(`/users/${q}`);
}

export async function getUserById(id) {
  return apiGet(`/users/${id}`);
}

export async function getUserByEmail(email) {
  return apiGet(`/users/email/${encodeURIComponent(email)}`);
}

export async function createUser(data) {
  return apiPost("/users/", data);
}

export async function deleteUser(id) {
  return apiDelete(`/users/${id}`);
}

export default {
  getUsers,
  getUserById,
  getUserByEmail,
  createUser,
  deleteUser,
};
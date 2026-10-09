import { apiGet, apiPost, apiPatch, apiDelete } from "./api/client";

export async function getUsers() {
  return apiGet("/users/");
}

export async function getUserById(userId) {
  return apiGet(`/users/${encodeURIComponent(userId)}`);
}

export async function getUserByEmail(email) {
  return apiGet(`/users/email/${encodeURIComponent(email)}`);
}

export async function createUser(userData) {
  return apiPost("/users/", userData);
}

export async function updateUserRole(userId, role) {
  return apiPatch(`/users/${encodeURIComponent(userId)}/role`, { role });
}

export async function deleteUser(userId) {
  return apiDelete(`/users/${encodeURIComponent(userId)}`);
}


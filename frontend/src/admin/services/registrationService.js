// registrationService.js
// Registration service — connected to backend API.

import {
  apiGet,
  apiPost,
  apiPut,
  buildQuery,
} from "./api";

/* ---------------- Service ---------------- */

export async function getRegistrations(filters = {}) {
  const q = buildQuery(filters);
  return apiGet(`/registrations/${q}`);
}

export async function getRegistrationById(id) {
  return apiGet(`/registrations/${id}`);
}

export async function getRegistrationsByEvent(eventId) {
  return apiGet(`/registrations/event/${eventId}`);
}

export async function getRegistrationsByUser(userId) {
  return apiGet(`/registrations/user/${userId}`);
}

export async function createRegistration(data) {
  return apiPost("/registrations/", data);
}

export async function updateRegistrationStatus(id, status) {
  return apiPut(`/registrations/${id}`, { status });
}

export async function cancelRegistration(id) {
  return apiPut(`/registrations/${id}/cancel`);
}

export default {
  getRegistrations,
  getRegistrationById,
  getRegistrationsByEvent,
  getRegistrationsByUser,
  createRegistration,
  updateRegistrationStatus,
  cancelRegistration,
};
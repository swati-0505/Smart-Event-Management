import { apiGet, apiPost, apiPut } from "./api/client";

export async function getAllRegistrations() {
  return apiGet("/registrations/");
}

export async function getRegistrationById(registrationId) {
  return apiGet(`/registrations/${encodeURIComponent(registrationId)}`);
}

export async function createRegistration(userId, eventId) {
  return apiPost("/registrations/", { user_id: userId, event_id: eventId });
}

export async function getUserRegistrations(userId) {
  return apiGet(`/registrations/user/${encodeURIComponent(userId)}`);
}

export async function getEventRegistrations(eventId) {
  return apiGet(`/registrations/event/${encodeURIComponent(eventId)}`);
}

export async function cancelRegistration(registrationId) {
  return apiPut(`/registrations/${encodeURIComponent(registrationId)}/cancel`);
}

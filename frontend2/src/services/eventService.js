import { apiGet, apiPost, apiPut, apiDelete } from "./api/client";

export async function getPublishedEvents() {
  return apiGet("/events/published", { skipAuth: true });
}

export async function getCompletedEvents() {
  return apiGet("/events/completed", { skipAuth: true });
}

export async function getAllEvents() {
  return apiGet("/events/");
}

export async function getEventById(eventId) {
  return apiGet(`/events/${encodeURIComponent(eventId)}`, { skipAuth: true });
}

export async function createEvent(eventData) {
  return apiPost("/events/", eventData);
}

export async function updateEvent(eventId, eventData) {
  return apiPut(`/events/${encodeURIComponent(eventId)}`, eventData);
}

export async function deleteEvent(eventId) {
  return apiDelete(`/events/${encodeURIComponent(eventId)}`);
}

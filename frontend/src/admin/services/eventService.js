
import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  buildQuery,
} from "./api";

export async function getEvents(filters = {}) {
  const q = buildQuery(filters);
  return apiGet(`/events/${q}`);
}

export async function getEventById(id) {
  return apiGet(`/events/${id}`);
}

export async function createEvent(data) {
  return apiPost("/events/", data);
}

export async function updateEvent(id, data) {
  return apiPut(`/events/${id}`, data);
}

export async function deleteEvent(id) {
  return apiDelete(`/events/${id}`);
}

export default {
  getEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
};
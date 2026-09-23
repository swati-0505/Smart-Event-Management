// venueService.js
// Venues — connected to backend.

import { apiGet, apiPost, apiPut, apiDelete, buildQuery } from "./api";

export async function getVenues(filters = {}) {
  const q = buildQuery(filters);
  return apiGet(`/venues/${q}`);
}

export async function getVenueById(id) {
  return apiGet(`/venues/${id}`);
}

export async function createVenue(data) {
  return apiPost("/venues/", data);
}

export async function updateVenue(id, data) {
  return apiPut(`/venues/${id}`, data);
}

export async function deleteVenue(id) {
  return apiDelete(`/venues/${id}`);
}

export default {
  getVenues,
  getVenueById,
  createVenue,
  updateVenue,
  deleteVenue,
};
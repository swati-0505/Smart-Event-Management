import { apiGet, apiPost, apiPut, apiDelete } from "./api/client";

export async function getVenues() {
  return apiGet("/venues/", { skipAuth: true });
}

export async function getVenueById(venueId) {
  return apiGet(`/venues/${encodeURIComponent(venueId)}`, { skipAuth: true });
}

export async function createVenue(venueData) {
  return apiPost("/venues/", venueData);
}

export async function updateVenue(venueId, venueData) {
  return apiPut(`/venues/${encodeURIComponent(venueId)}`, venueData);
}

export async function deleteVenue(venueId) {
  return apiDelete(`/venues/${encodeURIComponent(venueId)}`);
}

import { apiGet, apiPost, apiDelete } from "./api/client";

export async function getAllFeedback() {
  return apiGet("/feedback/");
}

export async function getPublicCompletedFeedback() {
  return apiGet("/feedback/public/completed", { skipAuth: true });
}

export async function getEventFeedback(eventId) {
  return apiGet(`/feedback/event/${encodeURIComponent(eventId)}`);
}

export async function getUserFeedback(userId) {
  return apiGet(`/feedback/user/${encodeURIComponent(userId)}`);
}

export async function createFeedback(feedbackData) {
  return apiPost("/feedback/", feedbackData);
}

export async function deleteFeedback(feedbackId) {
  return apiDelete(`/feedback/${encodeURIComponent(feedbackId)}`);
}

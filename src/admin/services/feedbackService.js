// feedbackService.js
// Handles all feedback-related API calls.
// Database fields: feedback_id, user_id, event_id,
// rating, comment, created_at

import apiRequest from "./api";

// Mock data based on database schema
const mockFeedback = [
  {
    feedback_id: 1,
    user_id: 101,
    user_name: "Rahul Sharma",
    event_id: 1,
    event_title: "Tech Summit 2026",
    rating: 5,
    comment: "Great event! Very well organized.",
    created_at: "2026-08-20T10:00:00",
  },
  {
    feedback_id: 2,
    user_id: 102,
    user_name: "Ananya Verma",
    event_id: 2,
    event_title: "Design Workshop",
    rating: 4,
    comment: "Good workshop, could be more hands-on.",
    created_at: "2026-08-22T10:00:00",
  },
];

/**
 * Fetch all feedback.
 * Later: return apiRequest("/api/admin/feedback");
 */
export async function getFeedback() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // For development, return mock data
  return mockFeedback;
}

export default {
  getFeedback,
};
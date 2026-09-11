// api.js
// Central API configuration.
// All services will use this file to make API calls.
// Later, when backend is ready, only change BASE_URL here.

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

/**
 * Generic API request handler.
 * All services will use this function to make requests.
 * Automatically adds auth token if available.
 */
export async function apiRequest(endpoint, options = {}) {
  // Get auth token from localStorage (if exists)
  const token = localStorage.getItem("admin-auth-token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized — auto logout
    if (response.status === 401) {
      localStorage.removeItem("admin-auth-token");
      window.location.reload();
      throw new Error("Unauthorized. Please login again.");
    }

    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export default apiRequest;
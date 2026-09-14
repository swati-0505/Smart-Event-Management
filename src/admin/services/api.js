// api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("admin-token");
  const tokenType = localStorage.getItem("admin-token-type") || "Bearer";

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `${tokenType} ${token}` }),
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let message = `API Error: ${response.status}`;
    try {
      const errData = await response.json();
      message = errData.detail || message;
    } catch {
      // ignore parse failure
    }
    throw new Error(message);
  }

  return response.json();
}

export default apiRequest;
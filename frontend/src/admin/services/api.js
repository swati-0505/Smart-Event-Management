// api.js
// Central API layer — all services use this.
// Handles base URL, auth, error handling, timeouts, JSON parsing.
// 🚀 When backend is ready, only VITE_API_URL needs updating.

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api";

// Request timeout (ms)
const REQUEST_TIMEOUT = 60000;

/**
 * Retrieve stored auth token.
 * Backend will send JWT after login — stored in localStorage.
 */
function getAuthToken() {
  return localStorage.getItem("admin-auth-token") || null;
}

/**
 * Central fetch wrapper.
 * @param {string} endpoint - API path (e.g. "/admin/events")
 * @param {object} options - { method, body, headers, signal }
 * @returns {Promise<any>} Parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = "GET", body, headers = {}, ...rest } = options;

  // Build final headers
  const finalHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...headers,
  };

  // Attach JWT token if available
  const token = getAuthToken();
  if (token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  // Set up timeout via AbortController
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: rest.signal || controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse JSON safely
    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle non-2xx responses
    if (!response.ok) {
      const message =
        (data && (data.detail || data.message)) ||
        `Request failed: ${response.status} ${response.statusText}`;

      // Auto-logout on 401
      if (response.status === 401) {
        localStorage.removeItem("admin-auth-token");
        window.location.href = "/admin.html?auth=expired";
      }

      throw new Error(message);
    }

    return data;
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      throw new Error("Request timed out. Please try again.");
    }
    throw err;
  }
}

/* ============================================================
   Convenience helpers
   ============================================================ */

export const apiGet = (url, opts = {}) =>
  apiRequest(url, { ...opts, method: "GET" });

export const apiPost = (url, body, opts = {}) =>
  apiRequest(url, { ...opts, method: "POST", body });

export const apiPut = (url, body, opts = {}) =>
  apiRequest(url, { ...opts, method: "PUT", body });

export const apiPatch = (url, body, opts = {}) =>
  apiRequest(url, { ...opts, method: "PATCH", body });

export const apiDelete = (url, opts = {}) =>
  apiRequest(url, { ...opts, method: "DELETE" });

/**
 * Build query string from object.
 */
export function buildQuery(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    if (Array.isArray(v)) v.forEach((item) => q.append(k, item));
    else q.append(k, v);
  });
  const str = q.toString();
  return str ? `?${str}` : "";
}

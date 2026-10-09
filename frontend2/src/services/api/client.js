import { authStorage } from "../auth/authStorage";

const API_BASE_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 30000;

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function parseFastApiError(data, responseStatus, responseText) {
  if (!data) return responseText || `Request failed with status ${responseStatus}`;
  
  if (typeof data.detail === "string") {
    return data.detail;
  }
  
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((item) => {
        if (typeof item === "string") return item;
        const loc = item.loc ? item.loc.join(".") : "";
        return loc ? `${loc}: ${item.msg}` : item.msg || JSON.stringify(item);
      })
      .join(", ");
  }

  if (data.message && typeof data.message === "string") {
    return data.message;
  }

  return responseText || `Error ${responseStatus}`;
}

export async function apiRequest(endpoint, options = {}) {
  const {
    method = "GET",
    body,
    headers = {},
    signal,
    token,
    skipAuth = false,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    ...customOptions
  } = options;

  const reqHeaders = new Headers(headers);
  reqHeaders.set("Accept", "application/json");

  if (body !== undefined && !(body instanceof FormData)) {
    reqHeaders.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const accessToken = token ?? authStorage.getToken();
    if (accessToken) {
      reqHeaders.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  const handleCallerAbort = () => controller.abort(signal?.reason);
  if (signal) {
    signal.addEventListener("abort", handleCallerAbort, { once: true });
  }

  try {
    const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, {
      ...customOptions,
      method,
      headers: reqHeaders,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      signal: controller.signal,
    });

    if (response.status === 204) {
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    let data = null;
    let text = "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      text = await response.text();
    }

    if (!response.ok) {
      if (response.status === 401 && !skipAuth) {
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
      const message = parseFastApiError(data, response.status, text);
      throw new ApiError(message, response.status, data);
    }

    return data ?? text;
  } catch (err) {
    if (err.name === "AbortError" && !signal?.aborted) {
      throw new ApiError("Request timed out. Please check your connection and try again.", 408);
    }
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || "Network connection error", 0);
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener("abort", handleCallerAbort);
    }
  }
}

export const apiGet = (url, options) => apiRequest(url, { ...options, method: "GET" });
export const apiPost = (url, body, options) => apiRequest(url, { ...options, method: "POST", body });
export const apiPut = (url, body, options) => apiRequest(url, { ...options, method: "PUT", body });
export const apiPatch = (url, body, options) => apiRequest(url, { ...options, method: "PATCH", body });
export const apiDelete = (url, options) => apiRequest(url, { ...options, method: "DELETE" });

export function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, val]) => {
    if (val === undefined || val === null || val === "") return;
    if (Array.isArray(val)) {
      val.forEach((v) => query.append(key, String(v)));
    } else {
      query.append(key, String(val));
    }
  });
  const str = query.toString();
  return str ? `?${str}` : "";
}

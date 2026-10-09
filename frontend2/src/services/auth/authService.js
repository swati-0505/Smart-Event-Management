import { apiGet, apiPost } from "../api/client";
import { authStorage } from "./authStorage";

export async function loginUser(email, password) {
  const tokenData = await apiPost("/auth/login", { email, password }, { skipAuth: true });
  if (!tokenData?.access_token) {
    throw new Error("No access token returned by server.");
  }
  
  
  authStorage.setToken(tokenData.access_token);
  
  try {
    const userProfile = await getCurrentUserProfile();
    return { token: tokenData.access_token, user: userProfile };
  } catch (err) {
    authStorage.clearToken();
    throw err;
  }
}

export async function registerUser(payload) {
  
  return apiPost("/auth/register", payload, { skipAuth: true });
}

export async function getCurrentUserProfile(token) {
  return apiGet("/auth/me", token ? { token } : undefined);
}

export function logoutUser() {
  authStorage.clearToken();
}

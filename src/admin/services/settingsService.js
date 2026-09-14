// settingsService.js
// Admin settings — backend-ready.

import { apiGet, apiPut } from "./api";

/* ---------------- Mock ---------------- */
const MOCK_SETTINGS = {
  siteName: "SmartEvent",
  siteUrl: "https://smartevent.com",
  maintenance: false,
  emailNotif: true,
  pushNotif: false,
  twoFactor: true,
  language: "en",
};

/**
 * Get settings.
 * 🚀 Backend: GET /admin/settings
 */
export async function getSettings() {
  await new Promise((r) => setTimeout(r, 200));
  return MOCK_SETTINGS;

  // 🚀 PRODUCTION
  // return apiGet("/admin/settings");
}

/**
 * Update settings.
 * 🚀 Backend: PUT /admin/settings
 */
export async function updateSettings(data) {
  await new Promise((r) => setTimeout(r, 400));
  return { success: true, settings: data };

  // 🚀 PRODUCTION
  // return apiPut("/admin/settings", data);
}

export default { getSettings, updateSettings };
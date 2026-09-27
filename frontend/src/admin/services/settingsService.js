import { apiGet, apiPut } from "./api";

export async function getSettings() {
  return apiGet("/admin/settings");
}

export async function updateSettings(data) {
  return apiPut("/admin/settings", data);
}

export default {
  getSettings,
  updateSettings,
};

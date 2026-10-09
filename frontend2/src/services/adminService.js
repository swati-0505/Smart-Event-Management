import { apiGet } from "./api/client";

export async function getDashboardStats() {
  return apiGet("/admin/dashboard");
}

export async function getAgentActivity(limit = 50) {
  return apiGet(`/admin/agent-activity?limit=${encodeURIComponent(limit)}`);
}

export async function getAgentRunDetail(runId) {
  return apiGet(`/admin/agent-activity/${encodeURIComponent(runId)}`);
}

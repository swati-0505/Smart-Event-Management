
import { apiGet } from "./api";

export async function getDashboardMetrics() {
  return apiGet("/admin/dashboard");
}

export default {
  getDashboardMetrics,
};
import { apiRequest } from "./api";

export async function getReportData() {
  return apiRequest("/admin/dashboard");
}

export async function exportReport(format = "csv") {
  throw new Error("Report export endpoint is not available in the backend yet.");
}

export default {
  getReportData,
  exportReport,
};
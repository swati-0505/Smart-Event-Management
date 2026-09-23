// paymentService.js
// Payments / Tickets — connected to backend.

import { apiGet, apiPost, apiPut, buildQuery } from "./api";

export async function getPayments(filters = {}) {
  const q = buildQuery(filters);
  return apiGet(`/payments/${q}`);
}

export async function getPaymentById(id) {
  return apiGet(`/payments/${id}`);
}

export async function createPayment(data) {
  return apiPost("/payments/", data);
}

export async function updatePaymentStatus(id, status) {
  return apiPut(`/payments/${id}/status`, { status });
}

export default {
  getPayments,
  getPaymentById,
  createPayment,
  updatePaymentStatus,
};
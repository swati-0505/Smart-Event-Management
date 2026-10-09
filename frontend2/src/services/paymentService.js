import { apiGet, apiPost, apiPut } from "./api/client";

export async function getAllPayments() {
  return apiGet("/payments/");
}

export async function getPaymentById(paymentId) {
  return apiGet(`/payments/${encodeURIComponent(paymentId)}`);
}

export async function getUserPayments(userId) {
  return apiGet(`/payments/user/${encodeURIComponent(userId)}`);
}

export async function getEventPayments(eventId) {
  return apiGet(`/payments/event/${encodeURIComponent(eventId)}`);
}

export async function createPayment(paymentData) {
  return apiPost("/payments/", paymentData);
}

export async function updatePaymentStatus(paymentId, status) {
  return apiPut(`/payments/${encodeURIComponent(paymentId)}/status`, { payment_status: status });
}

// paymentService.js
// Handles all payment-related API calls.
// Database fields: payment_id, user_id, event_id, price,
// payment_status, currency, transaction_id, payment_date

import apiRequest from "./api";

// Mock data based on database schema
const mockPayments = [
  {
    payment_id: 1,
    user_id: 101,
    user_name: "Rahul Sharma",
    event_id: 1,
    event_title: "Tech Summit 2026",
    price: 499.0,
    payment_status: "COMPLETED",
    currency: "INR",
    transaction_id: "TXN123456",
    payment_date: "2026-08-15T10:30:00",
  },
  {
    payment_id: 2,
    user_id: 102,
    user_name: "Ananya Verma",
    event_id: 2,
    event_title: "Design Workshop",
    price: 299.0,
    payment_status: "COMPLETED",
    currency: "INR",
    transaction_id: "TXN789012",
    payment_date: "2026-08-18T11:00:00",
  },
  {
    payment_id: 3,
    user_id: 103,
    user_name: "Arjun Mehta",
    event_id: 3,
    event_title: "Startup Meetup",
    price: 199.0,
    payment_status: "PENDING",
    currency: "INR",
    transaction_id: "TXN345678",
    payment_date: "2026-08-20T12:00:00",
  },
];

// 👇 TOGGLE: Set to false when backend is ready
const USE_MOCK_DATA = true;

/**
 * Fetch all payments.
 */
export async function getPayments() {
  if (USE_MOCK_DATA) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockPayments;
  }

  return apiRequest("/api/admin/payments");
}

export default {
  getPayments,
};
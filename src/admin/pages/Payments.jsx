// Payments.jsx
// This component displays the payments management page.
// It handles search and status filtering.

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import { getPayments } from "../services/paymentService";

function Payments() {
  // State for payments list
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Load payments on component mount
  useEffect(() => {
    loadPayments();
  }, []);

  // Function to load payments from service
  async function loadPayments() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get payments
      const data = await getPayments();
      setPayments(data);
    } catch (err) {
      setError("Failed to load payments. Please try again.");
      console.error("Error loading payments:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter payments based on search and status
  const filteredPayments = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return payments.filter((payment) => {
      const matchesSearch =
        !search ||
        payment.user_name.toLowerCase().includes(search) ||
        payment.event_title.toLowerCase().includes(search) ||
        payment.transaction_id.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || payment.payment_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, statusFilter]);

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          Operations
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              Payments
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Track and manage event payments.
            </p>
          </div>
        </div>
      </header>

      {/* Search and filter bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-[#d7a63a]/20 bg-[#d7a63a]/[0.05] px-3 py-2.5">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-[#d7a63a]/75" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by user, event, or transaction..."
              className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/30"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-md border border-white/[0.08] bg-[#151515] px-3 py-2.5 text-xs text-white/65 outline-none transition focus:border-[#d7a63a]/40 sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-white/30">
            Loading payments...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Payments table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px]">
              <thead>
                <tr className="border-b border-white/[0.07] text-left">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    User
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Event
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Status
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Transaction ID
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-white/25">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr
                      key={payment.payment_id}
                      className="border-b border-white/[0.055] transition hover:bg-white/[0.02] last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-white/85">
                          {payment.user_name}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/55">
                        {payment.event_title}
                      </td>
                      <td className="px-6 py-5 text-sm text-white/60">
                        {payment.currency} {payment.price.toFixed(2)}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`admin-status ${
                          payment.payment_status === "COMPLETED" 
                            ? "admin-status-confirmed" 
                            : payment.payment_status === "PENDING" 
                              ? "admin-status-pending" 
                              : "admin-status-cancelled"
                        }`}>
                          {payment.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-white/40">
                        {payment.transaction_id}
                      </td>
                      <td className="px-6 py-5 text-sm text-white/45">
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-sm text-white/30">
                      No payments match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export default Payments;
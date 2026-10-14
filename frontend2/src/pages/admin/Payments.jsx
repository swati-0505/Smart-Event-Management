import React, { useEffect, useState } from "react";
import { CreditCard, Search } from "lucide-react";
import { getAllPayments, updatePaymentStatus } from "../../services/paymentService";
import { getAllEvents } from "../../services/eventService";
import { getUsers } from "../../services/userService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadPayments = () => {
    setLoading(true);
    setError("");
    Promise.all([getAllPayments(), getAllEvents(), getUsers()])
      .then(([paymentsData, eventsData, usersData]) => {
        setPayments(Array.isArray(paymentsData) ? paymentsData : []);
        setEventsMap(Object.fromEntries((eventsData || []).map((event) => [event.event_id, event])));
        setUsersMap(Object.fromEntries((usersData || []).map((user) => [user.id, user])));
      })
      .catch((err) => setError(err.message || "Failed to load payment logs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      const updated = await updatePaymentStatus(paymentId, newStatus.toLowerCase());
      setPayments((prev) =>
        prev.map((p) =>
          p.payment_id === paymentId ? { ...p, ...updated } : p
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update payment status.");
    }
  };

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const user = usersMap[p.user_id];
    const event = eventsMap[p.event_id];
    return [p.payment_id, p.transaction_id, p.payment_status, user?.name, user?.email, event?.title]
      .some((value) => value?.toLowerCase().includes(q));
  });

  if (loading) {
    return <PageLoader message="Fetching transaction logs..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadPayments} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800 }}>Payment Transactions</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Inspect registration transactions, verification logs, and refund status.
        </p>
      </div>

      <div className="card" style={{ padding: "0.875rem 1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search transaction ID or status..."
            className="form-input"
            style={{ paddingLeft: "2.5rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={CreditCard} title="No payments recorded" description="No payment transactions found in system audit logs." />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Transaction ID</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>User / Event</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Created Date</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pId = p.payment_id;
                  const paymentStatus = (p.payment_status || "pending").toLowerCase();
                  const user = usersMap[p.user_id];
                  const event = eventsMap[p.event_id];
                  return (
                    <tr key={pId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem 1.25rem", fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {pId}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <div>{user?.name || p.user_id}</div>
                        <div>{event?.title || p.event_id}</div>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {new Intl.NumberFormat(undefined, { style: "currency", currency: p.currency || "INR" }).format(Number(p.amount || 0))}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <Badge variant={paymentStatus === "completed" ? "success" : paymentStatus === "pending" ? "warning" : "danger"}>
                          {paymentStatus.toUpperCase()}
                        </Badge>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                        {p.payment_date ? new Date(p.payment_date).toLocaleString() : "Recently"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <select
                          className="form-select"
                          style={{ width: "auto", display: "inline-block", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                          value={paymentStatus}
                          onChange={(e) => handleStatusChange(pId, e.target.value)}
                        >
                          <option value="completed">COMPLETED</option>
                          <option value="pending">PENDING</option>
                          <option value="failed">FAILED</option>
                          <option value="refunded">REFUNDED</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

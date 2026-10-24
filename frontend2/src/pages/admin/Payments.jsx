import React, { useEffect, useState } from "react";
import { CreditCard, Search, DollarSign } from "lucide-react";
import { getAllPayments, updatePaymentStatus } from "../../services/paymentService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadPayments = () => {
    setLoading(true);
    setError("");
    getAllPayments()
      .then((data) => setPayments(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to load payment logs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      const updated = await updatePaymentStatus(paymentId, newStatus);
      setPayments((prev) =>
        prev.map((p) =>
          (p.id || p.payment_id) === paymentId ? { ...p, status: newStatus } : p
        )
      );
    } catch (err) {
      alert(err.message || "Failed to update payment status.");
    }
  };

  const filtered = payments.filter((p) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const pId = p.id || p.payment_id || "";
    return pId.toLowerCase().includes(q) || (p.status && p.status.toLowerCase().includes(q));
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
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Registration ID</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Amount</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Created Date</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Update Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => {
                  const pId = p.id || p.payment_id;
                  return (
                    <tr key={pId} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem 1.25rem", fontFamily: "monospace", fontSize: "0.75rem" }}>
                        {pId}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {p.registration_id}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        ${p.amount || "0.00"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <Badge variant={p.status === "COMPLETED" ? "success" : p.status === "PENDING" ? "warning" : "danger"}>
                          {p.status || "COMPLETED"}
                        </Badge>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                        {p.created_at ? new Date(p.created_at).toLocaleString() : "Recently"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        <select
                          className="form-select"
                          style={{ width: "auto", display: "inline-block", padding: "0.25rem 0.5rem", fontSize: "0.8rem" }}
                          value={p.status || "COMPLETED"}
                          onChange={(e) => handleStatusChange(pId, e.target.value)}
                        >
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="PENDING">PENDING</option>
                          <option value="FAILED">FAILED</option>
                          <option value="REFUNDED">REFUNDED</option>
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

// Tickets.jsx
// Tickets management — connected to payments backend with fallback.

import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Ticket as TicketIcon,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import PageWrapper from "../components/common/PageWrapper";
import { getPayments } from "../services/paymentService";

const STATUS_VARIANT = {
  paid: "success",
  completed: "success",
  confirmed: "success",
  pending: "warning",
  failed: "danger",
  refunded: "neutral",
};

// Fallback sample data — shown when backend fails
const SAMPLE_PAYMENTS = [
  {
    id: "s1",
    user_id: "u_4521",
    amount: 499,
    method: "UPI",
    status: "paid",
    created_at: "2026-09-19",
  },
  {
    id: "s2",
    user_id: "u_7834",
    amount: 1299,
    method: "Card",
    status: "paid",
    created_at: "2026-09-19",
  },
  {
    id: "s3",
    user_id: "u_2210",
    amount: 499,
    method: "Net Banking",
    status: "pending",
    created_at: "2026-09-18",
  },
  {
    id: "s4",
    user_id: "u_9103",
    amount: 2499,
    method: "UPI",
    status: "paid",
    created_at: "2026-09-18",
  },
  {
    id: "s5",
    user_id: "u_5588",
    amount: 799,
    method: "Wallet",
    status: "refunded",
    created_at: "2026-09-17",
  },
];

function Tickets() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingSample, setUsingSample] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);

      const data = await getPayments();
      const list = Array.isArray(data) ? data : [data].filter(Boolean);

      if (list.length === 0) {
        // Backend returned empty → show sample
        setPayments(SAMPLE_PAYMENTS);
        setUsingSample(true);
      } else {
        setPayments(list);
        setUsingSample(false);
      }
    } catch (err) {
      console.warn("Backend failed, using sample data:", err);
      // Backend fail → use sample
      setPayments(SAMPLE_PAYMENTS);
      setUsingSample(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return payments.filter((p) => {
      const matchS =
        !s ||
        String(p.id).toLowerCase().includes(s) ||
        String(p.user_id || "").toLowerCase().includes(s);
      const matchF = filter === "All" || p.status === filter.toLowerCase();
      return matchS && matchF;
    });
  }, [payments, search, filter]);

  const stats = useMemo(() => {
    const total = payments.length;
    const paid = payments.filter(
      (p) =>
        p.status === "paid" ||
        p.status === "completed" ||
        p.status === "confirmed"
    ).length;
    const revenue = payments
      .filter(
        (p) =>
          p.status === "paid" ||
          p.status === "completed" ||
          p.status === "confirmed"
      )
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);
    return { total, paid, revenue };
  }, [payments]);

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* ================= HEADER ================= */}
        <div>
          <h1 className="text-2xl font-bold text-theme-primary">Tickets</h1>
          <p className="mt-1 text-sm text-theme-muted">
            Manage ticket sales and payments.
          </p>
        </div>

        {/* ================= STATS ================= */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <TicketIcon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-theme-primary">
                  {stats.total}
                </p>
                <p className="text-xs text-theme-muted">Total Tickets</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                <TicketIcon size={18} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-theme-primary">
                  {stats.paid}
                </p>
                <p className="text-xs text-theme-muted">Paid</p>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight text-theme-primary">
                  ₹{stats.revenue.toLocaleString("en-IN")}
                </p>
                <p className="text-xs text-theme-muted">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FILTERS ================= */}
        <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-theme bg-theme-tertiary px-3 py-2">
            <Search size={15} className="text-theme-muted" />
            <input
              id="tickets-search"
              name="tickets-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tickets..."
              className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-theme bg-theme-tertiary px-3 py-2 text-sm text-theme-primary outline-none"
          >
            <option>All</option>
            <option>Paid</option>
            <option>Pending</option>
            <option>Refunded</option>
            <option>Failed</option>
          </select>
        </div>

        {/* ================= LOADING ================= */}
        {loading && (
          <div className="card p-12 text-center text-sm text-theme-muted">
            Loading tickets...
          </div>
        )}

        {/* ================= ERROR ================= */}
        {error && (
          <div className="card flex flex-col items-center gap-3 p-12 text-center">
            <p className="text-sm text-red-500">{error}</p>
            <button type="button" onClick={load} className="btn-primary">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        )}

        {/* ================= EMPTY ================= */}
        {!loading && !error && filtered.length === 0 && (
          <div className="card flex flex-col items-center gap-3 p-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <TicketIcon size={24} />
            </div>
            <p className="text-sm font-semibold text-theme-primary">
              No tickets found
            </p>
            <p className="text-xs text-theme-muted">
              Try changing filters or search terms.
            </p>
          </div>
        )}

        {/* ================= TABLE ================= */}
        {!loading && !error && filtered.length > 0 && (
          <div className="card overflow-hidden">
            {/* Demo data notice — HIGH CONTRAST */}
            {usingSample && (
              <div className="border-b border-amber-300 bg-amber-100 px-5 py-2.5 text-[11px] font-bold text-amber-900 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300">
                Demo data shown — connect backend to see real payments.
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full min-w-175">
                <thead>
                  <tr className="border-b border-theme bg-theme-tertiary text-left">
                    {["Ticket ID", "User", "Amount", "Method", "Status"].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-5 py-3 text-[11px] font-semibold text-theme-muted"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-theme transition hover:bg-theme-hover last:border-b-0"
                    >
                      <td className="px-5 py-3 font-mono text-xs text-theme-muted">
                        #{String(p.id).slice(0, 8)}
                      </td>
                      <td className="px-5 py-3 text-sm text-theme-secondary">
                        {p.user_id ? String(p.user_id).slice(0, 10) : "—"}
                      </td>
                      <td className="px-5 py-3 text-sm font-semibold text-theme-primary">
                        ₹{parseFloat(p.amount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-sm text-theme-muted">
                        {p.method || "—"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`badge badge-${
                            STATUS_VARIANT[p.status] || "neutral"
                          }`}
                        >
                          {p.status || "unknown"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}

export default Tickets;
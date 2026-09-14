// Registrations.jsx
// Fully responsive registrations page.
// Desktop: table view | Mobile: card view

import { useState, useEffect, useMemo } from "react";
import { Search, CheckCircle2, XCircle, RefreshCw, User, Calendar } from "lucide-react";
import Badge from "../components/common/Badge";
import {
  getRegistrations,
  updateRegistrationStatus,
} from "../services/registrationService";

const STATUS_VARIANT = {
  Confirmed: "success",
  Pending: "warning",
  Cancelled: "danger",
};

function Registrations() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const data = await getRegistrations();
      setRows(data);
    } catch (err) {
      setError("Failed to load registrations.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      const matchS =
        !s ||
        r.user.toLowerCase().includes(s) ||
        r.event.toLowerCase().includes(s);
      const matchF = filter === "All" || r.status === filter;
      return matchS && matchF;
    });
  }, [rows, search, filter]);

  async function updateStatus(id, status) {
    try {
      await updateRegistrationStatus(id, status);
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }
  }

  /* ============ STATUS ACTIONS ============ */
  function StatusActions({ reg, compact = false }) {
    if (reg.status === "Pending") {
      return (
        <button
          type="button"
          onClick={() => updateStatus(reg.id, "Confirmed")}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 ${
            compact ? "" : "min-w-[90px] justify-center"
          }`}
        >
          <CheckCircle2 size={13} /> Confirm
        </button>
      );
    }
    if (reg.status === "Confirmed") {
      return (
        <button
          type="button"
          onClick={() => updateStatus(reg.id, "Cancelled")}
          className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg bg-red-50 px-3 text-xs font-semibold text-red-600 transition hover:bg-red-100 ${
            compact ? "" : "min-w-[90px] justify-center"
          }`}
        >
          <XCircle size={13} /> Cancel
        </button>
      );
    }
    return <span className="text-xs text-theme-dim">—</span>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* ============ HEADER ============ */}
      <div>
        <h1 className="text-2xl font-bold text-theme-primary sm:text-3xl">
          Registrations
        </h1>
        <p className="mt-1 text-xs text-theme-muted sm:text-sm">
          Manage all event registrations and their status.
        </p>
      </div>

      {/* ============ FILTERS ============ */}
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
        <div className="flex w-full items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 sm:max-w-sm">
          <Search size={15} className="text-theme-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user or event..."
            className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none sm:w-auto"
        >
          <option>All</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* ============ LOADING ============ */}
      {loading && (
        <div className="card p-12 text-center text-sm text-theme-muted">
          Loading registrations...
        </div>
      )}

      {/* ============ ERROR ============ */}
      {error && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={load} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {/* ============ EMPTY ============ */}
      {!loading && !error && filtered.length === 0 && (
        <div className="card p-12 text-center">
          <Calendar size={40} className="mx-auto text-theme-dim" />
          <p className="mt-3 text-sm text-theme-muted">No registrations found.</p>
        </div>
      )}

      {/* ============ DESKTOP: TABLE ============ */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <div className="card hidden overflow-hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-theme bg-theme-tertiary text-left">
                    {["User", "Event", "Date", "Status", "Action"].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-[11px] font-semibold uppercase tracking-wider text-theme-muted ${
                          i === 4 ? "text-right" : ""
                        }`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg) => (
                    <tr
                      key={reg.id}
                      className="border-b border-theme transition hover:bg-theme-hover last:border-b-0"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
                            {reg.user.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-theme-primary">
                              {reg.user}
                            </p>
                            <p className="text-xs text-theme-muted">{reg.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-theme-secondary">
                        {reg.event}
                      </td>
                      <td className="px-5 py-4 text-sm text-theme-muted">
                        {reg.date}
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={STATUS_VARIANT[reg.status] || "neutral"}>
                          {reg.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <StatusActions reg={reg} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ============ MOBILE: CARDS ============ */}
          <div className="space-y-3 md:hidden">
            {filtered.map((reg, idx) => (
              <div
                key={reg.id}
                className={`card animate-fade-in-up stagger-${(idx % 6) + 1} p-4`}
              >
                {/* User row */}
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white">
                    {reg.user.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-theme-primary">
                      {reg.user}
                    </p>
                    <p className="truncate text-xs text-theme-muted">{reg.email}</p>
                  </div>
                  <Badge variant={STATUS_VARIANT[reg.status] || "neutral"}>
                    {reg.status}
                  </Badge>
                </div>

                {/* Event + date */}
                <div className="mt-3 space-y-1.5 rounded-xl border border-theme bg-theme-tertiary p-3 text-xs">
                  <p className="flex items-center gap-2 text-theme-secondary">
                    <Calendar size={12} className="shrink-0 text-theme-muted" />
                    <span className="truncate font-medium">{reg.event}</span>
                  </p>
                  <p className="flex items-center gap-2 text-theme-muted">
                    <User size={12} className="shrink-0" />
                    <span>Registered: {reg.date}</span>
                  </p>
                </div>

                {/* Action */}
                <div className="mt-3 flex justify-end">
                  <StatusActions reg={reg} compact />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Registrations;
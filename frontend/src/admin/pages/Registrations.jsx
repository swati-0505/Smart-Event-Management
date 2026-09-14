// Registrations.jsx
// Registrations management — service-driven, backend-ready.

import { useState, useEffect, useMemo } from "react";
import { Search, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
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

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-theme-primary">Registrations</h1>
        <p className="mt-1 text-sm text-theme-muted">
          Manage all event registrations and their status.
        </p>
      </div>

      <div className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5">
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
          className="rounded-xl border border-theme bg-theme-tertiary px-3 py-2.5 text-sm text-theme-primary outline-none"
        >
          <option>All</option>
          <option>Confirmed</option>
          <option>Pending</option>
          <option>Cancelled</option>
        </select>
      </div>

      {loading && (
        <div className="card p-12 text-center text-sm text-theme-muted">
          Loading registrations...
        </div>
      )}

      {error && (
        <div className="card flex flex-col items-center gap-3 p-12 text-center">
          <p className="text-sm text-red-500">{error}</p>
          <button type="button" onClick={load} className="btn-primary">
            <RefreshCw size={14} /> Retry
          </button>
        </div>
      )}

      {!loading && !error && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-175">
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
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-12 text-center text-sm text-theme-muted">
                      No registrations found.
                    </td>
                  </tr>
                )}
                {filtered.map((reg) => (
                  <tr
                    key={reg.id}
                    className="border-b border-theme transition hover:bg-theme-hover last:border-b-0"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white">
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
                      {reg.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(reg.id, "Confirmed")}
                          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-semibold text-emerald-700 transition hover:bg-emerald-100"
                        >
                          <CheckCircle2 size={12} /> Confirm
                        </button>
                      )}
                      {reg.status === "Confirmed" && (
                        <button
                          type="button"
                          onClick={() => updateStatus(reg.id, "Cancelled")}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-100"
                        >
                          <XCircle size={12} /> Cancel
                        </button>
                      )}
                      {reg.status === "Cancelled" && (
                        <span className="text-xs text-theme-dim">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default Registrations;
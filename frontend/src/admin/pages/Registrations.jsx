// Registrations.jsx
// Attendees management — with bulk actions + CSV export + consolidated buttons.

import { useState, useMemo } from "react";
import {
  Search, CheckCircle2, XCircle, Users, Mail, Download,
  Square, CheckSquare, X,
} from "lucide-react";
import PageWrapper from "../components/common/PageWrapper";
import Badge from "../components/common/Badge";
import { useApiWithFallback } from "../hooks/useApiWithFallback";
import { exportToCsv } from "../utils/exportCsv";
import {
  getRegistrations,
  updateRegistrationStatus,
} from "../services/registrationService";
import { toast } from "sonner";

const STATUS_VARIANT = {
  confirmed: "success",
  pending: "warning",
  cancelled: "danger",
};

const CSV_COLUMNS = [
  { key: "user", label: "Name", transform: (r) => r.user || r.user_name || "" },
  { key: "email", label: "Email", transform: (r) => r.email || r.user_email || "" },
  { key: "event", label: "Event", transform: (r) => r.event || r.event_name || "" },
  { key: "date", label: "Date", transform: (r) => r.date || r.created_at || "" },
  { key: "status", label: "Status" },
];

const SAMPLE = [
  { id: "s1", user: "Rahul Sharma", email: "rahul@example.com", event: "Tech Summit 2026", date: "15 Aug 2026", status: "confirmed" },
  { id: "s2", user: "Ananya Verma", email: "ananya@example.com", event: "Design Workshop", date: "18 Aug 2026", status: "confirmed" },
  { id: "s3", user: "Arjun Mehta", email: "arjun@example.com", event: "Startup Meetup", date: "20 Aug 2026", status: "pending" },
  { id: "s4", user: "Priya Singh", email: "priya@example.com", event: "AI Conference", date: "22 Aug 2026", status: "pending" },
  { id: "s5", user: "Karan Patel", email: "karan@example.com", event: "Tech Summit 2026", date: "23 Aug 2026", status: "cancelled" },
  { id: "s6", user: "Sneha Reddy", email: "sneha@example.com", event: "Cultural Fest", date: "25 Aug 2026", status: "confirmed" },
];

function Registrations() {
  const { data: rows, setData: setRows, loading, usingFallback } =
    useApiWithFallback(getRegistrations, SAMPLE);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState(new Set());

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    return rows.filter((r) => {
      const name = (r.user || r.user_name || "").toLowerCase();
      const email = (r.email || r.user_email || "").toLowerCase();
      const event = (r.event || r.event_name || "").toLowerCase();
      const matchS =
        !s || name.includes(s) || email.includes(s) || event.includes(s);
      const matchF =
        filter === "All" || r.status?.toLowerCase() === filter.toLowerCase();
      return matchS && matchF;
    });
  }, [rows, search, filter]);

  const allSelected =
    filtered.length > 0 && filtered.every((r) => selected.has(r.id));
  const someSelected = selected.size > 0;

  function toggleOne(id) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((r) => r.id)));
    }
  }

  function clearSelection() {
    setSelected(new Set());
  }

  function handleExport() {
    try {
      exportToCsv(filtered, CSV_COLUMNS, "attendees");
      toast.success(`Exported ${filtered.length} attendees`);
    } catch (err) {
      toast.error(err.message || "Export failed");
    }
  }

  async function updateStatus(id, status) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    try {
      await updateRegistrationStatus(id, status);
    } catch {
      /* offline ok */
    }
  }

  async function bulkUpdate(status) {
    const ids = [...selected];
    if (ids.length === 0) return;

    setRows((prev) =>
      prev.map((r) => (selected.has(r.id) ? { ...r, status } : r))
    );

    await Promise.all(
      ids.map((id) => updateRegistrationStatus(id, status).catch(() => {}))
    );

    toast.success(
      `${ids.length} attendee${ids.length > 1 ? "s" : ""} updated to ${status}`
    );
    clearSelection();
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Attendees</h1>
            <p className="mt-1 text-sm text-theme-muted">
              Manage all event registrations and attendees.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              disabled={filtered.length === 0}
              className="btn-secondary disabled:opacity-50"
            >
              <Download size={16} />
              Export
            </button>
            {!loading && (
              <span className="badge badge-info shrink-0">
                {filtered.length} attendees
              </span>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-theme bg-theme-tertiary px-3 py-2">
            <Search size={15} className="text-theme-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or event..."
              className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-theme bg-theme-tertiary px-3 py-2 text-sm text-theme-primary outline-none"
          >
            {["All", "Confirmed", "Pending", "Cancelled"].map((o) => (
              <option key={o}>{o}</option>
            ))}
          </select>
        </div>

        {/* Bulk Action Bar */}
        {someSelected && (
          <div className="animate-fade-in flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-indigo-700">
                {selected.size} selected
              </span>
              <button
                type="button"
                onClick={clearSelection}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-100"
              >
                <X size={12} /> Clear
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => bulkUpdate("confirmed")}
                className="btn-success"
              >
                <CheckCircle2 size={12} /> Confirm Selected
              </button>
              <button
                type="button"
                onClick={() => bulkUpdate("cancelled")}
                className="btn-danger"
              >
                <XCircle size={12} /> Cancel Selected
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="card p-12 text-center text-sm text-theme-muted">
            Loading attendees...
          </div>
        ) : filtered.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state__icon">
                <Users size={24} />
              </div>
              <p className="empty-state__title">No attendees found</p>
              <p className="empty-state__desc">
                Try changing filters or search terms.
              </p>
            </div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            {usingFallback && (
              <div className="border-b border-amber-300 bg-amber-100 px-5 py-2.5 text-[11px] font-bold text-amber-900">
                Demo data — connect backend to see real attendees.
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-theme bg-theme-tertiary text-left">
                    <th className="w-12 px-4 py-3">
                      <button
                        type="button"
                        onClick={toggleAll}
                        className="flex h-5 w-5 items-center justify-center text-theme-muted transition hover:text-indigo-600"
                        aria-label="Select all"
                      >
                        {allSelected ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </th>
                    {["Attendee", "Event", "Date", "Status", "Action"].map(
                      (h, i) => (
                        <th
                          key={h}
                          className={`px-4 py-3 text-[11px] font-semibold text-theme-muted ${
                            i === 4 ? "text-right" : ""
                          }`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reg) => {
                    const name = reg.user || reg.user_name || "Unknown";
                    const email = reg.email || reg.user_email || "—";
                    const event = reg.event || reg.event_name || "—";
                    const date = reg.date || reg.created_at || "—";
                    const status = reg.status?.toLowerCase() || "pending";
                    const isSelected = selected.has(reg.id);

                    return (
                      <tr
                        key={reg.id}
                        className={`border-b border-theme transition last:border-b-0 ${
                          isSelected
                            ? "bg-indigo-50/50"
                            : "hover:bg-theme-hover"
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <button
                            type="button"
                            onClick={() => toggleOne(reg.id)}
                            className="flex h-5 w-5 items-center justify-center text-theme-muted transition hover:text-indigo-600"
                            aria-label={`Select ${name}`}
                          >
                            {isSelected ? (
                              <CheckSquare
                                size={16}
                                className="text-indigo-600"
                              />
                            ) : (
                              <Square size={16} />
                            )}
                          </button>
                        </td>

                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                              {name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-theme-primary">
                                {name}
                              </p>
                              <p className="flex items-center gap-1 truncate text-xs text-theme-muted">
                                <Mail size={10} />
                                {email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-sm text-theme-secondary">
                          {event}
                        </td>
                        <td className="px-4 py-3.5 text-sm text-theme-muted">
                          {date}
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant={STATUS_VARIANT[status] || "neutral"}>
                            {reg.status || "Pending"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {status === "pending" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(reg.id, "confirmed")}
                              className="btn-success btn-sm"
                            >
                              <CheckCircle2 size={12} /> Confirm
                            </button>
                          )}
                          {status === "confirmed" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(reg.id, "cancelled")}
                              className="btn-danger btn-sm"
                            >
                              <XCircle size={12} /> Cancel
                            </button>
                          )}
                          {status === "cancelled" && (
                            <span className="text-xs text-theme-dim">—</span>
                          )}
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
    </PageWrapper>
  );
}

export default Registrations;
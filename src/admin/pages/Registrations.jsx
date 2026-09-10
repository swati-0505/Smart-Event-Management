// Registrations.jsx
// This component displays the registrations management page.
// It handles search, status filtering, and registration status updates.

import { useState, useEffect, useMemo } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { getRegistrations, updateRegistrationStatus } from "../services/registrationService";

function Registrations() {
  // State for registrations list
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for search and filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Load registrations on component mount
  useEffect(() => {
    loadRegistrations();
  }, []);

  // Function to load registrations from service
  async function loadRegistrations() {
    try {
      setLoading(true);
      setError(null);

      // Call service to get registrations
      const data = await getRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError("Failed to load registrations. Please try again.");
      console.error("Error loading registrations:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter registrations based on search and status
  const filteredRegistrations = useMemo(() => {
    const search = searchQuery.trim().toLowerCase();

    return registrations.filter((reg) => {
      const matchesSearch =
        !search ||
        reg.user_name.toLowerCase().includes(search) ||
        reg.event_title.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "ALL" || reg.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [registrations, searchQuery, statusFilter]);

  // Handle registration status update
  async function handleStatusUpdate(registrationId, newStatus) {
    try {
      // Call service to update status
      const updated = await updateRegistrationStatus(registrationId, newStatus);
      
      // Update local state
      setRegistrations((prev) =>
        prev.map((reg) =>
          reg.registration_id === registrationId ? { ...reg, status: newStatus } : reg
        )
      );
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Failed to update registration status.");
    }
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Operations
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-theme-primary sm:text-[34px]">
              Registrations
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-theme-muted">
              Manage participant registrations and their status.
            </p>
          </div>
        </div>
      </header>

      {/* Search and filter bar */}
      <section className="admin-section overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-theme p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="flex w-full max-w-sm items-center gap-2 rounded-md border border-theme-accent/20 bg-theme-accent/5 px-3 py-2.5">
            <Search size={15} strokeWidth={1.7} className="shrink-0 text-theme-accent/75" />

            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by user or event..."
              className="min-w-0 flex-1 bg-transparent text-xs text-theme-secondary outline-none placeholder:text-theme-dim"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-md border border-theme bg-theme-tertiary px-3 py-2.5 text-xs text-theme-secondary outline-none transition focus:border-theme-accent/40 sm:w-auto"
          >
            <option value="ALL">All Status</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="px-6 py-12 text-center text-sm text-theme-muted">
            Loading registrations...
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="px-6 py-12 text-center text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Registrations table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-theme text-left">
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    User
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Event
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Registration Date
                  </th>
                  <th className="px-6 py-4 text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-[9px] font-semibold uppercase tracking-[0.14em] text-theme-dim">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRegistrations.length > 0 ? (
                  filteredRegistrations.map((reg) => (
                    <tr
                      key={reg.registration_id}
                      className="border-b border-theme transition hover:bg-theme-primary/5 last:border-b-0"
                    >
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-theme-primary">
                          {reg.user_name}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {reg.event_title}
                      </td>
                      <td className="px-6 py-5 text-sm text-theme-muted">
                        {new Date(reg.registration_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`admin-status ${
                          reg.status === "CONFIRMED" 
                            ? "admin-status-confirmed" 
                            : reg.status === "PENDING" 
                              ? "admin-status-pending" 
                              : "admin-status-cancelled"
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {reg.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(reg.registration_id, "CONFIRMED")}
                            className="inline-flex items-center gap-1 text-xs text-green-500/80 transition hover:text-green-500"
                          >
                            <CheckCircle2 size={14} />
                            Confirm
                          </button>
                        )}
                        {reg.status === "CONFIRMED" && (
                          <button
                            type="button"
                            onClick={() => handleStatusUpdate(reg.registration_id, "CANCELLED")}
                            className="inline-flex items-center gap-1 text-xs text-red-400/80 transition hover:text-red-400"
                          >
                            <XCircle size={14} />
                            Cancel
                          </button>
                        )}
                        {reg.status === "CANCELLED" && (
                          <span className="text-xs text-theme-dim">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-theme-muted">
                      No registrations match your search.
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

export default Registrations;
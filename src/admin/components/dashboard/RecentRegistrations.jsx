// RecentRegistrations.jsx
// This component displays recent registrations in the dashboard.

import { useState, useEffect } from "react";
import { getRegistrations } from "../../services/registrationService";

function RecentRegistrations() {
  // State for registrations
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load registrations on component mount
  useEffect(() => {
    loadRegistrations();
  }, []);

  // Function to load registrations from service
  async function loadRegistrations() {
    try {
      const data = await getRegistrations();
      setRegistrations(data.slice(0, 3)); // Show only 3 recent
    } catch (err) {
      console.error("Error loading registrations:", err);
    } finally {
      setLoading(false);
    }
  }

  // Helper to get status badge class
  function getStatusClass(status) {
    switch (status) {
      case "CONFIRMED":
        return "admin-status-confirmed";
      case "PENDING":
        return "admin-status-pending";
      case "CANCELLED":
        return "admin-status-cancelled";
      default:
        return "admin-status-pending";
    }
  }

  return (
    <section className="admin-section overflow-hidden">
      <div className="flex items-center justify-between border-b border-theme px-5 py-4">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
            Activity
          </p>
          <h2 className="mt-1 text-lg font-semibold text-theme-primary">
            Recent Registrations
          </h2>
        </div>

        <button
          type="button"
          className="text-xs text-theme-muted transition hover:text-theme-accent"
        >
          View all
        </button>
      </div>

      <div className="divide-y divide-theme">
        {loading && (
          <div className="px-5 py-8 text-center text-sm text-theme-muted">
            Loading registrations...
          </div>
        )}

        {!loading && registrations.length > 0 && (
          registrations.map((reg) => (
            <div key={reg.registration_id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-theme-accent/10 text-sm font-semibold text-theme-accent">
                {reg.user_name.charAt(0)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-theme-primary">
                  {reg.user_name}
                </p>
                <p className="mt-0.5 truncate text-xs text-theme-muted">
                  {reg.event_title}
                </p>
              </div>

              <div className="text-right">
                <span className={`admin-status ${getStatusClass(reg.status)}`}>
                  {reg.status}
                </span>
                <p className="mt-1 text-[10px] text-theme-dim">
                  {new Date(reg.registration_date).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}

        {!loading && registrations.length === 0 && (
          <div className="px-5 py-8 text-center text-sm text-theme-muted">
            No registrations found.
          </div>
        )}
      </div>
    </section>
  );
}

export default RecentRegistrations;
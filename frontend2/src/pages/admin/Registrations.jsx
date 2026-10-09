import React, { useEffect, useState } from "react";
import { Ticket, Search, User, Calendar } from "lucide-react";
import { getAllRegistrations, cancelRegistration } from "../../services/registrationService";
import { getAllEvents } from "../../services/eventService";
import { getUsers } from "../../services/userService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function AdminRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [eventsMap, setEventsMap] = useState();
  const [usersMap, setUsersMap] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([getAllRegistrations(), getAllEvents(), getUsers()])
      .then(([regsData, eventsData, usersData]) => {
        setRegistrations(Array.isArray(regsData) ? regsData : []);

        const eMap = {};
        if (Array.isArray(eventsData)) {
          eventsData.forEach((e) => (eMap[e.event_id] = e));
        }
        setEventsMap(eMap);

        const uMap = {};
        if (Array.isArray(usersData)) {
          usersData.forEach((u) => (uMap[u.id] = u));
        }
        setUsersMap(uMap);
      })
      .catch((err) => setError(err.message || "Failed to load registrations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const regId = cancelTarget.id || cancelTarget.registration_id;
      const updated = await cancelRegistration(regId);
      setRegistrations((prev) =>
        prev.map((r) =>
          (r.id || r.registration_id) === regId
            ? { ...r, status: "CANCELLED", cancelled_at: updated?.cancelled_at || new Date().toISOString() }
            : r
        )
      );
      setCancelTarget(null);
    } catch (err) {
      alert(err.message || "Failed to cancel registration.");
    } finally {
      setCancelling(false);
    }
  };

  const filtered = registrations.filter((reg) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    const event = eventsMap[reg.event_id];
    const user = usersMap[reg.user_id];
    return (
      (event?.title && event.title.toLowerCase().includes(q)) ||
      (user?.name && user.name.toLowerCase().includes(q)) ||
      (user?.email && user.email.toLowerCase().includes(q)) ||
      (reg.id && reg.id.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return <PageLoader message="Fetching system registration records..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800 }}>Manage Registrations</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Monitor active user passes, inspect registration timestamps, and perform admin cancellations.
        </p>
      </div>

      <div className="card" style={{ padding: "0.875rem 1.25rem" }}>
        <div style={{ position: "relative", maxWidth: "400px" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by user name, email, or event..."
            className="form-input"
            style={{ paddingLeft: "2.5rem" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No registrations found"
          description="There are no registration records matching your query."
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Registration ID</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>User / Email</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Event Title</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Registration Date</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700 }}>Status</th>
                  <th style={{ padding: "0.875rem 1.25rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((reg) => {
                  const regId = reg.id || reg.registration_id;
                  const event = eventsMap[reg.event_id];
                  const user = usersMap[reg.user_id];
                  const isCancelled = reg.status === "CANCELLED";

                  return (
                    <tr key={regId} style={{ borderBottom: "1px solid var(--border-color)", opacity: isCancelled ? 0.65 : 1 }}>
                      <td style={{ padding: "1rem 1.25rem", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {regId?.slice(0, 13)}...
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{user ? user.name : "Unknown User"}</span>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{user ? user.email : reg.user_id}</span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {event ? event.title : reg.event_id}
                      </td>
                      <td style={{ padding: "1rem 1.25rem", color: "var(--text-secondary)" }}>
                        {reg.registered_at ? new Date(reg.registered_at).toLocaleString() : "Recently"}
                      </td>
                      <td style={{ padding: "1rem 1.25rem" }}>
                        <Badge variant={isCancelled ? "danger" : "success"}>
                          {reg.status || "CONFIRMED"}
                        </Badge>
                      </td>
                      <td style={{ padding: "1rem 1.25rem", textAlign: "right" }}>
                        {!isCancelled && (
                          <button
                            onClick={() => setCancelTarget(reg)}
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--color-danger)" }}
                          >
                            Cancel Pass
                          </button>
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

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancelConfirm}
        title="Revoke Registration"
        message="Are you sure you want to cancel this user's registration pass?"
        confirmLabel="Yes, Revoke Pass"
        confirmVariant="danger"
        loading={cancelling}
      />
    </div>
  );
}

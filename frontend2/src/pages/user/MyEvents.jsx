import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar, MapPin, XCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { getUserRegistrations, cancelRegistration } from "../../services/registrationService";
import { getEventById } from "../../services/eventService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function MyEvents() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [eventsMap, setEventsMap] = useState();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError("");

    getUserRegistrations(user.id)
      .then(async (regs) => {
        const activeList = Array.isArray(regs)
          ? regs.filter((r) => r.status?.toLowerCase() !== "cancelled")
          : [];
        setRegistrations(activeList);

        const eventIds = [...new Set(activeList.map((r) => r.event_id))];
        const map = {};
        await Promise.all(
          eventIds.map(async (id) => {
            try {
              map[id] = await getEventById(id);
            } catch (e) {
              console.warn("Could not load event detail for ID", id);
            }
          })
        );
        setEventsMap(map);
      })
      .catch((err) => setError(err.message || "Failed to load registrations."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
    const handleRegistrationChange = () => {
      if (user?.id) {
        loadData();
      }
    };
    window.addEventListener("registration-changed", handleRegistrationChange);
    return () => {
      window.removeEventListener("registration-changed", handleRegistrationChange);
    };
  }, [user]);

  async function handleConfirmCancel() {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      const regId = cancelTarget.id || cancelTarget.registration_id;
      await cancelRegistration(regId);
      setRegistrations((prev) =>
        prev.filter((r) => (r.id || r.registration_id) !== regId)
      );
      setCancelTarget(null);
      window.dispatchEvent(new CustomEvent("registration-changed"));
    } catch (err) {
      alert(err.message || "Failed to cancel registration.");
    } finally {
      setCancelling(false);
    }
  }

  if (loading) {
    return <PageLoader message="Loading your event passes..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800, marginBottom: "0.25rem" }}>
          My Registrations
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Manage your event passes and cancel bookings if your plans change.
        </p>
      </div>

      {registrations.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="No registrations found"
          description="You haven't registered for any events yet. Explore upcoming tech events now."
          action={
            <Link to="/events" className="btn btn-primary btn-sm">
              Explore Events
            </Link>
          }
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {registrations.map((reg) => {
            const regId = reg.id || reg.registration_id;
            const event = eventsMap[reg.event_id];
            const isCancelled = reg.status === "CANCELLED";
            const dateObj = event?.event_date ? new Date(event.event_date) : null;

            return (
              <div
                key={regId}
                className="card"
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "1.5rem",
                  opacity: isCancelled ? 0.7 : 1,
                }}
              >
                <div style={{ display: "flex", gap: "1.25rem", alignItems: "flex-start", flex: "1 1 300px" }}>
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "12px",
                      background: isCancelled ? "var(--bg-tertiary)" : "var(--color-primary-light)",
                      color: isCancelled ? "var(--text-muted)" : "var(--color-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Ticket size={24} />
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {event ? event.title : `Event (${reg.event_id.slice(0, 8)}...)`}
                      </h3>
                      <Badge variant={isCancelled ? "danger" : "success"}>
                        {reg.status || "CONFIRMED"}
                      </Badge>
                    </div>

                    {event && (
                      <div style={{ display: "flex", gap: "1rem", fontSize: "0.825rem", color: "var(--text-secondary)", flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <Calendar size={14} />
                          {dateObj ? dateObj.toLocaleDateString() : "TBA"}
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                          <MapPin size={14} />
                          {event.venue_name || "Venue TBA"}
                        </span>
                      </div>
                    )}

                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                      Registration Reference: {regId}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {event && (
                    <Link to={`/events/${event.event_id}`} className="btn btn-secondary btn-sm">
                      View Event
                    </Link>
                  )}
                  {!isCancelled && (
                    <button
                      onClick={() => setCancelTarget(reg)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "var(--color-danger)" }}
                    >
                      <XCircle size={16} /> Cancel Pass
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(cancelTarget)}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleConfirmCancel}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel your pass for "${
          eventsMap[cancelTarget?.event_id]?.title || "this event"
        }"?`}
        confirmLabel="Yes, Cancel Pass"
        confirmVariant="danger"
        loading={cancelling}
      />
    </div>
  );
}

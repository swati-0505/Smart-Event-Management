import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Ticket, Calendar, MapPin, XCircle, MessageSquare } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { getUserRegistrations, cancelRegistration } from "../../services/registrationService";
import { getEventById } from "../../services/eventService";
import { createFeedback, getMyFeedback } from "../../services/feedbackService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import Badge from "../../components/common/Badge";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import Modal from "../../components/common/Modal";

export default function MyEvents() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [feedbackMap, setFeedbackMap] = useState({});
  const [currentTime] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const loadData = () => {
    setLoading(true);
    setError("");

    Promise.all([getUserRegistrations(user.id), getMyFeedback()])
      .then(async ([regs, feedback]) => {
        const activeList = Array.isArray(regs)
          ? regs.filter((r) => r.status?.toLowerCase() !== "cancelled")
          : [];
        setRegistrations(activeList);
        setFeedbackMap(Object.fromEntries(
          (Array.isArray(feedback) ? feedback : []).map((item) => [item.event_id, item])
        ));

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

  async function handleSubmitFeedback(event) {
    event.preventDefault();
    if (!feedbackTarget) return;

    setSubmittingFeedback(true);
    setFeedbackError("");
    try {
      const submitted = await createFeedback({
        event_id: feedbackTarget.event_id,
        rating,
        comment: comment.trim() || null,
      });
      setFeedbackMap((previous) => ({ ...previous, [feedbackTarget.event_id]: submitted }));
      setFeedbackTarget(null);
      setComment("");
      setRating(5);
    } catch (err) {
      setFeedbackError(err.message || "Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
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
            const eventEndDate = event?.end_time || event?.event_date;
            const isCompleted = eventEndDate && new Date(eventEndDate).getTime() <= currentTime;
            const hasFeedback = Boolean(feedbackMap[reg.event_id]);

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
                  {isCompleted && !hasFeedback && (
                    <button
                      onClick={() => {
                        setFeedbackTarget(event);
                        setFeedbackError("");
                      }}
                      className="btn btn-primary btn-sm"
                    >
                      <MessageSquare size={16} /> Leave feedback
                    </button>
                  )}
                  {isCompleted && hasFeedback && (
                    <span style={{ color: "var(--color-success)", fontSize: "0.85rem", fontWeight: 600 }}>
                      Feedback submitted
                    </span>
                  )}
                  {event && !isCompleted && !hasFeedback && (
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem", display: "inline-flex", alignItems: "center", gap: "0.35rem" }}>
                      <MessageSquare size={14} /> Feedback opens after the event ends
                    </span>
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
      <Modal
        isOpen={Boolean(feedbackTarget)}
        onClose={() => {
          if (!submittingFeedback) setFeedbackTarget(null);
        }}
        title={`Feedback${feedbackTarget ? ` for ${feedbackTarget.title}` : ""}`}
      >
        <form onSubmit={handleSubmitFeedback} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontWeight: 600 }}>
            Your rating (1.0-5.0)
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              required
              value={rating}
              onChange={(event) => setRating(event.target.value === "" ? "" : Number(event.target.value))}
              className="form-input"
            />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontWeight: 600 }}>
            Comment (optional)
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Tell us what you thought about the event..."
              className="form-textarea"
              style={{ resize: "vertical", fontWeight: 400 }}
            />
          </label>
          {feedbackError && (
            <p role="alert" style={{ color: "var(--color-danger)", margin: 0 }}>{feedbackError}</p>
          )}
          <button type="submit" className="btn btn-primary" disabled={submittingFeedback}>
            {submittingFeedback ? "Submitting..." : "Submit feedback"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

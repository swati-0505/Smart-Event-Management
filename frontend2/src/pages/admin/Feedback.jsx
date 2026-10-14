import React, { useEffect, useState } from "react";
import { MessageSquare, Star, Trash2 } from "lucide-react";
import { getAllFeedback, deleteFeedback } from "../../services/feedbackService";
import { getAllEvents } from "../../services/eventService";
import { getUsers } from "../../services/userService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import ConfirmDialog from "../../components/common/ConfirmDialog";

export default function AdminFeedback() {
  const [feedback, setFeedback] = useState([]);
  const [eventsMap, setEventsMap] = useState({});
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadFeedback = () => {
    setLoading(true);
    setError("");
    Promise.all([getAllFeedback(), getAllEvents(), getUsers()])
      .then(([feedbackData, eventsData, usersData]) => {
        setFeedback(Array.isArray(feedbackData) ? feedbackData : []);
        setEventsMap(Object.fromEntries((eventsData || []).map((event) => [event.event_id, event])));
        setUsersMap(Object.fromEntries((usersData || []).map((user) => [user.id, user])));
      })
      .catch((err) => setError(err.message || "Failed to load feedback entries."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await deleteFeedback(deleteTarget.id || deleteTarget.feedback_id);
      setFeedback((prev) =>
        prev.filter((f) => (f.id || f.feedback_id) !== (deleteTarget.id || deleteTarget.feedback_id))
      );
      setDeleteTarget(null);
    } catch (err) {
      alert(err.message || "Failed to delete feedback.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoader message="Loading attendee feedback..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadFeedback} />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div>
        <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800 }}>Event Feedback & Ratings</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Review comments and star ratings submitted by event participants.
        </p>
      </div>

      {feedback.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No feedback entries" description="No attendee ratings have been submitted yet." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.25rem" }}>
          {feedback.map((item) => {
            const fId = item.feedback_id || item.id;
            const event = eventsMap[item.event_id];
            const user = usersMap[item.user_id];
            return (
              <div key={fId} className="card" style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#f59e0b" }}>
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        fill={i < (item.rating || 5) ? "#f59e0b" : "none"}
                        style={{ opacity: i < (item.rating || 5) ? 1 : 0.3 }}
                      />
                    ))}
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, marginLeft: "0.35rem", color: "var(--text-primary)" }}>
                      {item.rating || 5}.0
                    </span>
                  </div>

                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="btn btn-ghost btn-icon"
                    style={{ color: "var(--color-danger)" }}
                    title="Delete Feedback"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.6, flex: 1 }}>
                  "{item.comments || item.comment || "No written comments."}"
                </p>

                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                  {event?.title || `Event ${item.event_id}`} · {user?.name || `User ${item.user_id}`}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-color)", paddingTop: "0.75rem" }}>
                  Submitted on {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently"}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Feedback"
        message="Are you sure you want to delete this feedback item?"
        confirmLabel="Yes, Delete"
        confirmVariant="danger"
        loading={submitting}
      />
    </div>
  );
}

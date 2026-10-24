import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MessageSquare, Star } from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { getCompletedEvents } from "../../services/eventService";
import { createFeedback, getPublicCompletedFeedback, getUserFeedback } from "../../services/feedbackService";
import EventCard from "../../components/event/EventCard";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";

export default function CompletedEvents() {
  const { isAuthenticated, isParticipant, loading: authLoading, user } = useAuth();
  const [events, setEvents] = useState([]);
  const [feedbackByEvent, setFeedbackByEvent] = useState({});
  const [userFeedbackByEvent, setUserFeedbackByEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCompletedEvents = useCallback((showLoading = true) => {
    if (showLoading) {
      setLoading(true);
      setError("");
    }
    Promise.all([getCompletedEvents(), getPublicCompletedFeedback()])
      .then(([eventData, feedbackData]) => {
        setEvents(Array.isArray(eventData) ? eventData : []);
        const groupedFeedback = {};
        if (Array.isArray(feedbackData)) {
          feedbackData.forEach((item) => {
            if (!groupedFeedback[item.event_id]) groupedFeedback[item.event_id] = [];
            groupedFeedback[item.event_id].push(item);
          });
        }
        setFeedbackByEvent(groupedFeedback);
      })
      .catch((err) => setError(err.message || "Failed to load completed events."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadCompletedEvents(false);
  }, [loadCompletedEvents]);

  useEffect(() => {
    if (authLoading || !isParticipant || !user?.id) return;

    let isCurrent = true;
    getUserFeedback(user.id)
      .then((feedbackEntries) => {
        if (!isCurrent) return;
        setUserFeedbackByEvent({
          userId: user.id,
          feedbackByEvent: Object.fromEntries(
            (Array.isArray(feedbackEntries) ? feedbackEntries : []).map((item) => [item.event_id, item])
          ),
        });
      })
      .catch((err) => {
        if (isCurrent) {
          setUserFeedbackByEvent({
            userId: user.id,
            feedbackByEvent: {},
            error: err.message || "Could not check your event attendance and feedback.",
          });
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [authLoading, isParticipant, user?.id]);

  const currentUserFeedback = userFeedbackByEvent?.userId === user?.id ? userFeedbackByEvent : null;

  const handleFeedbackSubmitted = (eventId, savedFeedback) => {
    const publicFeedback = {
      event_id: eventId,
      rating: savedFeedback.rating,
      comment: savedFeedback.comment,
      created_at: savedFeedback.created_at,
    };
    setUserFeedbackByEvent((previous) => previous?.userId === user?.id
      ? { ...previous, feedbackByEvent: { ...previous.feedbackByEvent, [eventId]: savedFeedback } }
      : previous);
    setFeedbackByEvent((previous) => ({
      ...previous,
      [eventId]: [publicFeedback, ...(previous[eventId] || [])],
    }));
  };

  if (loading) return <PageLoader message="Loading completed events..." />;
  if (error) return <ErrorState message={error} onRetry={loadCompletedEvents} />;

  return (
    <div style={{ padding: "3rem 0 5rem" }}>
      <div className="container">
        <Link to="/events" className="btn btn-ghost btn-sm" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
          <ArrowLeft size={16} /> Back to Events
        </Link>
        <div style={{ marginBottom: "2rem" }}>
          <h1 style={{ fontSize: "var(--font-4xl)", fontWeight: 900, marginBottom: "0.5rem" }}>
            Completed Events
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "var(--font-lg)" }}>
            Browse past events and see feedback shared by users.
          </p>
        </div>
        {currentUserFeedback?.error && isParticipant && (
          <div role="alert" className="card" style={{ padding: "1rem", marginBottom: "1.5rem", color: "var(--color-danger)" }}>
            {currentUserFeedback.error}
          </div>
        )}

        {events.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="No completed events yet"
            description="Completed published events will appear here."
          />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem" }}>
            {events.map((event) => {
              const feedback = feedbackByEvent[event.event_id] || [];
              const averageRating = feedback.length
                ? (feedback.reduce((total, item) => total + item.rating, 0) / feedback.length).toFixed(1)
                : null;
              return (
                <section key={event.event_id} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                  <EventCard event={event} />
                  <div className="card" style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                      <h2 style={{ fontSize: "1rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <MessageSquare size={17} /> Event Feedback
                      </h2>
                      {averageRating && (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", color: "#f59e0b", fontWeight: 700 }}>
                          <Star size={15} fill="#f59e0b" /> {averageRating} ({feedback.length})
                        </span>
                      )}
                    </div>
                    {feedback.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No feedback has been submitted yet.</p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                        {feedback.map((item, index) => (
                          <article
                            key={`${item.event_id}-${item.created_at || index}-${index}`}
                            style={{ borderTop: index ? "1px solid var(--border-color)" : "none", paddingTop: index ? "0.75rem" : 0 }}
                          >
                            <div aria-label={`${item.rating} out of 5 stars`} style={{ display: "flex", gap: "0.15rem", color: "#f59e0b", marginBottom: "0.35rem" }}>
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star key={star} size={14} fill={star <= item.rating ? "#f59e0b" : "none"} />
                              ))}
                              <span style={{ marginLeft: "0.25rem", color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                {item.rating}/5
                              </span>
                            </div>
                            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", whiteSpace: "pre-line" }}>
                              {item.comment || "No written comment."}
                            </p>
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                  {!authLoading && (isParticipant || !isAuthenticated) && (
                    <EventFeedback
                      event={event}
                      isAuthenticated={isAuthenticated}
                      isLoadingFeedback={isAuthenticated && !currentUserFeedback}
                      existingFeedback={currentUserFeedback?.feedbackByEvent[event.event_id]}
                      onSubmitted={handleFeedbackSubmitted}
                    />
                  )}
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function EventFeedback({
  event,
  isAuthenticated,
  isLoadingFeedback,
  existingFeedback,
  onSubmitted,
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const { user } = useAuth();

  if (isLoadingFeedback) {
    return <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Loading your feedback...</p>;
  }

  if (!isAuthenticated) {
    return (
      <div className="card" style={{ padding: "1rem" }}>
        <Link to="/login" state={{ from: "/completed-events" }} className="btn btn-secondary btn-sm">
          Sign in to leave feedback
        </Link>
      </div>
    );
  }

  if (existingFeedback) {
    return (
      <div className="card" style={{ padding: "1rem" }}>
        <p style={{ color: "var(--color-success, #16a34a)", fontWeight: 600 }}>
          You have already submitted feedback for this event.
        </p>
      </div>
    );
  }

  async function handleSubmit(eventSubmission) {
    eventSubmission.preventDefault();
    if (!user?.id) return;

    setSubmitting(true);
    setError("");
    try {
      const savedFeedback = await createFeedback({
        user_id: user.id,
        event_id: event.event_id,
        rating,
        comment: comment.trim() || null,
      });
      onSubmitted(event.event_id, savedFeedback);
    } catch (submissionError) {
      setError(submissionError.message || "Failed to submit feedback.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="card" style={{ padding: "1rem" }}>
      {!formOpen ? (
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => setFormOpen(true)}>
          <MessageSquare size={15} /> Give Feedback
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Share your feedback</h3>
          <div role="group" aria-label="Rating from 1 to 5 stars" style={{ display: "flex", gap: "0.35rem" }}>
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`${value} star${value === 1 ? "" : "s"}`}
                aria-pressed={rating === value}
                onClick={() => setRating(value)}
                className="btn btn-ghost btn-icon"
                style={{ color: "#f59e0b" }}
              >
                <Star size={22} fill={value <= rating ? "#f59e0b" : "none"} />
              </button>
            ))}
          </div>
          <label className="form-label" htmlFor={`feedback-comment-${event.event_id}`}>Comment (optional)</label>
          <textarea
            id={`feedback-comment-${event.event_id}`}
            className="form-textarea"
            rows={3}
            maxLength={2000}
            value={comment}
            onChange={(changeEvent) => setComment(changeEvent.target.value)}
            placeholder="What did you think about this event?"
          />
          {error && (
            <div role="alert" style={{ padding: "0.75rem", background: "#fee2e2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </form>
      )}
    </div>
  );
}

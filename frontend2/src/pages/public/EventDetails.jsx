import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, AlertCircle, Shield, XCircle, Star } from "lucide-react";
import { getEventById } from "../../services/eventService";
import { getVenueById } from "../../services/venueService";
import { createRegistration, getUserRegistrations, cancelRegistration } from "../../services/registrationService";
import { createFeedback, getUserFeedback } from "../../services/feedbackService";
import { useAuth } from "../../auth/AuthProvider";
import { getEventImageUrl } from "../../utils/eventImage";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import Badge from "../../components/common/Badge";
import PaymentModal from "../../components/payment/PaymentModal";


export default function EventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, isParticipant, user } = useAuth();
  const autoRegisteredRef = useRef(false);

  const [event, setEvent] = useState(null);
  const [venue, setVenue] = useState(null);
  const [userRegistration, setUserRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [registering, setRegistering] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [userFeedback, setUserFeedback] = useState(null);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);

  const loadEventAndRegistrationData = async () => {
    try {
      const data = await getEventById(eventId);
      setEvent(data);
      setVenue(null);
      setUserFeedback(null);
      setFeedbackError("");

      if (data.venue_id) {
        try {
          const vData = await getVenueById(data.venue_id);
          setVenue(vData);
        } catch (vErr) {
          console.warn("Failed to fetch venue detail:", vErr);
        }
      }

      if (isAuthenticated && user?.id && !isAdmin) {
        try {
          const userRegs = await getUserRegistrations(user.id);
          const activeReg = Array.isArray(userRegs)
            ? userRegs.find(
                (r) => r.event_id === eventId && r.status?.toLowerCase() !== "cancelled"
              )
            : null;

          if (activeReg) {
            setAlreadyRegistered(true);
            setUserRegistration(activeReg);
          } else {
            setAlreadyRegistered(false);
            setUserRegistration(null);

            
            if (location.state?.autoRegister && !isAdmin && !autoRegisteredRef.current) {
              autoRegisteredRef.current = true;
              setTimeout(() => {
                if (Number(data?.ticket_price || 0) > 0) {
                  setShowPaymentModal(true);
                } else {
                  handleRegisterDirect(user.id, eventId);
                }
              }, 100);
            }
          }
        } catch (rErr) {
          console.warn("Could not check user registration status", rErr);
        }
        if (data.is_completed && isParticipant) {
          try {
            const feedbackEntries = await getUserFeedback(user.id);
            setUserFeedback(
              Array.isArray(feedbackEntries)
                ? feedbackEntries.find((item) => item.event_id === eventId) || null
                : null
            );
          } catch (feedbackLoadError) {
            setFeedbackError(feedbackLoadError.message || "Failed to load your feedback.");
          }
        }
      } else {
        setAlreadyRegistered(false);
        setUserRegistration(null);
      }
    } catch (err) {
      setError(err.message || "Failed to load event details.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterDirect = async (userId, evId) => {
    setRegistering(true);
    setRegisterError("");
    try {
      const reg = await createRegistration(userId, evId);
      setRegisterSuccess(true);
      setAlreadyRegistered(true);
      setUserRegistration(reg);
      setEvent((prev) => prev ? ({ ...prev, available_seats: Math.max(0, (prev.available_seats || 1) - 1) }) : prev);
      window.dispatchEvent(new CustomEvent("registration-changed"));
    } catch (err) {
      setRegisterError(err.message || "Failed to complete registration.");
    } finally {
      setRegistering(false);
    }
  };

  async function handleRegister() {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/events/${eventId}`, autoRegister: true } });
      return;
    }

    const price = Number(event?.ticket_price || 0);
    if (price > 0) {
      setShowPaymentModal(true);
    } else {
      await handleRegisterDirect(user.id, eventId);
    }
  }


  useEffect(() => {
    setLoading(true);
    setError("");
    autoRegisteredRef.current = false;
    loadEventAndRegistrationData();

    const handleRegistrationChange = () => {
      loadEventAndRegistrationData();
    };
    window.addEventListener("registration-changed", handleRegistrationChange);
    return () => {
      window.removeEventListener("registration-changed", handleRegistrationChange);
    };
  }, [eventId, isAuthenticated, user]);

  async function handleCancelRegistration() {
    if (!userRegistration) return;
    setCancelling(true);
    setRegisterError("");
    try {
      const regId = userRegistration.id || userRegistration.registration_id;
      await cancelRegistration(regId);
      setAlreadyRegistered(false);
      setUserRegistration(null);
      setRegisterSuccess(false);
      if (event && event.available_seats !== undefined) {
        setEvent((prev) => ({ ...prev, available_seats: prev.available_seats + 1 }));
      }
      window.dispatchEvent(new CustomEvent("registration-changed"));
    } catch (err) {
      setRegisterError(err.message || "Failed to cancel registration.");
    } finally {
      setCancelling(false);
    }
  }

  async function handleFeedbackSubmit(e) {
    e.preventDefault();
    if (!user?.id || !event?.event_id) return;
    setFeedbackSubmitting(true);
    setFeedbackError("");
    try {
      const savedFeedback = await createFeedback({
        user_id: user.id,
        event_id: event.event_id,
        rating: feedbackRating,
        comment: feedbackComment.trim() || null,
      });
      setUserFeedback(savedFeedback);
    } catch (err) {
      setFeedbackError(err.message || "Failed to submit feedback.");
    } finally {
      setFeedbackSubmitting(false);
    }
  }

  if (loading) {
    return <PageLoader message="Loading event information..." />;
  }

  if (error || !event) {
    return (
      <div className="container" style={{ padding: "4rem 0" }}>
        <ErrorState message={error || "Event not found."} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  const imageUrl = getEventImageUrl(event);
  const dateObj = event.event_date ? new Date(event.event_date) : null;
  const isCompleted = Boolean(event.is_completed);
  const isExpired = dateObj && dateObj < new Date();
  const isSoldOut = event.available_seats !== undefined && event.available_seats <= 0;

  return (
    <div style={{ padding: "3rem 0 5rem" }}>
      <div className="container">
        <Link to="/events" className="btn btn-ghost btn-sm" style={{ marginBottom: "1.5rem", display: "inline-flex" }}>
          <ArrowLeft size={16} /> Back to Events
        </Link>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2.5rem" }} className="event-details-grid">
          
          <div>
            <div style={{ position: "relative", borderRadius: "var(--radius-2xl)", overflow: "hidden", height: "350px", marginBottom: "2rem" }}>
              <img src={imageUrl} alt={event.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", top: "20px", left: "20px" }}>
                <Badge variant="primary">{event.category || "General"}</Badge>
                {isCompleted && (
                  <Badge variant="neutral" className="event-completed-badge">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                      <CheckCircle2 size={13} /> Completed
                    </span>
                  </Badge>
                )}
              </div>
            </div>

            <h1 style={{ fontSize: "var(--font-4xl)", fontWeight: 900, marginBottom: "1rem" }}>
              {event.title}
            </h1>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", color: "var(--text-secondary)", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Calendar size={18} style={{ color: "var(--color-primary)" }} />
                <span>
                  {dateObj
                    ? dateObj.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                    : "Date TBA"}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <MapPin size={18} style={{ color: "var(--color-primary)" }} />
                <span>{venue ? `${venue.name}, ${venue.city}` : event.address || "Venue TBA"}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Users size={18} style={{ color: "var(--color-primary)" }} />
                <span>{event.available_seats} / {event.capacity} seats available</span>
              </div>
            </div>

            <div className="card" style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>About this event</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, whiteSpace: "pre-line" }}>
                {event.description || "No description provided."}
              </p>
            </div>

            {(venue || event.address) && (
              <div className="card">
                <h3 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                  {venue ? "Venue Information" : "Event Address"}
                </h3>
                {venue ? (
                  <>
                    <p style={{ fontWeight: 600, color: "var(--text-primary)" }}>{venue.name}</p>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{venue.address}, {venue.city}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "0.5rem" }}>
                      Venue Capacity: {venue.capacity} attendees
                    </p>
                  </>
                ) : (
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{event.address}</p>
                )}
              </div>
            )}
          </div>

          
          <div>
            <div
              className="card"
              style={{
                position: "sticky",
                top: "calc(var(--navbar-height) + 2rem)",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
              }}
            >
              <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>Registration</h3>

              {isAdmin ? (
                <div style={{ padding: "1rem", background: "var(--bg-tertiary)", color: "var(--text-secondary)", borderRadius: "var(--radius-lg)" }}>
                  Administrators manage this event and cannot register as participants.
                </div>
              ) : registerSuccess ? (
                <div style={{ padding: "1.25rem", background: "#dcfce7", color: "#166534", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700 }}>
                    <CheckCircle2 size={20} /> Registration Confirmed!
                  </div>
                  <p style={{ fontSize: "0.875rem" }}>
                    You have successfully registered for this event. View it in your dashboard.
                  </p>
                  <Link to="/my-events" className="btn btn-primary btn-sm" style={{ marginTop: "0.5rem" }}>
                    Go to My Registrations
                  </Link>
                </div>
              ) : alreadyRegistered ? (
                <div style={{ padding: "1.25rem", background: "var(--color-primary-light)", color: "var(--color-primary-dark)", borderRadius: "var(--radius-lg)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
                    <CheckCircle2 size={18} /> You are registered for this event
                  </div>
                  <button
                    onClick={handleCancelRegistration}
                    disabled={cancelling}
                    className="btn btn-outline btn-sm"
                    style={{ color: "var(--color-danger)", borderColor: "var(--color-danger)", width: "100%" }}
                  >
                    <XCircle size={16} /> {cancelling ? "Cancelling..." : "Cancel Pass"}
                  </button>
                </div>
              ) : isExpired ? (
                <div style={{ padding: "1rem", background: "var(--bg-tertiary)", color: "var(--text-muted)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
                  <AlertCircle size={18} /> Registration has ended for this past event.
                </div>
              ) : isSoldOut ? (
                <div style={{ padding: "1rem", background: "#fee2e2", color: "var(--color-danger)", borderRadius: "var(--radius-lg)", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>
                  <AlertCircle size={18} /> Sold Out (No available seats)
                </div>
              ) : (
                <>
                  {registerError && (
                    <div style={{ padding: "0.75rem", background: "#fee2e2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                      {registerError}
                    </div>
                  )}
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-color)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Ticket Price</span>
                    <strong style={{ fontSize: "1.15rem", color: Number(event.ticket_price || 0) > 0 ? "var(--color-primary)" : "#16a34a" }}>
                      {Number(event.ticket_price || 0) > 0 ? `₹${Number(event.ticket_price).toFixed(2)}` : "FREE"}
                    </strong>
                  </div>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: 0 }}>
                    {Number(event.ticket_price || 0) > 0
                      ? "Paid event — secure checkout with UPI, Credit/Debit Card or Net Banking."
                      : "Free event — instant seat confirmation."}
                  </p>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="btn btn-primary btn-lg"
                    style={{ width: "100%" }}
                  >
                    {registering
                      ? "Processing..."
                      : !isAuthenticated
                      ? "Sign In to Register"
                      : Number(event.ticket_price || 0) > 0
                      ? `Proceed to Payment (₹${Number(event.ticket_price).toFixed(0)})`
                      : "Register Event (Free)"}
                  </button>
                </>
              )}

              <div style={{ paddingTop: "1rem", borderTop: "1px solid var(--border-color)", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Shield size={14} /> Instant verification via SmartEvent Security
              </div>
            </div>

            {isCompleted && isAuthenticated && isParticipant && (
              <div className="card" style={{ marginTop: "1.25rem" }}>
                <h3 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: "0.75rem" }}>
                  Share your feedback
                </h3>
                {userFeedback ? (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#f59e0b", marginBottom: "0.5rem" }}>
                      {[...Array(5)].map((_, index) => (
                        <Star key={index} size={17} fill={index < userFeedback.rating ? "#f59e0b" : "none"} />
                      ))}
                      <span style={{ marginLeft: "0.35rem", color: "var(--text-primary)", fontWeight: 700 }}>
                        {userFeedback.rating}/5
                      </span>
                    </div>
                    <p style={{ color: "var(--text-secondary)", whiteSpace: "pre-line" }}>
                      {userFeedback.comment || "No written comment."}
                    </p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                      Thanks for sharing your feedback.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleFeedbackSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                    <label className="form-label" htmlFor="feedback-rating">Your rating</label>
                    <div id="feedback-rating" role="group" aria-label="Rating from 1 to 5 stars" style={{ display: "flex", gap: "0.35rem" }}>
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          aria-label={`${rating} star${rating === 1 ? "" : "s"}`}
                          aria-pressed={feedbackRating === rating}
                          onClick={() => setFeedbackRating(rating)}
                          className="btn btn-ghost btn-icon"
                          style={{ color: "#f59e0b" }}
                        >
                          <Star size={22} fill={rating <= feedbackRating ? "#f59e0b" : "none"} />
                        </button>
                      ))}
                    </div>
                    <label className="form-label" htmlFor="feedback-comment">Comment (optional)</label>
                    <textarea
                      id="feedback-comment"
                      className="form-textarea"
                      rows={4}
                      maxLength={2000}
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder="What did you think about this event?"
                    />
                    {feedbackError && (
                      <div role="alert" style={{ padding: "0.75rem", background: "#fee2e2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "0.85rem" }}>
                        {feedbackError}
                      </div>
                    )}
                    <button type="submit" className="btn btn-primary" disabled={feedbackSubmitting}>
                      {feedbackSubmitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      
      {showPaymentModal && (
        <PaymentModal
          event={event}
          user={user}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={async (txId) => {
            setShowPaymentModal(false);
            await handleRegisterDirect(user.id, eventId);
          }}
        />
      )}


      <style>{`
        @media (min-width: 992px) {
          .event-details-grid {
            grid-template-columns: 2fr 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

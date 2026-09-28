import "./RegistrationSuccess.css";

function RegistrationSuccess({ onNavigate, event }) {
  const dateObj = event?.event_date ? new Date(event.event_date) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const timeStr = dateObj
    ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";
  const venueName = event?.venue_name || event?.venue || "—";
  const eventTitle = event?.title || "your event";

  return (
    <main className="success-page">

      <div className="success-card">

        {/* SUCCESS ICON */}
        <div className="success-icon">
          ✓
        </div>

        {/* LABEL */}
        <p className="success-label">
          REGISTRATION COMPLETE
        </p>

        {/* HEADING */}
        <h1>
          You're <span>confirmed.</span>
        </h1>

        <p className="success-message">
          Your registration for {eventTitle} has been
          successfully completed. We look forward to seeing you there.
        </p>

        {/* EVENT DETAILS */}
        <div className="success-details">

          <div>
            <span>EVENT</span>
            <strong>{eventTitle}</strong>
          </div>

          <div>
            <span>DATE</span>
            <strong>{dateStr}</strong>
          </div>

          <div>
            <span>TIME</span>
            <strong>{timeStr}</strong>
          </div>

          <div>
            <span>LOCATION</span>
            <strong>{venueName}</strong>
          </div>

        </div>

        {/* ACTIONS */}
        <div className="success-actions">

          <button
            className="success-primary-btn"
            onClick={() => onNavigate("myEvents")}
          >
            View My Events →
          </button>

          <button
            className="success-secondary-btn"
            onClick={() => onNavigate("events")}
          >
            Explore More Events
          </button>

          <button
            className="success-secondary-btn"
            onClick={() => onNavigate("home")}
          >
            Back to Home
          </button>

        </div>

      </div>

    </main>
  );
}

export default RegistrationSuccess;
import "./RegistrationSuccess.css";

function RegistrationSuccess({ onNavigate }) {
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
          Your registration for Live Music Night has been
          successfully completed. We look forward to seeing you there.
        </p>

        {/* EVENT DETAILS */}
        <div className="success-details">

          <div>
            <span>EVENT</span>
            <strong>Live Music Night</strong>
          </div>

          <div>
            <span>DATE</span>
            <strong>18 SEP 2026</strong>
          </div>

          <div>
            <span>TIME</span>
            <strong>07:00 PM</strong>
          </div>

          <div>
            <span>LOCATION</span>
            <strong>Hyderabad</strong>
          </div>

          <div>
            <span>REGISTRATION ID</span>
            <strong>SE-2026-00128</strong>
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

import "./EventRegistration.css";
import { useState } from "react";

function EventRegistration({ onNavigate, event }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [attendees, setAttendees] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!event) {
    return (
      <main className="event-registration-page">
        <div style={{ padding: "60px", textAlign: "center" }}>
          <p>No event selected.</p>
          <button onClick={() => onNavigate("events")}>← Back to Events</button>
        </div>
      </main>
    );
  }

  const dateObj = event.event_date ? new Date(event.event_date) : null;
  const dateStr = dateObj
    ? dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })
    : "Date TBA";
  const timeStr = dateObj
    ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";
  const venueName = event.venue_name || event.venue || "Venue TBA";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const token = localStorage.getItem("user-auth-token");
    if (!token) {
      setError("Please log in to register for this event.");
      return;
    }

    setLoading(true);
    try {
      const meResponse = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!meResponse.ok) throw new Error("Could not verify your account. Please log in again.");
      const me = await meResponse.json();

      const regResponse = await fetch("/api/registrations/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_id: me.id,
          event_id: event.event_id || event.id,
        }),
      });

      const data = await regResponse.json();
      if (!regResponse.ok) {
        const message = Array.isArray(data.detail)
          ? data.detail.map((d) => d.msg).join(", ")
          : data.detail || "Registration failed";
        throw new Error(message);
      }

      onNavigate("registrationSuccess");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="event-registration-page">

      {/* LEFT SIDE */}
      <div className="registration-left">

        <div className="registration-brand">
          Smart<span>Event</span>
        </div>

        <div className="registration-event-info">

          <p className="registration-eyebrow">
            EVENT REGISTRATION
          </p>

          <h1>
            {event.title}
          </h1>

          <p>
            Reserve your place and get ready for an
            unforgettable experience.
          </p>

          <div className="registration-event-meta">

            <div>
              <span>DATE</span>
              <strong>{dateStr}</strong>
            </div>

            <div>
              <span>TIME</span>
              <strong>{timeStr || "—"}</strong>
            </div>

            <div>
              <span>LOCATION</span>
              <strong>{venueName}</strong>
            </div>

          </div>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="registration-right">

        <div className="registration-box">

          <button
            className="registration-back-btn"
            onClick={() => onNavigate("eventDetails")}
          >
            ← Back to Event
          </button>

          <p className="registration-label">
            YOUR DETAILS
          </p>

          <h2>
            Reserve your spot.
          </h2>

          <p className="registration-subtitle">
            Enter your details to register for this event.
          </p>

          <form onSubmit={handleSubmit}>

            {/* FULL NAME */}
            <div className="registration-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* EMAIL */}
            <div className="registration-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PHONE + ATTENDEES */}
            <div className="registration-row">

              <div className="registration-field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="registration-field">
                <label>Attendees</label>
                <select
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                >
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 People</option>
                </select>
              </div>

            </div>

            {error && <p style={{ color: "red", fontSize: "13px" }}>{error}</p>}

            {/* CONFIRM */}
            <button
              className="registration-submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Confirm Registration →"}
            </button>

          </form>

          <p className="registration-note">
            By registering, you agree to the event terms
            and confirm that the information provided is correct.
          </p>

        </div>

      </div>

    </main>
  );
}

export default EventRegistration;
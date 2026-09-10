import "./EventRegistration.css";

function EventRegistration({ onNavigate }) {
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
            Live Music
            <br />
            <span>Night.</span>
          </h1>

          <p>
            Reserve your place and get ready for an
            unforgettable evening of music and experiences.
          </p>

          <div className="registration-event-meta">

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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onNavigate("registrationSuccess");
            }}
          >

            {/* FULL NAME */}
            <div className="registration-field">

              <label>
                Full Name
              </label>

              <input
                type="text"
                placeholder="Enter your full name"
                required
              />

            </div>

            {/* EMAIL */}
            <div className="registration-field">

              <label>
                Email Address
              </label>

              <input
                type="email"
                placeholder="Enter your email"
                required
              />

            </div>

            {/* PHONE + ATTENDEES */}
            <div className="registration-row">

              <div className="registration-field">

                <label>
                  Phone Number
                </label>

                <input
                  type="tel"
                  placeholder="+91"
                  required
                />

              </div>

              <div className="registration-field">

                <label>
                  Attendees
                </label>

                <select defaultValue="1">

                  <option value="1">
                    1 Person
                  </option>

                  <option value="2">
                    2 People
                  </option>

                  <option value="3">
                    3 People
                  </option>

                  <option value="4">
                    4 People
                  </option>

                  <option value="5">
                    5 People
                  </option>

                </select>

              </div>

            </div>

            {/* CONFIRM */}
            <button
              className="registration-submit"
              type="submit"
            >
              Confirm Registration →
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
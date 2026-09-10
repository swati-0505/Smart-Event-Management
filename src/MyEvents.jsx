import "./MyEvents.css";

function MyEvents({ onNavigate }) {
  const registeredEvents = [
    {
      title: "Live Music Night",
      category: "Music",
      date: "18 SEP 2026",
      time: "07:00 PM",
      location: "Hyderabad",
      status: "Confirmed",
      image:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Future Tech Summit",
      category: "Technology",
      date: "25 SEP 2026",
      time: "10:00 AM",
      location: "Bengaluru",
      status: "Confirmed",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
    },
  ];

  return (
    <main className="my-events-page">

      <nav className="my-events-nav">

        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="my-events-nav-links">

          <button onClick={() => onNavigate("home")}>
            Home
          </button>

          <button onClick={() => onNavigate("events")}>
            Events
          </button>

          <button className="active">
            My Events
          </button>

          <button onClick={() => onNavigate("profile")}>
            Profile
          </button>

          <button onClick={() => onNavigate("about")}>
            About
          </button>

          <button onClick={() => onNavigate("contact")}>
            Contact
          </button>

        </div>

        <button
          className="my-events-login"
          onClick={() => onNavigate("login")}
        >
          Login
        </button>

      </nav>

      <section className="my-events-hero">

        <p className="my-events-eyebrow">
          YOUR EXPERIENCES
        </p>

        <h1>
          My <span>Events.</span>
        </h1>

        <p>
          Keep track of the events you've registered for
          and never miss an experience worth remembering.
        </p>

      </section>

      <section className="my-events-section">

        <div className="my-events-heading">

          <div>
            <p className="section-label">
              REGISTERED EVENTS
            </p>

            <h2>
              Your upcoming experiences
            </h2>
          </div>

          <span>
            {String(registeredEvents.length).padStart(2, "0")} EVENTS
          </span>

        </div>

        <div className="my-events-list">

          {registeredEvents.map((event, index) => (

            <div className="my-event-card" key={index}>

              <div className="my-event-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              {/* EVENT IMAGE */}
              <div className="my-event-image-wrapper">
                <img
                  src={event.image}
                  alt={event.title}
                  className="my-event-image"
                />
              </div>

              <div className="my-event-main">

                <p className="my-event-category">
                  {event.category}
                </p>

                <h3>
                  {event.title}
                </h3>

                <div className="my-event-meta">

                  <span>
                    <small>DATE</small>
                    {event.date}
                  </span>

                  <span>
                    <small>TIME</small>
                    {event.time}
                  </span>

                  <span>
                    <small>LOCATION</small>
                    {event.location}
                  </span>

                </div>

              </div>

              <div className="my-event-status">
                <span>●</span>
                {event.status}
              </div>

            </div>

          ))}

        </div>

      </section>

      <section className="my-events-empty-cta">

        <p>
          Looking for your next experience?
        </p>

        <button
          onClick={() => onNavigate("events")}
        >
          Explore More Events →
        </button>

      </section>

    </main>
  );
}

export default MyEvents;
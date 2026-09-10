import "./Events.css";

function Events({ onNavigate }) {
  const events = [
    {
      title: "Live Music Night",
      location: "Hyderabad",
      date: "18 SEP 2026",
      category: "Music",
      image:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Future Tech Summit",
      location: "Bengaluru",
      date: "25 SEP 2026",
      category: "Technology",
      image:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Urban Culture Fest",
      location: "Mumbai",
      date: "03 OCT 2026",
      category: "Arts & Culture",
      image:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Business Leaders Meet",
      location: "Chennai",
      date: "10 OCT 2026",
      category: "Business",
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Creative Arts Expo",
      location: "Delhi",
      date: "18 OCT 2026",
      category: "Arts & Culture",
      image:
        "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=85",
    },
    {
      title: "Startup Innovation Day",
      location: "Pune",
      date: "24 OCT 2026",
      category: "Technology",
      image:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=85",
    },
  ];

  return (
    <div className="events-page">

      <nav className="events-nav">
        <div className="logo">SmartEvent</div>

        <div className="events-nav-links">
          <button onClick={() => onNavigate("home")}>
            Home
          </button>

          <button
            className="active"
            onClick={() => onNavigate("events")}
          >
            Events
          </button>

          <button onClick={() => onNavigate("about")}>
            About
          </button>

          <button onClick={() => onNavigate("contact")}>
            Contact
          </button>
        </div>

        <button
  className="login-btn"
  onClick={() => onNavigate("login")}
>
  Login
</button>
      </nav>

      <section className="events-hero">
        <p className="eyebrow">SMART EVENT MANAGEMENT</p>

        <h1>
          Discover experiences
          <br />
          <span>worth remembering.</span>
        </h1>

        <p className="events-intro">
          Explore concerts, technology summits, business gatherings,
          cultural festivals and more — all in one place.
        </p>
      </section>

      <section className="events-section">

        <div className="events-heading">
          <div>
            <p className="section-label">EXPLORE</p>
            <h2>Upcoming Events</h2>
          </div>

          <p className="event-count">06 EVENTS</p>
        </div>

        <div className="events-grid">

          {events.map((event, index) => (
            <div className="event-card" key={index}>

              <div className="event-image-wrapper">
                <img
                  src={event.image}
                  alt={event.title}
                  className="event-image"
                />
              </div>

              <div className="event-card-info">

                <div className="event-card-top">
                  <span>{event.category}</span>
                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="event-card-content">
                  <p className="event-date">
                    {event.date}
                  </p>

                  <h3>{event.title}</h3>

                  <p className="event-location">
                    {event.location}
                  </p>
                </div>

                <button
  className="view-event-btn"
  onClick={() => onNavigate("eventDetails")}
>
  View Event <span>↗</span>
</button>

              </div>

            </div>
          ))}

        </div>

      </section>

    </div>
  );
}

export default Events; 

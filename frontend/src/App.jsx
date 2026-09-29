import Events from "./Events";
import About from "./About";
import Contact from "./Contact";
import Login from "./Login";
import Register from "./Register";
import EventDetails from "./EventDetails";
import EventRegistration from "./EventRegistration";
import RegistrationSuccess from "./RegistrationSuccess";
import MyEvents from "./MyEvents";
import Profile from "./Profile";
import "./App.css";
import AdminApp from "./admin/AdminApp";
import React, { useState, useEffect } from "react";
import { getEvents } from "./admin/services/eventService";
import AIChatWidget from "./admin/components/common/AIChatWidget";

function App() {
  const [page, setPage] = React.useState("home");
  const [selectedEvent, setSelectedEvent] = React.useState(null);

  function navigateToEvent(pageName, event) {
    if (event) setSelectedEvent(event);
    setPage(pageName);
  }

  const [homeEvents, setHomeEvents] = useState([]);

  useEffect(() => {
    getEvents()
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.events || [];
        setHomeEvents(list.slice(0, 3));
      })
      .catch(() => setHomeEvents([]));
  }, []);

  const CATEGORY_IMAGES = {
    "Tech Conference": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
    "Technology": "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
    "Workshop": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=85",
    "Networking": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85",
    "Corporate Event": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
    "Business": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
    "Cultural": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
    "International": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
    "Office": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=85",
    "Personal": "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=900&q=85",
    "Misc": "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=85",
    "Holiday": "https://images.unsplash.com/photo-1482517967863-00e15c9b44be?auto=format&fit=crop&w=900&q=85",
  };
  const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=900&q=85";
  function getHomeEventImage(ev) {
    return ev.image || CATEGORY_IMAGES[ev.category] || DEFAULT_IMAGE;
  }

  /* PAGE NAVIGATION */

  if (page === "events") {
    return <Events onNavigate={setPage} onSelectEvent={navigateToEvent} />;
  }

  if (page === "about") {
    return <About onNavigate={setPage} />;
  }

  if (page === "contact") {
    return <Contact onNavigate={setPage} />;
  }

  if (page === "login") {
    return <Login onNavigate={setPage} />;
  }

  if (page === "register") {
    return <Register onNavigate={setPage} />;
  }

  if (page === "eventDetails") {
    return (
      <EventDetails
        onNavigate={setPage}
        event={selectedEvent}
        onSelectEvent={navigateToEvent}
      />
    );
  }

  if (page === "eventRegistration") {
    return <EventRegistration onNavigate={setPage} event={selectedEvent} />;
  }

  if (page === "registrationSuccess") {
    return <RegistrationSuccess onNavigate={setPage} event={selectedEvent} />;
  }

  if (page === "myEvents") {
    return <MyEvents onNavigate={setPage} />;
  }

  if (page === "profile") {
    return <Profile onNavigate={setPage} />;
  }

  return (
    <>
      <main className="home">
        <section className="hero">

          <nav className="navbar">

            <div className="logo">
              Smart<span>Event</span>
            </div>

            <div className="nav-links">

              <a href="#" onClick={(e) => { e.preventDefault(); setPage("home"); }}>Home</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage("events"); }}>Events</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage("about"); }}>About</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setPage("contact"); }}>Contact</a>

            </div>

            <button className="login-btn" onClick={() => setPage("login")}>
              Login
            </button>

          </nav>

          <div className="hero-content">

            <p className="eyebrow">SMART EVENT MANAGEMENT</p>

            <h1>
              Create Moments.
              <br />
              <span>Make Them Matter.</span>
            </h1>

            <p className="description">
              Discover unforgettable events, connect with people,
              and experience every moment through one intelligent platform.
            </p>

            <div className="hero-actions">
              <button className="primary-btn" onClick={() => setPage("events")}>
                Explore Events
              </button>
              <button className="outline-btn">Discover More</button>
            </div>

          </div>

          <div className="hero-bottom">
            <span>01</span>
            <div className="line"></div>
            <span>SMART EXPERIENCES</span>
          </div>

        </section>

        <section className="events-section">

          <div className="section-heading">
            <p className="eyebrow">DISCOVER</p>
            <h2>Upcoming Events</h2>
            <p>Explore experiences worth remembering.</p>
          </div>

          <div className="events-grid">

            {homeEvents.length === 0 && (
              <p style={{ padding: "20px" }}>No upcoming events right now.</p>
            )}

            {homeEvents.map((event) => {
              const dateObj = event.event_date ? new Date(event.event_date) : null;
              const dateStr = dateObj
                ? dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()
                : "TBA";
              const venueName = event.venue_name || event.venue || "TBA";

              return (
                <div className="event-card" key={event.event_id || event.id}>
                  <img src={getHomeEventImage(event)} alt={event.title} />
                  <div className="event-info">
                    <span className="event-category">{(event.category || "EVENT").toUpperCase()}</span>
                    <h3>{event.title}</h3>
                    <p>📍 {venueName}</p>
                    <div className="event-bottom">
                      <span>{dateStr}</span>
                      <button onClick={() => navigateToEvent("eventDetails", event)}>
                        View Event →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

          </div>

        </section>

        <section className="why-section">

          <div className="section-heading">
            <p className="eyebrow">WHY SMARTEVENT</p>
            <h2>Everything You Need.<br />In One Place.</h2>
            <p>A smarter way to discover, manage, and experience events.</p>
          </div>

          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-number">01</div>
              <h3>Discover Events</h3>
              <p>Find events that match your interests and explore experiences happening around you.</p>
            </div>

            <div className="feature-card">
              <div className="feature-number">02</div>
              <h3>Smart Experience</h3>
              <p>Get a seamless event experience with intelligent recommendations and simple navigation.</p>
            </div>

            <div className="feature-card">
              <div className="feature-number">03</div>
              <h3>Easy & Seamless</h3>
              <p>From discovering an event to attending it, everything stays simple and organized.</p>
            </div>

          </div>

        </section>

        <section className="discover-section">

          <div className="discover-content">

            <p className="eyebrow">FIND YOUR EXPERIENCE</p>
            <h2>What are you<br />looking for?</h2>
            <p className="discover-text">Search and explore events that match your interests.</p>

            <div className="search-box">
              <input type="text" placeholder="Search events..." />
              <button>Search</button>
            </div>

            <div className="category-list">
              <button>All Events</button>
              <button>Music</button>
              <button>Technology</button>
              <button>Business</button>
              <button>Arts & Culture</button>
            </div>

          </div>

        </section>

        <section className="experience-section">

          <div className="experience-image">
            <img src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85" alt="Event experience" />
          </div>

          <div className="experience-content">

            <p className="eyebrow">THE SMARTER WAY</p>
            <h2>Events designed<br />around <span>you.</span></h2>
            <p>
              SmartEvent brings event discovery and experiences together
              in one elegant platform. Find the right events, explore new
              experiences, and make every moment count.
            </p>

            <div className="experience-stats">
              <div><strong>100+</strong><span>Events</span></div>
              <div><strong>50+</strong><span>Organizers</span></div>
              <div><strong>10K+</strong><span>Attendees</span></div>
            </div>

          </div>

        </section>

        <section className="cta-section">

          <p className="eyebrow">YOUR NEXT EXPERIENCE</p>
          <h2>Make your next event<br /><span>unforgettable.</span></h2>
          <p>Discover experiences that are worth being part of.</p>
          <button className="cta-btn" onClick={() => setPage("events")}>
            Explore Events →
          </button>

        </section>

        <footer className="footer">

          <div className="footer-top">

            <div className="footer-brand">
              <div className="logo">Smart<span>Event</span></div>
              <p>A smarter way to discover and experience events.</p>
            </div>

            <div className="footer-links">

              <div>
                <h4>Explore</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("events"); }}>Events</a>
                <a href="#">Categories</a>
                <a href="#">Discover</a>
              </div>

              <div>
                <h4>Company</h4>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("about"); }}>About</a>
                <a href="#" onClick={(e) => { e.preventDefault(); setPage("contact"); }}>Contact</a>
                <a href="#">Privacy</a>
              </div>

              <div>
                <h4>Connect</h4>
                <a href="#">Instagram</a>
                <a href="#">LinkedIn</a>
                <a href="#">Twitter</a>
              </div>

            </div>

          </div>

          <div className="footer-bottom">
            <span>© 2026 SmartEvent</span>
            <span>Smart events. Better experiences.</span>
          </div>

        </footer>

      </main>

      <AIChatWidget guest={true} />
    </>
  );
}

export default App;
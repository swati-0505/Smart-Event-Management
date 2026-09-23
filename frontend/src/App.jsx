import AdminApp from "./admin/AdminApp";
import React from "react";
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

function App() {
  const [page, setPage] = React.useState("home");
  if (page === "admin") {
  return <AdminApp />;
}

  /* PAGE NAVIGATION */

  if (page === "events") {
    return <Events onNavigate={setPage} />;
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
    return <EventDetails onNavigate={setPage} />;
  }

  if (page === "eventRegistration") {
    return <EventRegistration onNavigate={setPage} />;
  }

  if (page === "registrationSuccess") {
    return <RegistrationSuccess onNavigate={setPage} />;
  }

  if (page === "myEvents") {
    return <MyEvents onNavigate={setPage} />;
  }

  if (page === "profile") {
    return <Profile onNavigate={setPage} />;
  }

  return (
    <main className="home">

      {/* HERO */}
      <section className="hero">

        {/* NAVBAR */}
        <nav className="navbar">

          <div className="logo">
            Smart<span>Event</span>
          </div>

          <div className="nav-links">

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("home");
              }}
            >
              Home
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("events");
              }}
            >
              Events
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("about");
              }}
            >
              About
            </a>

            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage("contact");
              }}
            >
              Contact
            </a>

          </div>

          <button
            className="login-btn"
            onClick={() => setPage("login")}
          >
            Login
          </button>
          {/*<button
            className="login-btn"
            onClick={() => setPage("admin")}
>
            Admin Dashboard
          </button>*/}

        </nav>

        {/* HERO CONTENT */}
        <div className="hero-content">

          <p className="eyebrow">
            SMART EVENT MANAGEMENT
          </p>

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

            <button
              className="primary-btn"
              onClick={() => setPage("events")}
            >
              Explore Events
            </button>

            <button className="outline-btn">
              Discover More
            </button>

          </div>

        </div>

        {/* HERO BOTTOM */}
        <div className="hero-bottom">
          <span>01</span>
          <div className="line"></div>
          <span>SMART EXPERIENCES</span>
        </div>

      </section>

      {/* UPCOMING EVENTS */}
      <section className="events-section">

        <div className="section-heading">

          <p className="eyebrow">
            DISCOVER
          </p>

          <h2>
            Upcoming Events
          </h2>

          <p>
            Explore experiences worth remembering.
          </p>

        </div>

        <div className="events-grid">

          {/* EVENT 1 */}
          <div className="event-card">

            <img
              src="https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=85"
              alt="Music Event"
            />

            <div className="event-info">

              <span className="event-category">
                MUSIC
              </span>

              <h3>
                Live Music Night
              </h3>

              <p>
                📍 Hyderabad
              </p>

              <div className="event-bottom">

                <span>
                  18 SEP 2026
                </span>

                <button
                  onClick={() => setPage("eventDetails")}
                >
                  View Event →
                </button>

              </div>

            </div>

          </div>

          {/* EVENT 2 */}
          <div className="event-card">

            <img
              src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85"
              alt="Technology Conference"
            />

            <div className="event-info">

              <span className="event-category">
                BUSINESS
              </span>

              <h3>
                Future Tech Summit
              </h3>

              <p>
                📍 Bengaluru
              </p>

              <div className="event-bottom">

                <span>
                  25 SEP 2026
                </span>

                <button
                  onClick={() => setPage("eventDetails")}
                >
                  View Event →
                </button>

              </div>

            </div>

          </div>

          {/* EVENT 3 */}
          <div className="event-card">

            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85"
              alt="Cultural Festival"
            />

            <div className="event-info">

              <span className="event-category">
                FESTIVAL
              </span>

              <h3>
                Urban Culture Fest
              </h3>

              <p>
                📍 Mumbai
              </p>

              <div className="event-bottom">

                <span>
                  03 OCT 2026
                </span>

                <button
                  onClick={() => setPage("eventDetails")}
                >
                  View Event →
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* WHY SMARTEVENT */}
      <section className="why-section">

        <div className="section-heading">

          <p className="eyebrow">
            WHY SMARTEVENT
          </p>

          <h2>
            Everything You Need.
            <br />
            In One Place.
          </h2>

          <p>
            A smarter way to discover, manage, and experience events.
          </p>

        </div>

        <div className="features-grid">

          <div className="feature-card">

            <div className="feature-number">
              01
            </div>

            <h3>
              Discover Events
            </h3>

            <p>
              Find events that match your interests and explore
              experiences happening around you.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-number">
              02
            </div>

            <h3>
              Smart Experience
            </h3>

            <p>
              Get a seamless event experience with intelligent
              recommendations and simple navigation.
            </p>

          </div>

          <div className="feature-card">

            <div className="feature-number">
              03
            </div>

            <h3>
              Easy & Seamless
            </h3>

            <p>
              From discovering an event to attending it,
              everything stays simple and organized.
            </p>

          </div>

        </div>

      </section>

      {/* DISCOVER */}
      <section className="discover-section">

        <div className="discover-content">

          <p className="eyebrow">
            FIND YOUR EXPERIENCE
          </p>

          <h2>
            What are you
            <br />
            looking for?
          </h2>

          <p className="discover-text">
            Search and explore events that match your interests.
          </p>

          <div className="search-box">

            <input
              type="text"
              placeholder="Search events..."
            />

            <button>
              Search
            </button>

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

      {/* EXPERIENCE */}
      <section className="experience-section">

        <div className="experience-image">

          <img
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=85"
            alt="Event experience"
          />

        </div>

        <div className="experience-content">

          <p className="eyebrow">
            THE SMARTER WAY
          </p>

          <h2>
            Events designed
            <br />
            around <span>you.</span>
          </h2>

          <p>
            SmartEvent brings event discovery and experiences together
            in one elegant platform. Find the right events, explore new
            experiences, and make every moment count.
          </p>

          <div className="experience-stats">

            <div>
              <strong>100+</strong>
              <span>Events</span>
            </div>

            <div>
              <strong>50+</strong>
              <span>Organizers</span>
            </div>

            <div>
              <strong>10K+</strong>
              <span>Attendees</span>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="cta-section">

        <p className="eyebrow">
          YOUR NEXT EXPERIENCE
        </p>

        <h2>
          Make your next event
          <br />
          <span>unforgettable.</span>
        </h2>

        <p>
          Discover experiences that are worth being part of.
        </p>

        <button
          className="cta-btn"
          onClick={() => setPage("events")}
        >
          Explore Events →
        </button>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <div className="footer-top">

          <div className="footer-brand">

            <div className="logo">
              Smart<span>Event</span>
            </div>

            <p>
              A smarter way to discover and experience events.
            </p>

          </div>

          <div className="footer-links">

            <div>

              <h4>Explore</h4>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage("events");
                }}
              >
                Events
              </a>

              <a href="#">
                Categories
              </a>

              <a href="#">
                Discover
              </a>

            </div>

            <div>

              <h4>Company</h4>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage("about");
                }}
              >
                About
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  setPage("contact");
                }}
              >
                Contact
              </a>

              <a href="#">
                Privacy
              </a>

            </div>

            <div>

              <h4>Connect</h4>

              <a href="#">
                Instagram
              </a>

              <a href="#">
                LinkedIn
              </a>

              <a href="#">
                Twitter
              </a>

            </div>

          </div>

        </div>

        <div className="footer-bottom">

          <span>
            © 2026 SmartEvent
          </span>

          <span>
            Smart events. Better experiences.
          </span>

        </div>

      </footer>

    </main>
  );
}

export default App;
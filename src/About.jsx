import "./About.css";

function About({ onNavigate }) {
  return (
    <main className="about-page">

      {/* NAVBAR */}
      <nav className="about-nav">

        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="about-nav-links">

          <button onClick={() => onNavigate("home")}>
            Home
          </button>

          <button onClick={() => onNavigate("events")}>
            Events
          </button>

          <button
            className="active"
            onClick={() => onNavigate("about")}
          >
            About
          </button>

          <button onClick={() => onNavigate("contact")}>
            Contact
          </button>

        </div>

        <button
  className="about-login-btn"
  onClick={() => onNavigate("login")}
>
  Login
</button>

      </nav>


      {/* HERO */}
      <section className="about-hero">

        <p className="about-eyebrow">
          ABOUT SMARTEVENT
        </p>

        <h1>
          Bringing people
          <br />
          <span>together through events.</span>
        </h1>

        <p className="about-intro">
          SmartEvent is a modern event discovery platform designed
          to make finding and experiencing events simple, intelligent,
          and memorable.
        </p>

      </section>


      {/* STORY */}
      <section className="about-story">

        <div className="about-story-image">
          <img
            src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=85"
            alt="Event gathering"
          />
        </div>

        <div className="about-story-content">

          <p className="about-eyebrow">
            OUR STORY
          </p>

          <h2>
            Events are more
            <br />
            than just <span>moments.</span>
          </h2>

          <p>
            Every event creates an opportunity to connect, discover
            something new, and create memories that last.
          </p>

          <p>
            SmartEvent brings these experiences together in one
            intelligent platform, helping people discover events
            that truly match their interests.
          </p>

        </div>

      </section>


      {/* VALUES */}
      <section className="about-values">

        <div className="about-section-heading">

          <p className="about-eyebrow">
            WHAT DRIVES US
          </p>

          <h2>
            Built around
            <br />
            <span>better experiences.</span>
          </h2>

        </div>


        <div className="about-values-grid">

          <div className="about-value-card">

            <span>01</span>

            <h3>
              Discover
            </h3>

            <p>
              Helping people find meaningful events and experiences
              that match their interests.
            </p>

          </div>


          <div className="about-value-card">

            <span>02</span>

            <h3>
              Connect
            </h3>

            <p>
              Creating opportunities for people to connect through
              shared experiences and memorable moments.
            </p>

          </div>


          <div className="about-value-card">

            <span>03</span>

            <h3>
              Experience
            </h3>

            <p>
              Making every step of the event journey simple,
              seamless, and enjoyable.
            </p>

          </div>

        </div>

      </section>


      {/* STATS */}
      <section className="about-stats">

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

        <div>
          <strong>24/7</strong>
          <span>Experience</span>
        </div>

      </section>


      {/* CTA */}
      <section className="about-cta">

        <p className="about-eyebrow">
          YOUR NEXT EXPERIENCE
        </p>

        <h2>
          Discover something
          <br />
          <span>worth remembering.</span>
        </h2>

        <button
          onClick={() => onNavigate("events")}
        >
          Explore Events →
        </button>

      </section>


      {/* FOOTER */}
      <footer className="about-footer">

        <div className="about-footer-brand">

          <div className="logo">
            Smart<span>Event</span>
          </div>

          <p>
            A smarter way to discover and experience events.
          </p>

        </div>

        <div className="about-footer-copy">
          © 2026 SmartEvent
        </div>

      </footer>

    </main>
  );
}

export default About;
import "./Contact.css";

function Contact({ onNavigate }) {
  return (
    <main className="contact-page">

      {/* NAVBAR */}
      <nav className="contact-nav">
        <div className="logo">
          Smart<span>Event</span>
        </div>

        <div className="contact-nav-links">
          <button onClick={() => onNavigate("home")}>Home</button>
          <button onClick={() => onNavigate("events")}>Events</button>
          <button onClick={() => onNavigate("about")}>About</button>
          <button
            className="active"
            onClick={() => onNavigate("contact")}
          >
            Contact
          </button>
        </div>

        <button
  className="contact-login-btn"
  onClick={() => onNavigate("login")}
>
  Login
</button>
      </nav>

      {/* HERO */}
      <section className="contact-hero">
        <p className="contact-eyebrow">GET IN TOUCH</p>

        <h1>
          Let’s create
          <br />
          <span>something memorable.</span>
        </h1>

        <p>
          Have a question, suggestion, or want to know more about
          SmartEvent? We would love to hear from you.
        </p>
      </section>

      {/* CONTACT CONTENT */}
      <section className="contact-section">

        <div className="contact-info">
          <p className="contact-eyebrow">CONTACT US</p>

          <h2>
            We’re here
            <br />
            <span>to help.</span>
          </h2>

          <p>
            Reach out to us and our team will get back to you
            as soon as possible.
          </p>

          <div className="contact-details">
            <div>
              <span>Email</span>
              <strong>hello@smartevent.com</strong>
            </div>

            <div>
              <span>Phone</span>
              <strong>+91 98765 43210</strong>
            </div>

            <div>
              <span>Location</span>
              <strong>India</strong>
            </div>
          </div>
        </div>

        {/* FORM */}
        <div className="contact-form">
          <div className="form-group">
            <label>Your Name</label>
            <input type="text" placeholder="Enter your name" />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input type="email" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label>Subject</label>
            <input type="text" placeholder="What is this about?" />
          </div>

          <div className="form-group">
            <label>Message</label>
            <textarea
              rows="5"
              placeholder="Write your message..."
            ></textarea>
          </div>

          <button className="send-btn">
            Send Message →
          </button>
        </div>

      </section>

      {/* FOOTER */}
      <footer className="contact-footer">
        <div>
          <div className="logo">
            Smart<span>Event</span>
          </div>

          <p>
            A smarter way to discover and experience events.
          </p>
        </div>

        <span>© 2026 SmartEvent</span>
      </footer>

    </main>
  );
}

export default Contact;
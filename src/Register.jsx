import "./Register.css";

function Register({ onNavigate }) {
  return (
    <main className="register-page">

      {/* LEFT SIDE */}
      <div className="register-left">

        <div className="register-brand">
          Smart<span>Event</span>
        </div>

        <div className="register-content">

          <p className="register-eyebrow">
            JOIN SMARTEVENT
          </p>

          <h1>
            Your next
            <br />
            <span>experience starts here.</span>
          </h1>

          <p>
            Create your account and discover events,
            connect with people, and experience more.
          </p>

        </div>

      </div>

      {/* RIGHT SIDE */}
      <div className="register-right">

        <div className="register-box">

          <button
            className="register-back-btn"
            onClick={() => onNavigate("login")}
          >
            ← Back to Login
          </button>

          <p className="register-label">
            CREATE ACCOUNT
          </p>

          <h2>Get started.</h2>

          <p className="register-subtitle">
            Create your SmartEvent account.
          </p>

          <form onSubmit={(e) => e.preventDefault()}>

            <div className="register-field">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
              />
            </div>

            <div className="register-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="register-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Create a password"
              />
            </div>

            <div className="register-field">
              <label>Confirm Password</label>
              <input
                type="password"
                placeholder="Confirm your password"
              />
            </div>

            <button
              className="register-submit"
              type="submit"
            >
              Create Account →
            </button>

          </form>

          <p className="login-account-text">
            Already have an account?

            <button
              type="button"
              onClick={() => onNavigate("login")}
            >
              Sign In
            </button>
          </p>

        </div>

      </div>

    </main>
  );
}

export default Register;
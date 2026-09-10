import "./Login.css";

function Login({ onNavigate }) {
  return (
    <main className="login-page">

      <div className="login-left">
        <div className="login-brand">
          Smart<span>Event</span>
        </div>

        <div className="login-content">
          <p className="login-eyebrow">WELCOME BACK</p>

          <h1>
            Experience
            <br />
            <span>something smarter.</span>
          </h1>

          <p>
            Sign in to discover events, manage your experiences,
            and stay connected with what matters to you.
          </p>
        </div>
      </div>

      <div className="login-right">

        <div className="login-box">

          <button
            className="back-btn"
            onClick={() => onNavigate("home")}
          >
            ← Back to Home
          </button>

          <p className="login-label">ACCOUNT LOGIN</p>

          <h2>Welcome back.</h2>

          <p className="login-subtitle">
            Sign in to continue to SmartEvent.
          </p>

        <form
         onSubmit={(e) => {
         e.preventDefault();
          onNavigate("profile");
       }}
        >

            <div className="login-field">
              <label>Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
              />
            </div>

            <div className="login-options">
              <label>
                <input type="checkbox" />
                Remember me
              </label>

              <button type="button">
                Forgot password?
              </button>
            </div>

            <button className="login-submit" type="submit">
  Sign In →
</button>

          </form>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <p className="signup-text">
            Don't have an account?
            <button
  type="button"
  onClick={() => onNavigate("register")}
>
  Create Account
</button>
          </p>

        </div>

      </div>

    </main>
  );
}

export default Login;
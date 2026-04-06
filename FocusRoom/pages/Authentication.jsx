import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import "../src/App.css";
import "../styles/auth.css";
import AuthContext from "../contexts/AuthContext";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { AppleIcon, GoogleIcon, FacebookIcon, MicrosoftIcon, CheckIcon } from "../components/Icons";



function Authentication() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false); // snack bar 
  const [message, setMessage] = useState("no message yet..!");

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setEmail("");
    setPassword("");
    setUsername("");
  };

  const { handleLogin, handleRegister } = useContext(AuthContext);

  let handleAuth = async (e) => {
    if (e) e.preventDefault();
    try {
      if (isLogin) {
        let result = await handleLogin(username, password);
        setMessage("Logged in Successfully!");
        setOpen(true);
        setError("");
        toggleAuthMode();
      } else {
        let result = await handleRegister(username, email, password);
        console.log(result);
        setMessage(result.message);
        setOpen(true);
        setError("");
        toggleAuthMode();
      }
      console.log("auth process done..!");
    } catch (err) {
      console.log(err);
      setError(err?.response?.data?.message);
      setMessage(err?.response?.data?.message);
      setOpen(true);
      console.log("auth failed");
    }
  }

  const isFormValid = isLogin ? (!username || !password) : (!username || !email || !password);

  return (
    <div className="auth-container">
      <Link to="/" className="auth-logo auth-logo-floating">FocusRoom</Link>

      {/* Left Panel - Branding & Information */}
      <div className="auth-left">

        {isLogin ? (
          <div className="auth-hero-card">
            <span className="auth-hero-label">Webinar</span>
            <h2 className="landing-text-gradient">Beyond friction<br />in collaboration:</h2>
            <p>
              Get a first look at FocusRoom's latest innovations in AI and orchestration that are transforming customer experience and operational excellence, while unifying the workplace experience.
            </p>
          </div>
        ) : (
          <div className="signup-panel-content">
            {/* Floating UI illustration for FocusRoom signup */}
            <div className="signup-illustration-container">
              <svg viewBox="0 0 400 250" width="100%" height="220" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="50" y="30" width="300" height="190" rx="16" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
                <rect x="70" y="50" width="260" height="20" rx="4" fill="rgba(59, 130, 246, 0.4)" />
                <rect x="70" y="90" width="180" height="110" rx="8" fill="rgba(255,255,255,0.1)" />
                <rect x="270" y="90" width="60" height="110" rx="8" fill="rgba(124, 58, 237, 0.4)" />
                <circle cx="210" cy="145" r="28" fill="var(--primary)" />
                <path d="M202 145L208 151L220 139" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="signup-perks-card">
              <h2>Create your free Basic account</h2>
              <ul className="signup-perks-list">
                <li><CheckIcon /> Get up to 40 minutes and 100 participants per meeting</li>
                <li><CheckIcon /> Share up to 10 docs</li>
                <li><CheckIcon /> Get 3 editable whiteboards</li>
                <li><CheckIcon /> Unlimited instant messaging</li>
                <li><CheckIcon /> Create up to 5 two-minute video messages</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <header className="auth-header">
          <div className="auth-header-links">
            {isLogin ? (
              <>
                <span>New to FocusRoom?</span>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Sign Up Free</a>
              </>
            ) : (
              <>
                <span>Already have an account?</span>
                <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Sign In</a>
              </>
            )}
            <span style={{ color: '#d1d5db' }}>|</span>
            <a href="#" style={{ color: '#4b5563' }}>Support</a>
          </div>
        </header>

        <div className="auth-form-wrapper">
          <div className="auth-form-container">
            <h1 className="auth-title">{isLogin ? "Sign in" : "Let's get started"}</h1>

            <form onSubmit={handleAuth}>
              <div className="auth-input-group">
                {!isLogin && (
                  <>
                    <input
                      name="email"
                      type="email"
                      className="auth-input"
                      placeholder={isLogin ? "Email" : "Email Address"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                    />
                    <br /><br />
                  </>
                )}


                <input
                  name="username"
                  type="username"
                  className="auth-input"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
                <br /><br />

                <input
                  name="password"
                  type="password"
                  className="auth-input"
                  placeholder={isLogin ? "Password" : "Password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="password"
                />
                <p style={{ color: "red" }}>{error}</p>
              </div>


              {!isLogin && (
                <div className="disclaimer" style={{ marginBottom: "1.5rem", marginTop: "-0.5rem" }}>
                  By proceeding, I agree to FocusRoom's{" "}
                  <a href="#">Privacy Statement</a> and <a href="#">Terms of Service</a>.
                </div>
              )}
              <button
                type="submit"
                className={`auth-btn ${isFormValid ? 'auth-btn-disabled' : ''}`}
                disabled={isFormValid}
                onClick={() => console.log("button clicked..!")}
              >
                {isLogin ? "Next" : "Continue"}
              </button>
            </form>

            <div className="auth-divider">
              {isLogin ? (
                <>
                  <span>New to FocusRoom?</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Sign Up Free</a>
                </>
              ) : (
                <>
                  <span>Already have an account?</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); toggleAuthMode(); }}>Sign In</a>
                </>
              )}
            </div>

            <div className="social-login-group">
              <button className="social-btn" aria-label="Apple">
                <AppleIcon />
              </button>
              <button className="social-btn" aria-label="Google">
                <GoogleIcon />
              </button>
              <button className="social-btn" aria-label="Facebook">
                <FacebookIcon />
              </button>
              <button className="social-btn" aria-label="Microsoft">
                <MicrosoftIcon />
              </button>
            </div>

            {isLogin && (
              <a href="#" className="forgot-password">Forgot Password?</a>
            )}
          </div>
        </div>

        <footer className="auth-footer-links">
          <a href="#">Help</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </footer>
      </div>
      <Snackbar
        open={open}
        autoHideDuration={4000}
        message={message}
        onClose={() => setOpen(false)}
      >
        <Alert
          onClick={() => setOpen(false)}
          severity={error ? "error" : "success"}
          variant="filled"
        >
          {message}
        </Alert>
      </Snackbar>
    </div>

  );
}

export default Authentication;

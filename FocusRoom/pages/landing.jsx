
import { useState, useEffect } from "react";
import "../src/App.css";
import { Link } from "react-router-dom";

function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);
  return (
    <div className="landingPageContainer">

      <div className="mouse-glow" style={{
        background: `radial-gradient(400px circle at ${mousePosition.x}px
      ${mousePosition.y}px, rgba(59, 130, 246, 0.1), transparent 80%)`
      }} />

      {/* ── Navigation ── */}
      <nav>
        <div className="navTitle">
          <h2>FocusRoom</h2>
        </div>

        <div className="navList">
          <p className="nav-link-hide-mobile">Products</p>
          <p className="nav-link-hide-mobile">Solutions</p>
          <p className="nav-link-hide-mobile">Pricing</p>
          {/* 
          <div role="button" className="btn-outline">
            <p>Contact Sales</p>
          </div> */}
          <Link to="/auth" className="btn-primary">
            <p>Sign Up Free</p>
          </Link>
        </div>
      </nav>

      <div className="landingMainContainer">
        <div className="mainContainText">
          <h1>
            Find out what's possible
            <br />
            when work connects
          </h1>
          <p>
            Whether you're chatting with teammates or supporting customers,
            FocusRoom makes it easier to connect, collaborate, and reach
            goals all with built-in AI doing the heavy lifting.
          </p>

          <div className="heroCTAGroup">
            <Link to="/home" className="btn-hero-primary">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
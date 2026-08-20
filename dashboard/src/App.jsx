import { useState } from "react";
import "./App.css";
import CrowdDashboard from "./CrowdDashboard";

function App() {
  const [mode, setMode] = useState("home");
  if (mode === "crowd") {
  return <CrowdDashboard />;
}

  return (
    <div className="app">

      {/* TOP NAVBAR */}
      <header className="navbar">
        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <span>SafeYatra</span>
        </div>

        <div className="nav-links">
          <span>Home</span>
          <span>Safety</span>
          <span>Alerts</span>
          <span>Emergency</span>
        </div>

        <button className="profile-btn">My Profile</button>
      </header>

      {/* HERO SECTION */}
      <main>

        <section className="hero">
          <div className="hero-text">
            <p className="tagline">SMART TRAVEL SAFETY SYSTEM</p>

            <h1>
              Travel freely.
              <br />
              <span>Stay protected.</span>
            </h1>

            <p className="description">
              SafeYatra connects travellers, safety monitoring,
              intelligent alerts and emergency assistance in one place.
            </p>

            <div className="mode-buttons">
              <button
                className={mode === "crowd" ? "mode-btn active" : "mode-btn"}
                onClick={() => setMode("crowd")}
              >
                👥 Crowd Mode
              </button>

              <button
                className={mode === "trekker" ? "mode-btn active" : "mode-btn"}
                onClick={() => setMode("trekker")}
              >
                🥾 Trekker Mode
              </button>
            </div>
          </div>

          {/* STATUS CARD */}
          <div className="status-card">
            <div className="status-top">
              <span className="live-dot"></span>
              <span>System Active</span>
            </div>

            <div className="shield">
              🛡️
            </div>

            <h2>
              {mode === "crowd"
                ? "Crowd Safety"
                : "Trekker Safety"}
            </h2>

            <p>
              {mode === "crowd"
                ? "Monitoring your group and surrounding safety zones."
                : "Monitoring your route, location and trek status."}
            </p>

            <button className="start-btn">
              Enter {mode === "crowd" ? "Crowd" : "Trekker"} Dashboard →
            </button>
          </div>
        </section>

        {/* FEATURE CARDS */}
        <section className="features">

          <div className="section-heading">
            <p>YOUR SAFETY, OUR PRIORITY</p>
            <h2>Everything you need on your journey</h2>
          </div>

          <div className="feature-grid">

            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Live Location</h3>
              <p>
                Track your current position and stay aware of
                your surroundings.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚨</div>
              <h3>Smart Alerts</h3>
              <p>
                Receive instant alerts when unusual or unsafe
                situations are detected.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🆘</div>
              <h3>Emergency Support</h3>
              <p>
                Quickly access emergency assistance whenever
                you need it.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🗺️</div>
              <h3>Safe Navigation</h3>
              <p>
                Find safer routes and stay informed during
                your journey.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer>
        <span>© 2026 SafeYatra</span>
        <span>Travel Smart • Travel Safe</span>
      </footer>

    </div>
  );
}

export default App;
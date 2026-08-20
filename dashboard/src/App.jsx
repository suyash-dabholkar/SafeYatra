import "./App.css";
import { useSafety } from "./context/SafetyContext.jsx";

import { AdminDashboard } from "./components/dashboard/AdminDashboard.jsx";
import { TrekkerApp } from "./components/trekker/TrekkerApp.jsx";
import { CrowdVisitorMode } from "./components/crowd/CrowdVisitorMode.jsx";

function App() {
  const { activeTab, setActiveTab } = useSafety();

  return (
    <div className="app">

      {/* TOP NAVBAR */}
      <header className="navbar">

        <div className="logo">
          <span className="logo-icon">🛡️</span>
          <span>SafeYatra</span>
        </div>

        {/* SIMPLE TAB SWITCHER */}
        <div className="nav-links">

          <button
            onClick={() => setActiveTab("admin")}
            className={activeTab === "admin" ? "active" : ""}
          >
            Admin
          </button>

          <button
            onClick={() => setActiveTab("trekker")}
            className={activeTab === "trekker" ? "active" : ""}
          >
            Trekker
          </button>

          <button
            onClick={() => setActiveTab("crowd")}
            className={activeTab === "crowd" ? "active" : ""}
          >
            Crowd
          </button>

        </div>

        <button className="profile-btn">
          My Profile
        </button>

      </header>

      {/* MAIN APPLICATION SHELL */}
      <main>

        {activeTab === "admin" && (
          <AdminDashboard />
        )}

        {activeTab === "trekker" && (
          <TrekkerApp />
        )}

        {activeTab === "crowd" && (
          <CrowdVisitorMode />
        )}

      </main>

    </div>
  );
}

export default App;
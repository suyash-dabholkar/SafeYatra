function CrowdDashboard() {
  return (
    <div className="dashboard">

      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">SAFEYATRA / CROWD MODE</p>
          <h1>Crowd Safety Dashboard</h1>
          <p>Stay connected. Stay together. Stay safe.</p>
        </div>

        <div className="status-badge">
          <span></span>
          Trip Active
        </div>
      </header>

      <section className="dashboard-grid">

        <div className="dashboard-card">
          <div className="card-icon">👥</div>
          <p>GROUP STATUS</p>
          <h2>5 Members</h2>
          <span className="safe-text">All members connected</span>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">📍</div>
          <p>YOUR LOCATION</p>
          <h2>Safe Zone</h2>
          <span className="safe-text">Location tracking active</span>
        </div>

        <div className="dashboard-card alert-card">
          <div className="card-icon">🚨</div>
          <p>SAFETY ALERTS</p>
          <h2>0 Active</h2>
          <span className="safe-text">No immediate threats detected</span>
        </div>

        <div className="dashboard-card">
          <div className="card-icon">🗺️</div>
          <p>SAFE ZONE</p>
          <h2>Within Zone</h2>
          <span className="safe-text">You are inside the permitted area</span>
        </div>

      </section>
      <section className="map-section">
  <div className="map-header">
    <div>
      <p className="dashboard-label">LIVE MONITORING</p>
      <h2>Group Live Map</h2>
    </div>

    <span className="map-status">
      ● LIVE
    </span>
  </div>

  <div className="map-placeholder">
    <div className="map-grid"></div>

    <div className="map-marker user-marker">
      📍
    </div>

    <div className="map-marker member-marker member-1">
      👤
    </div>

    <div className="map-marker member-marker member-2">
      👤
    </div>

    <div className="map-marker member-marker member-3">
      👤
    </div>

    <div className="map-center-text">
      <strong>Group Location</strong>
      <span>5 members connected</span>
    </div>
  </div>
</section>

      <section className="crowd-actions">

        <div className="action-card">
          <h2>Emergency Assistance</h2>
          <p>
            If you feel unsafe or need immediate assistance,
            trigger an emergency alert.
          </p>

          <button className="sos-button">
            🆘 SEND SOS
          </button>
        </div>

        <div className="action-card">
          <h2>Group Safety</h2>
          <p>
            Keep track of your group members and receive
            notifications if someone moves away from the group.
          </p>

          <button className="secondary-action">
            View Group →
          </button>
        </div>

      </section>

      <div className="back-home">
        ← Back to SafeYatra
      </div>

    </div>
  );
}

export default CrowdDashboard;
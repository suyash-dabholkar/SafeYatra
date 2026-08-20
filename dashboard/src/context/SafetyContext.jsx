import React, { createContext, useContext, useEffect, useState } from "react";

const SafetyContext = createContext();

const API_URL = "http://127.0.0.1:5000";

export function SafetyProvider({ children }) {
  const [activeTab, setActiveTab] = useState("admin");

  const [zones, setZones] = useState([
  {
    id: "Z-ENTRY",
    backendId: "cp_1",
    name: "Main Entry Gate",
    status: "safe",
    count: 0,
    exit: "NORTH",
  },
  {
    id: "Z-COURT",
    backendId: "zone_1",
    name: "Temple Courtyard",
    status: "safe",
    count: 0,
    exit: "WEST",
  },
  {
    id: "Z-ALLEY",
    backendId: "zone_2",
    name: "Narrow Alleyway",
    status: "safe",
    count: 0,
    exit: "WEST",
  },
]);

  const [trekkers, setTrekkers] = useState([
    {
      id: "T-101",
      name: "Aarav Sharma",
      lat: 32.2432,
      lng: 77.1892,
      currentCP: 2,
      totalCP: 4,
      battery: 84,
      status: "NORMAL",
    },
  ]);

  const [incidents, setIncidents] = useState([]);

  const [backendData, setBackendData] = useState(null);
  const [backendConnected, setBackendConnected] = useState(false);

  // --------------------------------------------------
  // GET LIVE DATA FROM FLASK
  // --------------------------------------------------

  const fetchLiveData = async () => {
    try {
      const response = await fetch(`${API_URL}/dashboard/live`);

      if (!response.ok) {
        throw new Error(`Backend returned ${response.status}`);
      }

      const data = await response.json();

      setBackendData(data);
      setBackendConnected(true);

      // ----------------------------------------------
      // INCIDENTS
      // ----------------------------------------------

      if (Array.isArray(data.active_incidents)) {
        setIncidents(data.active_incidents);
      }

      // ----------------------------------------------
      // ZONE STATUS
      // ----------------------------------------------

      if (data.zone_status) {
        setZones((previousZones) =>
          previousZones.map((zone) => {
            const backendZone = data.zone_status[zone.backendId];

            if (!backendZone) {
              return zone;
            }

            return {
              ...zone,
              status: backendZone.status,
              risk_score: backendZone.risk_score,
            };
          })
        );
      }

    } catch (error) {
      console.error("SafeYatra backend connection failed:", error);
      setBackendConnected(false);
    }
  };

  // Fetch immediately
  useEffect(() => {
    fetchLiveData();

    // Refresh every 2 seconds
    const interval = setInterval(fetchLiveData, 2000);

    return () => clearInterval(interval);
  }, []);

  // --------------------------------------------------
  // DEMO FALLBACK TRIGGERS
  // --------------------------------------------------

  const triggerFallDemo = () => {
    const newInc = {
      id: `INC-${Math.floor(Math.random() * 900 + 100)}`,
      tourist_id: "T-101",
      tourist_name: "Aarav Sharma",
      type: "fall",
      severity: "CRITICAL",
      location: "Ridge Trail",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "open",
      drone_dispatched: false,
    };

    setIncidents((prev) => [newInc, ...prev]);
  };

  const triggerCrowdSurge = () => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === "Z-COURT"
          ? {
              ...z,
              status: "danger",
              count: 320,
            }
          : z
      )
    );
  };

  const dispatchDrone = (incidentId) => {
    setIncidents((prev) =>
      prev.map((i) =>
        i.id === incidentId
          ? { ...i, drone_dispatched: true }
          : i
      )
    );
  };

  return (
    <SafetyContext.Provider
      value={{
        activeTab,
        setActiveTab,

        zones,
        setZones,

        trekkers,
        setTrekkers,

        incidents,
        setIncidents,

        backendData,
        backendConnected,
        fetchLiveData,

        triggerFallDemo,
        triggerCrowdSurge,
        dispatchDrone,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export const useSafety = () => useContext(SafetyContext);
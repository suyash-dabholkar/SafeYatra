// src/context/SafetyContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const SafetyContext = createContext();

export function SafetyProvider({ children }) {
  const [activeTab, setActiveTab] = useState('admin'); // 'admin', 'trekker', 'crowd', 'kiosk'
  
  // Master state
  const [zones, setZones] = useState([
    { id: 'Z-ENTRY', name: 'Main Entry Gate', status: 'safe', count: 42, exit: 'NORTH' },
    { id: 'Z-COURT', name: 'Temple Courtyard', status: 'warning', count: 180, exit: 'WEST' },
    { id: 'Z-ALLEY', name: 'Narrow Alleyway', status: 'safe', count: 65, exit: 'WEST' },
    { id: 'Z-EXIT1', name: 'West Safety Exit', status: 'safe', count: 12, exit: 'CLEAR' },
  ]);

  const [trekkers, setTrekkers] = useState([
    { id: 'T-101', name: 'Aarav Sharma', lat: 32.2432, lng: 77.1892, currentCP: 2, totalCP: 4, battery: 84, status: 'NORMAL' }
  ]);

  const [incidents, setIncidents] = useState([
    {
      id: 'INC-701',
      tourist_id: 'T-101',
      tourist_name: 'Aarav Sharma',
      type: 'fall',
      severity: 'CRITICAL',
      location: 'Ridge Trail Checkpoint 3',
      timestamp: '11:42 AM',
      status: 'open',
      drone_dispatched: false
    }
  ]);

  // Demo fallback triggers
  const triggerFallDemo = () => {
    const newInc = {
      id: `INC-${Math.floor(Math.random()*900 + 100)}`,
      tourist_id: 'T-101',
      tourist_name: 'Aarav Sharma',
      type: 'fall',
      severity: 'CRITICAL',
      location: 'Ridge Trail (32.2432° N, 77.1892° E)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'open',
      drone_dispatched: false
    };
    setIncidents(prev => [newInc, ...prev]);
  };

  const triggerCrowdSurge = () => {
    setZones(prev => prev.map(z => z.id === 'Z-COURT' ? { ...z, status: 'danger', count: 320 } : z));
  };

  const dispatchDrone = (incidentId) => {
    setIncidents(prev => prev.map(i => i.id === incidentId ? { ...i, drone_dispatched: true } : i));
  };

  return (
    <SafetyContext.Provider value={{
      activeTab, setActiveTab,
      zones, setZones,
      trekkers, setTrekkers,
      incidents, setIncidents,
      triggerFallDemo, triggerCrowdSurge, dispatchDrone
    }}>
      {children}
    </SafetyContext.Provider>
  );
}

export const useSafety = () => useContext(SafetyContext);
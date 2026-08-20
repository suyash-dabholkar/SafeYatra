// src/components/dashboard/AdminDashboard.jsx
import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { Shield, AlertTriangle, Radio, Send, Plus, MapPin, Compass } from 'lucide-react';

export function AdminDashboard() {
  const { zones, setZones, incidents, dispatchDrone, triggerFallDemo, triggerCrowdSurge } = useSafety();
  const [showCRUD, setShowCRUD] = useState(false);
  const [newZoneName, setNewZoneName] = useState('');

  const handleAddZone = (e) => {
    e.preventDefault();
    if (!newZoneName) return;
    setZones(prev => [...prev, {
      id: `Z-${Date.now().toString().slice(-4)}`,
      name: newZoneName,
      status: 'safe',
      count: 0,
      exit: 'WEST'
    }]);
    setNewZoneName('');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Top Bar with Demo Trigger Safety Net */}
      <div className="flex items-center justify-between bg-slate-900 text-white p-4 rounded-[24px] border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">SafeYatra Command Central</h1>
            <p className="text-xs text-slate-400">Integrated Crowd BLE & Remote LoRa Edge Monitor</p>
          </div>
        </div>

        {/* Pitch Safety Net Simulator Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={triggerFallDemo}
            className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition shadow-lg shadow-rose-900/50"
          >
            ⚡ Trigger Fall SOS
          </button>
          <button 
            onClick={triggerCrowdSurge}
            className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
          >
            ⚡ Trigger Crowd Surge
          </button>
          <button 
            onClick={() => setShowCRUD(!showCRUD)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-2 rounded-xl border border-slate-700 transition"
          >
            {showCRUD ? 'Hide Config' : '⚙️ Zone Graph CRUD'}
          </button>
        </div>
      </div>

      {/* Main Grid: Live Map + Incident Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Live Venue & Trail Map */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[28px] p-6 text-white shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Compass className="text-indigo-400 w-4 h-4" /> Live Venue Zones & Pathfinding Matrix
            </h2>
            <span className="text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-1 rounded-full font-mono">
              Dijkstra Engine Active
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-950/70 rounded-2xl border border-slate-800 min-h-[300px]">
            {zones.map((zone) => (
              <div 
                key={zone.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  zone.status === 'danger'
                    ? 'bg-rose-950/50 border-rose-600 shadow-lg shadow-rose-900/40 animate-pulse'
                    : zone.status === 'warning'
                    ? 'bg-amber-950/40 border-amber-600/60'
                    : 'bg-slate-900/90 border-slate-700/60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{zone.name}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      zone.status === 'danger' ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                    }`}>
                      {zone.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 font-mono">Occupancy: {zone.count} visitors</p>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Exit Route:</span>
                  <span className="font-bold text-emerald-400 font-mono">➡ {zone.exit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flashing Priority SOS Incident Feed */}
        <div className="bg-slate-900 border border-slate-800 rounded-[28px] p-6 text-white shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Radio className="text-rose-500 w-4 h-4 animate-ping" /> Incident Stream
            </h2>
            <span className="text-xs bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">
              {incidents.length} Events
            </span>
          </div>

          <div className="space-y-3 mt-4 overflow-y-auto max-h-[400px]">
            {incidents.map(inc => (
              <div 
                key={inc.id}
                className="bg-rose-950/30 border border-rose-600/70 p-3.5 rounded-2xl shadow-lg"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-rose-400">[{inc.type.toUpperCase()}] {inc.id}</span>
                  <span className="text-slate-400">{inc.timestamp}</span>
                </div>
                <p className="text-sm font-bold text-white mt-1">{inc.tourist_name}</p>
                <p className="text-xs text-slate-400">{inc.location}</p>

                <div className="mt-3 pt-2 border-t border-rose-900/40 flex items-center justify-between">
                  <span className="text-[11px] text-amber-300 font-mono">
                    Drone: {inc.drone_dispatched ? '🚁 EN ROUTE' : 'STANDBY'}
                  </span>
                  {!inc.drone_dispatched && (
                    <button 
                      onClick={() => dispatchDrone(inc.id)}
                      className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
                    >
                      <Send className="w-3 h-3" /> Dispatch Drone
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Optional Zone & Trail Route CRUD Forms */}
      {showCRUD && (
        <div className="bg-slate-900 border border-slate-800 rounded-[24px] p-6 text-white">
          <h3 className="font-bold text-sm mb-3">Zone Graph CRUD & Adjacency Configuration</h3>
          <form onSubmit={handleAddZone} className="flex gap-3 max-w-md">
            <input 
              value={newZoneName}
              onChange={e => setNewZoneName(e.target.value)}
              placeholder="New Zone Name (e.g. North Garden Gate)"
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs flex-1 text-white focus:outline-none focus:border-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Zone
            </button>
          </form>
        </div>
      )}

    </div>
  );
}
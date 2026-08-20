// src/components/trekker/TrekkerApp.jsx
import React, { useState } from 'react';
import { useSafety } from '../../context/SafetyContext';
import { ShieldCheck, AlertOctagon, Navigation, Share2, CheckCircle2, Circle, Radio, ArrowRight } from 'lucide-react';

export function TrekkerApp() {
  const { trekkers, incidents, triggerFallDemo } = useSafety();
  const trekker = trekkers[0];
  const activeIncident = incidents.find(i => i.tourist_id === trekker.id && i.status === 'open');
  const [sosSent, setSosSent] = useState(false);

  const checkpoints = [
    { name: 'Basecamp Trailhead', status: 'done', time: '08:15 AM' },
    { name: 'Pine Forest Rest Point', status: 'done', time: '10:00 AM' },
    { name: 'Ridge Viewpoint (CP 3)', status: activeIncident ? 'alert' : 'current', time: 'Active' },
    { name: 'Summit Glacier Hut', status: 'upcoming', time: 'Est. 02:30 PM' }
  ];

  return (
    <div className="max-w-md mx-auto bg-[#F7F5F0] min-h-screen p-5 text-slate-800 font-sans pb-24 shadow-2xl rounded-[32px] border border-amber-100">
      
      {/* Header */}
      <div className="flex items-center justify-between pt-2 pb-4">
        <div>
          <span className="text-xs text-amber-800/70 font-semibold tracking-wider uppercase">Trekker Live Shield</span>
          <h1 className="text-2xl font-bold text-slate-900">{trekker.name}</h1>
        </div>
        <div className="w-11 h-11 rounded-2xl bg-amber-200/60 border border-amber-300 flex items-center justify-center text-amber-900 font-bold text-sm shadow-sm">
          AS
        </div>
      </div>

      {/* Emergency Status Banner */}
      {activeIncident ? (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-[24px] shadow-sm mb-4 animate-pulse">
          <div className="flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-900 text-sm">Emergency Alert Active: {activeIncident.type.toUpperCase()}</h3>
              <p className="text-xs text-rose-700 mt-1">Control room alerted • Rescue drone dispatched • GPS tracked</p>
            </div>
          </div>
          
          {/* Dynamic Safe Reroute Guidance */}
          <div className="mt-3 bg-white/80 p-3 rounded-[16px] border border-rose-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 mb-1">
              <Navigation className="w-3.5 h-3.5" /> Suggested Safe Return Path (Dijkstra)
            </div>
            <p className="text-xs text-slate-700">Turn 35° North-East and follow the marked yellow trail pins back to Checkpoint 2.</p>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-amber-100/80 to-emerald-100/60 border border-amber-200/60 p-4 rounded-[24px] shadow-sm mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-800">Heltec LoRa Band: Connected</p>
              <h3 className="font-bold text-slate-900 text-sm">Trail Status: On Expected Path</h3>
            </div>
          </div>
          <span className="text-xs bg-white/80 px-2.5 py-1 rounded-full text-slate-600 font-mono font-semibold">
            {trekker.battery}% Batt
          </span>
        </div>
      )}

      {/* Checkpoint Progress List (Matching Inspiration UI) */}
      <div className="bg-white p-5 rounded-[26px] shadow-sm border border-slate-100 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-slate-900 text-sm">Trek Checkpoints Progress</h2>
          <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full">
            2 of 4 Visited
          </span>
        </div>

        {/* Visual Pill Gauge */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-5">
          <div className="bg-amber-500 h-full rounded-full w-1/2 transition-all duration-500"></div>
        </div>

        <div className="space-y-3.5">
          {checkpoints.map((cp, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                {cp.status === 'done' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ) : cp.status === 'alert' ? (
                  <AlertOctagon className="w-4 h-4 text-rose-500 animate-spin" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300" />
                )}
                <span className={`font-medium ${cp.status === 'done' ? 'text-slate-800 line-through text-slate-400' : cp.status === 'alert' ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                  {cp.name}
                </span>
              </div>
              <span className="text-slate-400 font-mono text-[11px]">{cp.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions: Family Share & Software SOS Fallback */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button 
          onClick={() => alert("Family Live Tracking Link Copied: https://safeyatra.in/track/T-101")}
          className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 p-3 rounded-[20px] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition"
        >
          <Share2 className="w-4 h-4 text-amber-600" /> Share Live Link
        </button>

        <button 
          onClick={() => { triggerFallDemo(); setSosSent(true); }}
          className="bg-rose-600 hover:bg-rose-500 text-white p-3 rounded-[20px] font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-200 transition active:scale-95"
        >
          <Radio className="w-4 h-4" /> {sosSent ? '✓ SOS Relayed' : 'Trigger SOS'}
        </button>
      </div>

    </div>
  );
  
}
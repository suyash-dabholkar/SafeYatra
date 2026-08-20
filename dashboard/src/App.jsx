import React, { useState } from 'react';
import './App.css';

// Fixed named imports with curly braces { }
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { TrekkerApp } from './components/trekker/TrekkerApp';
import { CrowdVisitorMode } from './components/crowd/CrowdVisitorMode';

// Pinterest-Themed Profile Component
function MyProfileScreen() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-950 p-8 rounded-3xl shadow-xl">
        {/* User Info Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-200">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-3xl font-bold text-amber-900 shadow-md">
            AS
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-bold text-slate-900">Aarav Sharma</h2>
            <p className="text-slate-500 font-medium">Lead Trekker & Remote Field Responder</p>
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-3">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-bold">
                ● Live On-Duty
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
                ID: YATRA-8492
              </span>
            </div>
          </div>
        </div>

        {/* Device & Sector Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
          <div className="bg-slate-800 p-5 rounded-2xl">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Connected Hardware</h3>
            <p className="text-lg font-bold text-slate-900 mt-1">Heltec LoRa V3 Edge Band</p>
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-emerald-600 font-bold">● 98% LoRa Mesh Signal</span>
              <span className="text-slate-600 font-semibold">Battery: 84%</span>
            </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-2xl">
            <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Current Assignment</h3>
            <p className="text-lg font-bold text-slate-900 mt-1">Ridge Viewpoint Trail (Zone 3)</p>
            <div className="flex justify-between items-center mt-3 text-xs">
              <span className="text-slate-600 font-semibold">Basecamp Sync: Active</span>
              <span className="text-slate-500">Ping: 2m ago</span>
            </div>
          </div>
        </div>

        {/* Emergency Contact Card */}
        <div className="bg-slate-800 p-5 rounded-2xl mt-5">
          <h3 className="text-xs font-bold tracking-wider text-slate-500 uppercase">Emergency Protocol Contact</h3>
          <div className="flex justify-between items-center mt-2">
            <div>
              <p className="font-bold text-slate-900">Himachal SAR Base Command</p>
              <p className="text-xs text-slate-500">Freq: 868.1 MHz / Channel 4</p>
            </div>
            <span className="px-3 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-full text-xs font-bold">
              SOS Standby
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  // Active mode state: 'admin' | 'trekker' | 'crowd' | 'profile'
  const [currentMode, setCurrentMode] = useState('admin');

  return (
    <div className="min-h-screen">
      {/* Top Floating Pinterest Navbar */}
      <header className="navbar">
        <div className="flex items-center gap-2 font-bold text-lg text-slate-900 mr-4">
          <span className="text-indigo-600">🛡️</span> SafeYatra
        </div>

        {/* Mode Tabs */}
        <button
          className={currentMode === 'admin' ? 'active' : ''}
          onClick={() => setCurrentMode('admin')}
        >
          Admin
        </button>

        <button
          className={currentMode === 'trekker' ? 'active' : ''}
          onClick={() => setCurrentMode('trekker')}
        >
          Trekker
        </button>

        <button
          className={currentMode === 'crowd' ? 'active' : ''}
          onClick={() => setCurrentMode('crowd')}
        >
          Crowd
        </button>

        <button
          className={currentMode === 'profile' ? 'active' : ''}
          onClick={() => setCurrentMode('profile')}
        >
          My Profile
        </button>
      </header>

      {/* Main Dynamic View */}
      <main className="p-4 md:p-6">
        {currentMode === 'admin' && <AdminDashboard />}
        {currentMode === 'trekker' && <TrekkerApp />}
        {currentMode === 'crowd' && <CrowdVisitorMode />}
        {currentMode === 'profile' && <MyProfileScreen />}
      </main>
    </div>
  );
}
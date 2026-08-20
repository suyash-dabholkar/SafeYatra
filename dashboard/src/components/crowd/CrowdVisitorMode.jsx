import React from "react";
import { useSafety } from "../../context/SafetyContext";
import {
  ShieldCheck,
  AlertTriangle,
  Bluetooth,
  MapPin,
  Navigation,
} from "lucide-react";

export function CrowdVisitorMode() {
  const { zones } = useSafety();

  const currentZone =
    zones.find((zone) => zone.id === "Z-COURT") || zones[0];

  const isDanger = currentZone.status === "danger";

  const person = {
    id: "T-101",
    name: "Aarav Sharma",
    bleStatus: "Connected",
  };

  const recommendedZone = {
    name: "West Safety Exit",
    id: "Z-EXIT1",
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F7F5F0] p-5 text-slate-800">

      {/* HEADER */}
      <header className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            SafeYatra Crowd Safety
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
            {person.name}
          </h1>

          <p className="text-xs text-slate-500">
            Visitor ID: {person.id}
          </p>
        </div>

        <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-3 py-2 rounded-full text-xs font-bold">
          <Bluetooth className="w-4 h-4" />
          {person.bleStatus}
        </div>
      </header>

      {/* CROWD ALERT */}
      <div
        className={`p-5 rounded-[28px] border mb-4 ${
          isDanger
            ? "bg-rose-50 border-rose-200"
            : "bg-emerald-50 border-emerald-200"
        }`}
      >
        <div className="flex items-center gap-3">

          {isDanger ? (
            <AlertTriangle className="w-9 h-9 text-rose-600" />
          ) : (
            <ShieldCheck className="w-9 h-9 text-emerald-600" />
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide">
              Current Zone
            </p>

            <h2 className="font-bold text-lg">
              {currentZone.name}
            </h2>
          </div>
        </div>

        <div className="mt-4">
          <p
            className={`font-bold ${
              isDanger ? "text-rose-700" : "text-emerald-700"
            }`}
          >
            {isDanger
              ? "HIGH CROWD DENSITY DETECTED"
              : "ZONE STATUS: SAFE"}
          </p>

          <p className="text-sm mt-1 text-slate-600">
            Crowd count: {currentZone.count}
          </p>
        </div>
      </div>

      {/* DESTINATION */}
      <div className="bg-white rounded-[28px] p-5 border border-slate-100 shadow-sm mb-4">

        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
          Recommended Safe Zone
        </p>

        <div className="flex items-center gap-3 mt-2">

          <div className="w-11 h-11 rounded-2xl bg-emerald-100 flex items-center justify-center">
            <Navigation className="w-5 h-5 text-emerald-700" />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {recommendedZone.name}
            </h2>

            <p className="text-xs text-slate-500">
              Destination: {recommendedZone.id}
            </p>
          </div>

        </div>
      </div>

      {/* MAP */}
      <div className="bg-white rounded-[30px] p-4 border border-slate-100 shadow-sm">

        <div className="flex items-center justify-between mb-3">

          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Safe Route
            </p>

            <h2 className="font-bold text-slate-900">
              Venue Navigation
            </h2>
          </div>

          <MapPin className="w-5 h-5 text-rose-500" />

        </div>

        {/* DEMO VENUE MAP */}
        <div className="relative h-[360px] rounded-[24px] bg-[#EEF1E8] overflow-hidden border border-slate-200">

          {/* SAFE ZONE */}
          <div className="absolute top-8 right-6 w-28 h-20 rounded-2xl bg-emerald-200 border-2 border-emerald-500 flex items-center justify-center text-center">
            <div>
              <p className="text-[10px] font-bold text-emerald-800">
                SAFE ZONE
              </p>
              <p className="text-xs font-bold text-emerald-900">
                West Exit
              </p>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="absolute bottom-12 left-7 w-36 h-24 rounded-2xl bg-rose-200 border-2 border-rose-500 flex items-center justify-center text-center">
            <div>
              <p className="text-[10px] font-bold text-rose-800">
                HIGH DENSITY
              </p>
              <p className="text-xs font-bold text-rose-900">
                Temple Courtyard
              </p>
            </div>
          </div>

          {/* USER */}
          <div className="absolute bottom-32 left-28 flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 border-4 border-white shadow-lg flex items-center justify-center">
              <MapPin className="w-5 h-5 text-white" />
            </div>

            <span className="mt-1 text-[10px] font-bold bg-white px-2 py-1 rounded-full shadow">
              YOU
            </span>
          </div>

          {/* ROUTE */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 360 360"
            preserveAspectRatio="none"
          >
            <path
              d="M 120 250 C 150 210, 180 190, 210 150 C 240 120, 280 90, 310 70"
              fill="none"
              stroke="#10B981"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="12 10"
            />
          </svg>

          {/* ROUTE LABEL */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-xl shadow text-xs font-bold text-emerald-700">
            Follow highlighted route
          </div>

        </div>

        {/* ROUTE DESCRIPTION */}
        <div className="mt-4 bg-emerald-50 rounded-2xl p-4">

          <p className="text-xs font-bold text-emerald-800">
            RECOMMENDED ROUTE
          </p>

          <p className="text-sm font-semibold text-slate-800 mt-1">
            Temple Courtyard → Narrow Alley → West Safety Exit
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Route calculated using the safest available path.
          </p>

        </div>

      </div>

    </div>
  );
}
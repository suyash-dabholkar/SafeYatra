"use client"

import { useState } from "react"
import {
  ShieldCheck,
  AlertOctagon,
  Navigation,
  Share2,
  CheckCircle2,
  Circle,
  MapPin,
  Mountain,
  Route,
  Heart,
  BatteryMedium,
  Gauge,
  LogOut,
} from "lucide-react"
import { useSafety } from "@/components/safety-store"
import { ClayCard, ClayButton, ClayBadge, ClayProgress, ClayIconWell } from "@/components/clay"
import { TrailMap } from "@/components/trail-map"
import { SosHoldButton } from "@/components/sos-hold-button"
import { cn } from "@/lib/utils"

export function TrekkerMode() {
  const { trekkers, checkpoints, totalKm, trekkerStats, triggerSOS, session, logout } = useSafety()
  const me = trekkers[0]
  const stats = trekkerStats(me.id)
  const [linkCopied, setLinkCopied] = useState(false)

  const sosActive = me.status === "sos"
  const pct = Math.round((stats.distanceKm / totalKm) * 100)

  function share() {
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 py-6 pb-10">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal">Trekker Shield</p>
          <h1 className="text-2xl font-extrabold text-ink">{session?.name ?? me.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1.5 text-[11px] font-bold text-ink-soft shadow-clay-sm">
            <BatteryMedium className="h-3.5 w-3.5 text-moss" />
            {me.battery}%
          </span>
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-[11px] font-bold text-ink-soft shadow-clay-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* Status banner */}
      {sosActive ? (
        <ClayCard tone="coral" className="mb-5">
          <div className="flex items-start gap-3">
            <ClayIconWell tone="coral" className="h-11 w-11 shrink-0">
              <AlertOctagon className="h-5 w-5" />
            </ClayIconWell>
            <div>
              <h3 className="text-sm font-extrabold text-coral">SOS active · help dispatched</h3>
              <p className="mt-1 text-xs text-ink-soft">Control room notified · live location shared · drone en route</p>
            </div>
          </div>
          <div className="mt-4 rounded-[var(--radius-clay-sm)] bg-surface p-4 shadow-clay-sm">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-extrabold text-teal">
              <Navigation className="h-3.5 w-3.5" /> Stay-safe instructions
            </p>
            <ol className="flex flex-col gap-1.5">
              {["Hold position — do not descend loose scree.", "Move to the flat rock shelf on your right.", "Keep your band LED visible to the drone."].map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-ink-soft">
                  <span className="font-bold text-teal">{i + 1}.</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </ClayCard>
      ) : (
        <ClayCard tone="moss" className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ClayIconWell tone="moss" className="h-11 w-11">
              <ShieldCheck className="h-5 w-5" />
            </ClayIconWell>
            <div>
              <p className="text-xs font-bold text-moss">Band connected · on expected trail</p>
              <h3 className="text-sm font-extrabold text-ink">Everything looks good</h3>
            </div>
          </div>
          <ClayBadge tone="moss">Live</ClayBadge>
        </ClayCard>
      )}

      {/* Key stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <BigStat icon={Route} tone="teal" label="Distance covered" value={`${stats.distanceKm} km`} sub={`of ${totalKm} km`} />
        <BigStat
          icon={MapPin}
          tone="amber"
          label="Next checkpoint"
          value={`${stats.distanceToNextKm} km`}
          sub={stats.nextCheckpoint ? stats.nextCheckpoint.name : "Summit reached"}
        />
        <BigStat icon={Gauge} tone="sky" label="ETA to next" value={`${stats.etaMin} min`} sub="at 3.2 km/h" />
        <BigStat icon={Heart} tone="coral" label="Heart rate" value={`${me.heartRate}`} sub="bpm · normal" />
      </div>

      {/* Trail progress */}
      <ClayCard className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <Mountain className="h-4 w-4 text-teal" /> Trail progress
          </h2>
          <ClayBadge tone="amber">{pct}% complete</ClayBadge>
        </div>
        <ClayProgress percent={pct} tone="teal" />
        <div className="mt-2 flex justify-between text-[11px] font-mono text-ink-faint">
          <span>Basecamp</span>
          <span>{stats.remainingKm} km to summit</span>
          <span>Summit</span>
        </div>
      </ClayCard>

      {/* Live map */}
      <ClayCard className="mb-5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <Navigation className="h-4 w-4 text-teal" /> Your position
          </h2>
          <ClayBadge tone="teal">GPS locked</ClayBadge>
        </div>
        <TrailMap trekkers={[me]} selectedId={me.id} />
      </ClayCard>

      {/* Checkpoint list */}
      <ClayCard className="mb-5">
        <h2 className="mb-3 flex items-center justify-between text-sm font-extrabold text-ink">
          Checkpoints
          <ClayBadge tone="moss">{stats.doneCount} of {checkpoints.length} reached</ClayBadge>
        </h2>
        <div className="flex flex-col gap-3">
          {checkpoints.map((cp, i) => {
            const done = cp.cumulativeKm <= stats.distanceKm + 0.05
            const current = !done && cp.id === stats.nextCheckpoint?.id
            return (
              <div key={cp.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  {done ? (
                    <CheckCircle2 className="h-4 w-4 text-moss" />
                  ) : current ? (
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <span className="absolute h-4 w-4 animate-ping rounded-full bg-teal opacity-50" />
                      <span className="relative h-2.5 w-2.5 rounded-full bg-teal" />
                    </span>
                  ) : (
                    <Circle className="h-4 w-4 text-ink-faint" />
                  )}
                  <div>
                    <span className={cn("block font-bold", done ? "text-ink-faint line-through" : current ? "text-ink" : "text-ink-soft")}>
                      {cp.name}
                    </span>
                    <span className="font-mono text-[10px] text-ink-faint">
                      {cp.cumulativeKm} km · {cp.elevation} m
                    </span>
                  </div>
                </div>
                {current && <ClayBadge tone="teal">{stats.distanceToNextKm} km away</ClayBadge>}
              </div>
            )
          })}
        </div>
      </ClayCard>

      {/* Actions */}
      <div className="mb-4 grid grid-cols-1 gap-3">
        <ClayButton tone="neutral" onClick={share} className="w-full py-3.5">
          <Share2 className="h-4 w-4 text-teal" />
          {linkCopied ? "Live link copied" : "Share live location link"}
        </ClayButton>
        <SosHoldButton onTrigger={() => triggerSOS(me.id)} fired={sosActive} />
      </div>

      <p className="px-4 text-center text-[11px] text-ink-faint">
        The band SOS works without signal — press &amp; hold 3 seconds to relay directly to the nearest post.
      </p>
    </main>
  )
}

function BigStat({
  icon: Icon,
  tone,
  label,
  value,
  sub,
}: {
  icon: typeof Route
  tone: "teal" | "amber" | "sky" | "coral"
  label: string
  value: string
  sub: string
}) {
  return (
    <ClayCard className="p-4">
      <ClayIconWell tone={tone} className="mb-3 h-10 w-10">
        <Icon className="h-4 w-4" />
      </ClayIconWell>
      <p className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{label}</p>
      <p className="text-xl font-extrabold text-ink">{value}</p>
      <p className="text-[11px] text-ink-soft">{sub}</p>
    </ClayCard>
  )
}

"use client"

import { useMemo, useState } from "react"
import {
  ShieldCheck,
  AlertTriangle,
  Navigation,
  DoorOpen,
  Users,
  Timer,
  LogOut,
  MapPin,
  Waves,
} from "lucide-react"
import { useSafety, type Zone } from "@/components/safety-store"
import { ClayCard, ClayBadge, ClayIconWell } from "@/components/clay"
import { MapCanvas, MapMarker } from "@/components/map-canvas"
import { SosHoldButton } from "@/components/sos-hold-button"
import { cn } from "@/lib/utils"

const zoneTone = { safe: "moss", warning: "amber", danger: "coral" } as const
const zoneHex = { safe: "#4f8a52", warning: "#d99436", danger: "#d5563f" } as const

// The visitor's own band is currently seen in this zone
const MY_ZONE_ID = "Z-COURT"
const MY_POS = { x: 50, y: 48 }

export function CrowdMode() {
  const { zones, session, logout, triggerSurge } = useSafety()
  const [selectedId, setSelectedId] = useState<string>(MY_ZONE_ID)
  const [sosFired, setSosFired] = useState(false)

  const myZone = zones.find((z) => z.id === MY_ZONE_ID) ?? zones[0]
  const selected = zones.find((z) => z.id === selectedId) ?? myZone

  const stats = useMemo(() => {
    const nearby = myZone.count
    const safeExits = zones.filter((z) => z.status === "safe").length
    const wait = Math.max(2, Math.round((myZone.count / myZone.capacity) * 14))
    return { nearby, safeExits, wait }
  }, [zones, myZone])

  const isDanger = myZone.status === "danger"
  const isWarning = myZone.status === "warning"

  return (
    <main className="mx-auto min-h-screen max-w-md bg-background px-5 py-6 pb-10">
      {/* Header */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-sky">Crowd Safety · Band mirror</p>
          <h1 className="text-2xl font-extrabold text-ink">Kedar Temple Fair</h1>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-2 text-[11px] font-bold text-ink-soft shadow-clay-sm"
        >
          <LogOut className="h-3.5 w-3.5" /> Exit
        </button>
      </header>

      {/* Live status banner */}
      <ClayCard tone={isDanger ? "coral" : isWarning ? "amber" : "moss"} className="mb-5">
        <div className="flex items-start gap-3">
          <ClayIconWell tone={isDanger ? "coral" : isWarning ? "amber" : "moss"} className="h-11 w-11 shrink-0">
            {isDanger || isWarning ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
          </ClayIconWell>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold text-ink">You are in {myZone.name}</h2>
              <ClayBadge tone={zoneTone[myZone.status]}>{myZone.status}</ClayBadge>
            </div>
            <p className="mt-1 text-xs text-ink-soft">
              {isDanger
                ? `High density. Follow your band's LED toward ${myZone.exit}.`
                : isWarning
                  ? "Getting crowded — stay aware and keep moving with the flow."
                  : "Comfortable density. Normal movement flow."}
            </p>
          </div>
        </div>
        {(isDanger || isWarning) && (
          <div className="mt-4 flex items-center gap-2 rounded-[var(--radius-clay-sm)] bg-surface px-4 py-3 text-sm font-extrabold text-ink shadow-clay-sm">
            <Navigation className="h-4 w-4 text-teal" />
            Nearest safe exit: {myZone.exit}
          </div>
        )}
      </ClayCard>

      {/* Stat strip */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatTile icon={Users} label="Near you" value={stats.nearby.toLocaleString()} tone="sky" />
        <StatTile icon={DoorOpen} label="Safe exits" value={`${stats.safeExits}`} tone="moss" />
        <StatTile icon={Timer} label="Exit wait" value={`${stats.wait}m`} tone="amber" />
      </div>

      {/* Live density map */}
      <ClayCard className="mb-5 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
            <Waves className="h-4 w-4 text-sky" /> Live density map
          </h2>
          <ClayBadge tone="sky">Updating</ClayBadge>
        </div>

        <MapCanvas variant="urban" className="aspect-square">
          {zones.map((z) => (
            <MapMarker key={z.id} x={z.pos.x} y={z.pos.y}>
              <button onClick={() => setSelectedId(z.id)} className="group relative block" aria-label={z.name}>
                {/* density bubble sized by count */}
                <span
                  className="block rounded-full opacity-70 transition-transform group-hover:scale-105"
                  style={{
                    width: `${z.radius * 3.4}px`,
                    height: `${z.radius * 3.4}px`,
                    background: zoneHex[z.status],
                  }}
                />
                {z.id === "Z-COURT" && (
                  <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-surface bg-coral text-surface shadow-clay-sm">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                )}
                <span
                  className={cn(
                    "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full px-2 py-0.5 text-[9px] font-extrabold shadow-clay-sm",
                    selectedId === z.id ? "bg-ink text-surface" : "bg-surface text-ink",
                  )}
                >
                  {z.count}
                </span>
                <span className="absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[9px] font-extrabold text-ink shadow-clay-sm">
                  {z.name}
                </span>
              </button>
            </MapMarker>
          ))}

          {/* "you are here" */}
          <MapMarker x={MY_POS.x} y={MY_POS.y}>
            <span className="relative flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal opacity-60" />
              <span className="relative inline-flex h-4 w-4 rounded-full border-2 border-surface bg-teal" />
            </span>
          </MapMarker>
        </MapCanvas>

        {/* legend */}
        <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-bold">
          <Legend hex={zoneHex.safe} label="Safe" />
          <Legend hex={zoneHex.warning} label="Filling" />
          <Legend hex={zoneHex.danger} label="Critical" />
          <span className="flex items-center gap-1.5 text-ink-soft">
            <span className="h-3 w-3 rounded-full border-2 border-ink bg-teal" /> You
          </span>
        </div>
      </ClayCard>

      {/* Selected zone detail */}
      <ClayCard tone={zoneTone[selected.status]} className="mb-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-extrabold text-ink">
            <MapPin className="h-4 w-4" /> {selected.name}
          </h3>
          <ClayBadge tone={zoneTone[selected.status]}>{selected.status}</ClayBadge>
        </div>
        <DensityBar zone={selected} />
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-ink-soft">
            {selected.count.toLocaleString()} / {selected.capacity.toLocaleString()} capacity
          </span>
          <span className="font-bold text-teal">Exit via {selected.exit}</span>
        </div>
      </ClayCard>

      {/* Zone list */}
      <div className="mb-5 flex flex-col gap-2.5">
        {zones.map((z) => (
          <button
            key={z.id}
            onClick={() => setSelectedId(z.id)}
            className={cn(
              "flex items-center gap-3 rounded-[var(--radius-clay-sm)] bg-surface px-4 py-3 text-left transition-all",
              selectedId === z.id ? "shadow-clay-pressed" : "shadow-clay-sm",
            )}
          >
            <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: zoneHex[z.status] }} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">{z.name}</p>
              <DensityBar zone={z} slim />
            </div>
            <span className="shrink-0 font-mono text-[11px] text-ink-soft">{z.count}</span>
          </button>
        ))}
      </div>

      {/* SOS */}
      <SosHoldButton onTrigger={() => setSosFired(true)} fired={sosFired} />
      <p className="mt-3 px-4 text-center text-[11px] text-ink-faint">
        Your physical band SOS also works offline — press &amp; hold 3 seconds to alert the nearest security post
        directly.
      </p>

      {/* Demo aid */}
      <button
        onClick={() => triggerSurge("Z-COURT")}
        className="mx-auto mt-4 block rounded-full bg-surface px-3 py-1.5 text-[10px] font-bold text-ink-faint shadow-clay-sm"
      >
        Demo: simulate a surge in your zone
      </button>
    </main>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Users
  label: string
  value: string
  tone: "sky" | "moss" | "amber"
}) {
  return (
    <ClayCard className="flex flex-col items-center gap-1 p-3 text-center">
      <ClayIconWell tone={tone} className="mb-1 h-9 w-9">
        <Icon className="h-4 w-4" />
      </ClayIconWell>
      <span className="text-lg font-extrabold text-ink">{value}</span>
      <span className="text-[10px] font-bold uppercase tracking-wide text-ink-faint">{label}</span>
    </ClayCard>
  )
}

function DensityBar({ zone, slim = false }: { zone: Zone; slim?: boolean }) {
  const pct = Math.min(100, Math.round((zone.count / zone.capacity) * 100))
  const fill = { safe: "bg-moss", warning: "bg-amber", danger: "bg-coral" }[zone.status]
  return (
    <div className={cn("w-full overflow-hidden rounded-full bg-surface-sunken shadow-clay-inset", slim ? "h-1.5 mt-1.5" : "h-3")}>
      <div className={cn("h-full rounded-full transition-all duration-500", fill)} style={{ width: `${pct}%` }} />
    </div>
  )
}

function Legend({ hex, label }: { hex: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-soft">
      <span className="h-3 w-3 rounded-full" style={{ background: hex }} />
      {label}
    </span>
  )
}

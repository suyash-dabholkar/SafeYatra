"use client"

import { useState } from "react"
import {
  Shield,
  Mountain,
  Users,
  Radio,
  Send,
  CheckCheck,
  Zap,
  LogOut,
  Battery,
  Heart,
  Route,
  MapPin,
  Bell,
  Plane,
  Activity,
  Signal,
  AlertTriangle,
} from "lucide-react"
import { useSafety, type Trekker, type Zone, type Incident } from "@/components/safety-store"
import { ClayCard, ClayButton, ClayBadge, ClayIconWell } from "@/components/clay"
import { TrailMap } from "@/components/trail-map"
import { MapCanvas, MapMarker } from "@/components/map-canvas"
import { cn } from "@/lib/utils"

const zoneTone = { safe: "moss", warning: "amber", danger: "coral" } as const
const zoneHex = { safe: "#4f8a52", warning: "#d99436", danger: "#d5563f" } as const
const statusTone: Record<Trekker["status"], "moss" | "amber" | "coral" | "sky"> = {
  "on-trail": "moss",
  resting: "sky",
  deviating: "amber",
  sos: "coral",
}

export function AdminDashboard() {
  const {
    trekkers,
    zones,
    incidents,
    trekkerStats,
    triggerSOS,
    triggerSurge,
    acknowledgeIncident,
    dispatchDrone,
    resolveIncident,
    logout,
  } = useSafety()

  const [view, setView] = useState<"trekker" | "crowd">("trekker")
  const [selectedTrekker, setSelectedTrekker] = useState<string>(trekkers[0]?.id)

  const openIncidents = incidents.filter((i) => i.status !== "resolved")
  const totalVisitors = zones.reduce((a, z) => a + z.count, 0)
  const dronesOut = incidents.filter((i) => i.droneStatus === "en-route").length

  return (
    <main className="min-h-screen bg-background px-4 py-5 md:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Command bar */}
        <ClayCard className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ClayIconWell tone="teal" className="h-12 w-12">
              <Shield className="h-6 w-6" />
            </ClayIconWell>
            <div>
              <h1 className="text-lg font-extrabold text-ink">SafeYatra Command</h1>
              <p className="flex items-center gap-1.5 text-xs text-ink-soft">
                <Signal className="h-3 w-3 text-moss" /> Live · Himalaya North grid
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ClayButton tone="coral" onClick={() => triggerSOS(selectedTrekker)}>
              <Zap className="h-3.5 w-3.5" /> Sim SOS
            </ClayButton>
            <ClayButton tone="amber" onClick={() => triggerSurge("Z-COURT")}>
              <Zap className="h-3.5 w-3.5" /> Sim surge
            </ClayButton>
            <button
              onClick={logout}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2.5 text-xs font-bold text-ink-soft shadow-clay-sm"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </ClayCard>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <SummaryStat icon={Mountain} tone="teal" label="Active trekkers" value={`${trekkers.length}`} />
          <SummaryStat icon={Users} tone="sky" label="Visitors on-site" value={totalVisitors.toLocaleString()} />
          <SummaryStat
            icon={Bell}
            tone={openIncidents.length ? "coral" : "moss"}
            label="Open incidents"
            value={`${openIncidents.length}`}
          />
          <SummaryStat icon={Plane} tone="amber" label="Drones deployed" value={`${dronesOut}`} />
        </div>

        {/* View switch */}
        <div className="flex gap-2">
          {(["trekker", "crowd"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-all",
                view === v ? "bg-teal text-teal-fg shadow-clay-sm" : "bg-surface text-ink-soft shadow-clay-inset",
              )}
            >
              {v === "trekker" ? <Mountain className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
              {v === "trekker" ? "Trekker operations" : "Crowd operations"}
            </button>
          ))}
        </div>

        {view === "trekker" ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Live trekker map */}
            <ClayCard className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
                  <Route className="h-4 w-4 text-teal" /> Live trail — all trekkers
                </h2>
                <ClayBadge tone="teal">Paths tracked</ClayBadge>
              </div>
              <TrailMap
                trekkers={trekkers}
                selectedId={selectedTrekker}
                onSelect={setSelectedTrekker}
                showLabels
                className="aspect-[4/3]"
              />
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {trekkers.map((t) => (
                  <TrekkerRow
                    key={t.id}
                    trekker={t}
                    stats={trekkerStats(t.id)}
                    active={selectedTrekker === t.id}
                    onClick={() => setSelectedTrekker(t.id)}
                  />
                ))}
              </div>
            </ClayCard>

            {/* Incident stream with SOS handling */}
            <IncidentStream
              incidents={incidents}
              onAck={acknowledgeIncident}
              onDrone={dispatchDrone}
              onResolve={resolveIncident}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {/* Crowd density map */}
            <ClayCard className="lg:col-span-2">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
                  <Activity className="h-4 w-4 text-sky" /> Venue density — live
                </h2>
                <ClayBadge tone="sky">Pathfinding on</ClayBadge>
              </div>
              <MapCanvas variant="urban" className="aspect-[4/3]">
                {zones.map((z) => (
                  <MapMarker key={z.id} x={z.pos.x} y={z.pos.y}>
                    <div className="relative flex flex-col items-center">
                      <span
                        className="rounded-full opacity-70"
                        style={{ width: `${z.radius * 3}px`, height: `${z.radius * 3}px`, background: zoneHex[z.status] }}
                      />
                      {z.id === "Z-COURT" && (
                        <span className="absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-surface bg-coral text-surface shadow-clay-sm">
                          <AlertTriangle className="h-4 w-4" />
                        </span>
                      )}
                      <span className="mt-1 whitespace-nowrap rounded-full bg-surface px-2 py-0.5 text-[9px] font-extrabold text-ink shadow-clay-sm">
                        {z.name} · {z.count}
                      </span>
                      {z.id === "Z-COURT" && <span className="mt-1 rounded-full bg-coral px-1.5 py-0.5 text-[8px] font-extrabold uppercase text-surface">Crowded · Crash</span>}
                    </div>
                  </MapMarker>
                ))}
              </MapCanvas>
              <div className="mt-4 flex flex-col gap-2.5">
                {zones.map((z) => (
                  <ZoneRow key={z.id} zone={z} onSurge={() => triggerSurge(z.id)} />
                ))}
              </div>
            </ClayCard>

            <IncidentStream
              incidents={incidents}
              onAck={acknowledgeIncident}
              onDrone={dispatchDrone}
              onResolve={resolveIncident}
            />
          </div>
        )}
      </div>
    </main>
  )
}

/* ---------------- sub-components ---------------- */

function SummaryStat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Users
  tone: "teal" | "sky" | "coral" | "moss" | "amber"
  label: string
  value: string
}) {
  return (
    <ClayCard className="flex items-center gap-3">
      <ClayIconWell tone={tone} className="h-12 w-12 shrink-0">
        <Icon className="h-5 w-5" />
      </ClayIconWell>
      <div>
        <p className="text-2xl font-extrabold leading-none text-ink">{value}</p>
        <p className="mt-1 text-[11px] font-bold uppercase tracking-wide text-ink-faint">{label}</p>
      </div>
    </ClayCard>
  )
}

function TrekkerRow({
  trekker,
  stats,
  active,
  onClick,
}: {
  trekker: Trekker
  stats: ReturnType<ReturnType<typeof useSafety>["trekkerStats"]>
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col gap-2 rounded-[var(--radius-clay-sm)] bg-surface p-3.5 text-left transition-all",
        active ? "shadow-clay-pressed" : "shadow-clay-sm",
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full text-[10px] font-extrabold text-surface shadow-clay-sm"
            style={{ background: zoneHex[trekker.status === "sos" ? "danger" : "safe"] }}>
            {trekker.name.split(" ").map((n) => n[0]).join("")}
          </span>
          <div>
            <p className="text-sm font-bold text-ink">{trekker.name}</p>
            <p className="font-mono text-[10px] text-ink-faint">{trekker.id}</p>
          </div>
        </div>
        <ClayBadge tone={statusTone[trekker.status]}>{trekker.status}</ClayBadge>
      </div>
      <div className="grid grid-cols-3 gap-1 text-[11px]">
        <Metric icon={Route} value={`${stats.distanceKm}km`} />
        <Metric icon={Battery} value={`${trekker.battery}%`} />
        <Metric icon={Heart} value={`${trekker.heartRate}`} />
      </div>
      <p className="flex items-center gap-1 text-[11px] text-ink-soft">
        <MapPin className="h-3 w-3 text-teal" />
        {stats.nextCheckpoint ? `${stats.distanceToNextKm}km to ${stats.nextCheckpoint.name}` : "Summit reached"}
      </p>
    </button>
  )
}

function Metric({ icon: Icon, value }: { icon: typeof Route; value: string }) {
  return (
    <span className="inline-flex items-center gap-1 font-bold text-ink-soft">
      <Icon className="h-3 w-3 text-ink-faint" />
      {value}
    </span>
  )
}

function ZoneRow({ zone, onSurge }: { zone: Zone; onSurge: () => void }) {
  const pct = Math.min(100, Math.round((zone.count / zone.capacity) * 100))
  const fill = { safe: "bg-moss", warning: "bg-amber", danger: "bg-coral" }[zone.status]
  return (
    <div className="flex items-center gap-3 rounded-[var(--radius-clay-sm)] bg-surface px-4 py-3 shadow-clay-sm">
      <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: zoneHex[zone.status] }} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="truncate text-sm font-bold text-ink">{zone.name}</p>
          <span className="font-mono text-[11px] text-ink-soft">
            {zone.count}/{zone.capacity}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-sunken shadow-clay-inset">
          <div className={cn("h-full rounded-full transition-all duration-500", fill)} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="hidden text-[11px] font-bold text-teal sm:block">→ {zone.exit}</span>
      <button
        onClick={onSurge}
        className="rounded-full bg-surface px-2 py-1 text-[9px] font-bold text-ink-faint shadow-clay-sm"
      >
        surge
      </button>
    </div>
  )
}

function IncidentStream({
  incidents,
  onAck,
  onDrone,
  onResolve,
}: {
  incidents: Incident[]
  onAck: (id: string) => void
  onDrone: (id: string) => void
  onResolve: (id: string) => void
}) {
  const open = incidents.filter((i) => i.status !== "resolved")
  return (
    <ClayCard tone="neutral" className="flex flex-col">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-ink">
          <Radio className="h-4 w-4 text-coral" /> Incident stream
        </h2>
        <ClayBadge tone={open.length ? "coral" : "moss"}>{open.length} open</ClayBadge>
      </div>

      <div className="flex max-h-[560px] flex-col gap-3 overflow-y-auto pr-1">
        {incidents.length === 0 && (
          <div className="rounded-[var(--radius-clay-sm)] bg-surface p-8 text-center shadow-clay-inset">
            <ShieldPulse />
            <p className="mt-3 text-xs text-ink-faint">All clear. No active incidents — use the Sim buttons to test response.</p>
          </div>
        )}

        {incidents.map((inc) => {
          const resolved = inc.status === "resolved"
          return (
            <ClayCard key={inc.id} tone={resolved ? "neutral" : "coral"} className="p-4">
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <span className="font-mono font-extrabold text-coral">
                  [{inc.type.toUpperCase()}] {inc.id}
                </span>
                <span className="text-ink-faint">{inc.timestamp}</span>
              </div>
              <p className="text-sm font-extrabold text-ink">{inc.subjectName}</p>
              <p className="text-xs text-ink-soft">{inc.location}</p>

              {inc.suggestedRoute && !resolved && (
                <div className="mt-3 rounded-[var(--radius-clay-sm)] bg-surface p-3 shadow-clay-sm">
                  <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wide text-teal">Response protocol</p>
                  <ol className="flex flex-col gap-1">
                    {inc.suggestedRoute.map((s, i) => (
                      <li key={i} className="flex gap-1.5 text-[11px] text-ink-soft">
                        <span className="font-bold text-teal">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
                <ClayBadge tone={resolved ? "moss" : "amber"}>{inc.status}</ClayBadge>
                {inc.droneStatus !== "idle" && (
                  <ClayBadge tone="sky" icon={Plane}>
                    drone {inc.droneStatus}
                  </ClayBadge>
                )}
                {!resolved && (
                  <div className="ml-auto flex flex-wrap gap-1.5">
                    {inc.status === "open" && (
                      <ActionChip label="Acknowledge" onClick={() => onAck(inc.id)} />
                    )}
                    {inc.droneStatus === "idle" && (
                      <ActionChip label="Dispatch drone" icon={Send} tone="amber" onClick={() => onDrone(inc.id)} />
                    )}
                    <ActionChip label="Resolve" icon={CheckCheck} tone="moss" onClick={() => onResolve(inc.id)} />
                  </div>
                )}
              </div>
            </ClayCard>
          )
        })}
      </div>
    </ClayCard>
  )
}

function ActionChip({
  label,
  icon: Icon,
  tone = "neutral",
  onClick,
}: {
  label: string
  icon?: typeof Send
  tone?: "neutral" | "amber" | "moss"
  onClick: () => void
}) {
  const tones = {
    neutral: "bg-surface text-teal",
    amber: "bg-amber text-amber-fg",
    moss: "bg-moss text-moss-fg",
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1.5 text-[11px] font-bold shadow-clay-sm active:shadow-clay-pressed",
        tones[tone],
      )}
    >
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </button>
  )
}

function ShieldPulse() {
  return (
    <span className="relative mx-auto flex h-12 w-12 items-center justify-center">
      <span className="absolute h-12 w-12 animate-ping rounded-full bg-moss opacity-30" />
      <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-moss-soft text-moss shadow-clay-sm">
        <Shield className="h-5 w-5" />
      </span>
    </span>
  )
}

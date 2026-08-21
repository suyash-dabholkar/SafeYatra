"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

/* ================================================================== */
/*  SafeYatra store — single source of truth for every surface.        */
/*  In-memory demo data with a live "tick" that nudges trekkers along   */
/*  the trail so the maps feel alive. Swap the initial state + setters  */
/*  for real API calls later; the shape below is the contract.          */
/* ================================================================== */

export type Role = "user" | "admin"
export type UserMode = "trekker" | "crowd"

export type Session = {
  role: Role
  /** only meaningful when role === "user" */
  mode: UserMode | null
  name: string
  handle: string
}

export type Point = { x: number; y: number } // normalized 0–100 map space

export type Checkpoint = {
  id: string
  name: string
  pos: Point
  cumulativeKm: number
  elevation: number
}

export type TrekkerStatus = "on-trail" | "resting" | "deviating" | "sos"

export type Trekker = {
  id: string
  name: string
  handle: string
  color: Tone
  pos: Point
  progress: number // 0–1 along the trail
  battery: number
  heartRate: number
  status: TrekkerStatus
  lastPing: string
}

export type Zone = {
  id: string
  name: string
  pos: Point
  radius: number
  count: number
  capacity: number
  status: "safe" | "warning" | "danger"
  exit: string
}

export type Incident = {
  id: string
  subjectId: string
  subjectName: string
  type: "SOS" | "fall" | "route-deviation" | "crowd-surge"
  severity: "critical" | "high" | "medium"
  location: string
  timestamp: string
  status: "open" | "acknowledged" | "resolved"
  droneStatus: "idle" | "en-route" | "on-scene"
  suggestedRoute: string[] | null
}

type Tone = "teal" | "moss" | "amber" | "coral" | "sky"

const TOTAL_KM = 12.4

/* ---- static trail geometry (a winding mountain trail) ------------- */
export const TRAIL_PATH: Point[] = [
  { x: 12, y: 86 },
  { x: 22, y: 74 },
  { x: 30, y: 62 },
  { x: 44, y: 58 },
  { x: 52, y: 46 },
  { x: 63, y: 40 },
  { x: 70, y: 28 },
  { x: 82, y: 20 },
  { x: 88, y: 12 },
]

const CHECKPOINTS: Checkpoint[] = [
  { id: "CP1", name: "Basecamp Trailhead", pos: { x: 12, y: 86 }, cumulativeKm: 0, elevation: 2100 },
  { id: "CP2", name: "Pine Forest Rest", pos: { x: 30, y: 62 }, cumulativeKm: 3.2, elevation: 2680 },
  { id: "CP3", name: "Ridge Viewpoint", pos: { x: 52, y: 46 }, cumulativeKm: 6.5, elevation: 3240 },
  { id: "CP4", name: "Glacier Crossing", pos: { x: 70, y: 28 }, cumulativeKm: 9.4, elevation: 3810 },
  { id: "CP5", name: "Summit Hut", pos: { x: 88, y: 12 }, cumulativeKm: TOTAL_KM, elevation: 4260 },
]

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/** Position along the polyline trail for progress p in [0,1]. */
export function trailPosition(p: number): Point {
  const clamped = Math.min(1, Math.max(0, p))
  const seg = clamped * (TRAIL_PATH.length - 1)
  const i = Math.min(TRAIL_PATH.length - 2, Math.floor(seg))
  const t = seg - i
  return {
    x: lerp(TRAIL_PATH[i].x, TRAIL_PATH[i + 1].x, t),
    y: lerp(TRAIL_PATH[i].y, TRAIL_PATH[i + 1].y, t),
  }
}

function nowTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

/* ---- store context ------------------------------------------------ */

type Store = {
  session: Session | null
  login: (role: Role, name?: string) => void
  setMode: (mode: UserMode) => void
  logout: () => void

  totalKm: number
  checkpoints: Checkpoint[]
  trekkers: Trekker[]
  zones: Zone[]
  incidents: Incident[]

  /** derived helpers */
  trekkerStats: (id: string) => {
    distanceKm: number
    remainingKm: number
    nextCheckpoint: Checkpoint | null
    distanceToNextKm: number
    doneCount: number
    etaMin: number
  }

  triggerSOS: (trekkerId: string) => void
  acknowledgeIncident: (id: string) => void
  dispatchDrone: (id: string) => void
  resolveIncident: (id: string) => void
  triggerSurge: (zoneId: string) => void
}

const SafetyContext = createContext<Store | null>(null)

const seedTrekkers: Trekker[] = [
  { id: "T-101", name: "Aarav Sharma", handle: "aarav", color: "teal", pos: trailPosition(0.52), progress: 0.52, battery: 84, heartRate: 96, status: "on-trail", lastPing: nowTime() },
  { id: "T-102", name: "Meera Iyer", handle: "meera", color: "moss", pos: trailPosition(0.34), progress: 0.34, battery: 61, heartRate: 88, status: "on-trail", lastPing: nowTime() },
  { id: "T-103", name: "Kabir Rao", handle: "kabir", color: "sky", pos: trailPosition(0.71), progress: 0.71, battery: 45, heartRate: 104, status: "resting", lastPing: nowTime() },
  { id: "T-104", name: "Diya Nair", handle: "diya", color: "amber", pos: trailPosition(0.18), progress: 0.18, battery: 92, heartRate: 82, status: "on-trail", lastPing: nowTime() },
]

const seedZones: Zone[] = [
  { id: "Z-ENTRY", name: "Zone 1", pos: { x: 22, y: 74 }, radius: 13, count: 420, capacity: 900, status: "safe", exit: "North Gate" },
  { id: "Z-COURT", name: "Zone 2", pos: { x: 52, y: 44 }, radius: 22, count: 1600, capacity: 1300, status: "danger", exit: "West Gate" },
  { id: "Z-ALLEY", name: "Zone 3", pos: { x: 72, y: 66 }, radius: 10, count: 640, capacity: 750, status: "warning", exit: "West Gate" },
  { id: "Z-GHAT", name: "Zone 4", pos: { x: 38, y: 24 }, radius: 12, count: 210, capacity: 600, status: "safe", exit: "East Ramp" },
  { id: "Z-EXITW", name: "Zone 5", pos: { x: 80, y: 26 }, radius: 8, count: 60, capacity: 400, status: "safe", exit: "Clear" },
]

function zoneStatusFor(count: number, capacity: number): Zone["status"] {
  const r = count / capacity
  if (r >= 0.92) return "danger"
  if (r >= 0.75) return "warning"
  return "safe"
}

export function SafetyProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [trekkers, setTrekkers] = useState<Trekker[]>(seedTrekkers)
  const [zones, setZones] = useState<Zone[]>(seedZones)
  const [incidents, setIncidents] = useState<Incident[]>([])

  /* live movement tick */
  useEffect(() => {
    const id = setInterval(() => {
      setTrekkers((prev) =>
        prev.map((t) => {
          if (t.status === "sos" || t.status === "resting") return { ...t, lastPing: nowTime() }
          const next = Math.min(0.99, t.progress + Math.random() * 0.006)
          return {
            ...t,
            progress: next,
            pos: trailPosition(next),
            heartRate: Math.max(72, Math.min(130, t.heartRate + Math.round((Math.random() - 0.5) * 6))),
            lastPing: nowTime(),
          }
        }),
      )
      setZones((prev) =>
        prev.map((z) => {
          const drift = Math.round((Math.random() - 0.45) * 40)
          const count = Math.max(20, Math.min(z.capacity + 200, z.count + drift))
          return { ...z, count, status: zoneStatusFor(count, z.capacity) }
        }),
      )
    }, 2200)
    return () => clearInterval(id)
  }, [])

  const login = (role: Role, name = role === "admin" ? "Control Room" : "Aarav Sharma") =>
    setSession({ role, mode: null, name, handle: name.toLowerCase().replace(/\s+/g, "") })
  const setMode = (mode: UserMode) => setSession((s) => (s ? { ...s, mode } : s))
  const logout = () => setSession(null)

  const trekkerStats: Store["trekkerStats"] = (trekkerId) => {
    const t = trekkers.find((x) => x.id === trekkerId)
    const distanceKm = t ? +(t.progress * TOTAL_KM).toFixed(1) : 0
    const remainingKm = +(TOTAL_KM - distanceKm).toFixed(1)
    const doneCount = CHECKPOINTS.filter((c) => c.cumulativeKm <= distanceKm + 0.05).length
    const nextCheckpoint = CHECKPOINTS.find((c) => c.cumulativeKm > distanceKm) ?? null
    const distanceToNextKm = nextCheckpoint ? +(nextCheckpoint.cumulativeKm - distanceKm).toFixed(1) : 0
    const etaMin = Math.round((distanceToNextKm / 3.2) * 60) // avg 3.2 km/h uphill
    return { distanceKm, remainingKm, nextCheckpoint, distanceToNextKm, doneCount, etaMin }
  }

  const raiseIncident = (i: Omit<Incident, "id" | "timestamp" | "status" | "droneStatus">) =>
    setIncidents((prev) => [
      { ...i, id: `INC-${Math.floor(Math.random() * 900 + 100)}`, timestamp: nowTime(), status: "open", droneStatus: "idle" },
      ...prev,
    ])

  const triggerSOS: Store["triggerSOS"] = (trekkerId) => {
    const t = trekkers.find((x) => x.id === trekkerId)
    if (!t) return
    setTrekkers((prev) => prev.map((x) => (x.id === trekkerId ? { ...x, status: "sos" } : x)))
    raiseIncident({
      subjectId: trekkerId,
      subjectName: t.name,
      type: "SOS",
      severity: "critical",
      location: "Ridge Trail · Checkpoint 3 area",
      suggestedRoute: [
        "Hold position — do not descend the loose scree.",
        "Move 20m to the flat rock shelf on your right.",
        "Face uphill and keep your band LED visible to the drone.",
      ],
    })
  }

  const acknowledgeIncident: Store["acknowledgeIncident"] = (id) =>
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: "acknowledged" } : i)))
  const dispatchDrone: Store["dispatchDrone"] = (id) =>
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, droneStatus: "en-route" } : i)))
  const resolveIncident: Store["resolveIncident"] = (id) => {
    setIncidents((prev) => prev.map((i) => (i.id === id ? { ...i, status: "resolved" } : i)))
    setIncidents((prev) => {
      const inc = prev.find((i) => i.id === id)
      if (inc) setTrekkers((tp) => tp.map((t) => (t.id === inc.subjectId ? { ...t, status: "on-trail" } : t)))
      return prev
    })
  }

  const triggerSurge: Store["triggerSurge"] = (zoneId) => {
    setZones((prev) =>
      prev.map((z) =>
        z.id === zoneId ? { ...z, count: z.capacity + 120, status: "danger" as const } : z,
      ),
    )
    const z = zones.find((x) => x.id === zoneId)
    if (z)
      raiseIncident({
        subjectId: zoneId,
        subjectName: z.name,
        type: "crowd-surge",
        severity: "high",
        location: z.name,
        suggestedRoute: [`Open ${z.exit} fully`, "Hold inflow at feeder gates", "Broadcast redirect on visitor bands"],
      })
  }

  const value = useMemo<Store>(
    () => ({
      session,
      login,
      setMode,
      logout,
      totalKm: TOTAL_KM,
      checkpoints: CHECKPOINTS,
      trekkers,
      zones,
      incidents,
      trekkerStats,
      triggerSOS,
      acknowledgeIncident,
      dispatchDrone,
      resolveIncident,
      triggerSurge,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [session, trekkers, zones, incidents],
  )

  return <SafetyContext.Provider value={value}>{children}</SafetyContext.Provider>
}

export function useSafety() {
  const ctx = useContext(SafetyContext)
  if (!ctx) throw new Error("useSafety must be used inside <SafetyProvider>")
  return ctx
}

export { CHECKPOINTS, TOTAL_KM }

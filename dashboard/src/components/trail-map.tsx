"use client"

import { MapPin, Flag } from "lucide-react"
import { CHECKPOINTS, TRAIL_PATH, type Trekker } from "@/components/safety-store"
import { MapCanvas, MapMarker } from "@/components/map-canvas"
import { cn } from "@/lib/utils"

const trekkerHex: Record<string, string> = {
  teal: "#2b7c72",
  moss: "#4f8a52",
  sky: "#3f77b0",
  amber: "#d99436",
  coral: "#d5563f",
}

const trailD = TRAIL_PATH.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ")

export function TrailMap({
  trekkers,
  className,
  selectedId,
  onSelect,
  showLabels = false,
}: {
  trekkers: Trekker[]
  className?: string
  selectedId?: string
  onSelect?: (id: string) => void
  showLabels?: boolean
}) {
  return (
    <MapCanvas variant="trail" className={cn("aspect-square", className)}>
      {/* trail line + checkpoints share the 0–100 viewBox */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        <path d={trailD} fill="none" stroke="#f4efe6" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d={trailD}
          fill="none"
          stroke="#2b7c72"
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="0.5 2.4"
        />
      </svg>

      {/* checkpoints */}
      {CHECKPOINTS.map((cp, i) => {
        const isLast = i === CHECKPOINTS.length - 1
        return (
          <MapMarker key={cp.id} x={cp.pos.x} y={cp.pos.y}>
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface shadow-clay-sm",
                  isLast ? "bg-amber text-amber-fg" : "bg-surface text-teal",
                )}
              >
                {isLast ? <Flag className="h-3 w-3" /> : <MapPin className="h-3 w-3" />}
              </span>
              {showLabels && (
                <span className="mt-1 whitespace-nowrap rounded-full bg-surface px-1.5 py-0.5 text-[8px] font-bold text-ink shadow-clay-sm">
                  {cp.name}
                </span>
              )}
            </div>
          </MapMarker>
        )
      })}

      {/* trekkers */}
      {trekkers.map((t) => {
        const active = selectedId === t.id
        const isSos = t.status === "sos"
        return (
          <MapMarker key={t.id} x={t.pos.x} y={t.pos.y}>
            <button
              onClick={onSelect ? () => onSelect(t.id) : undefined}
              className="relative block"
              aria-label={t.name}
            >
              {isSos && (
                <span className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 animate-ping rounded-full bg-coral opacity-70" />
              )}
              <span
                className={cn(
                  "relative flex h-6 w-6 items-center justify-center rounded-full border-2 text-[9px] font-extrabold text-surface shadow-clay-sm",
                  active ? "border-ink scale-125" : "border-surface",
                )}
                style={{ background: isSos ? trekkerHex.coral : trekkerHex[t.color] }}
              >
                {t.name.split(" ").map((n) => n[0]).join("")}
              </span>
            </button>
          </MapMarker>
        )
      })}
    </MapCanvas>
  )
}

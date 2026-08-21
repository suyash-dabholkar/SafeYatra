"use client"

import type React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  MapCanvas — a stylised fictional map surface in a 0–100 viewBox.   */
/*  Solid colors only. Children are drawn in the SAME coordinate space  */
/*  so trekker/crowd overlays line up with the terrain underneath.      */
/* ------------------------------------------------------------------ */

type Variant = "trail" | "urban"

export function MapCanvas({
  variant = "trail",
  className,
  children,
}: {
  variant?: Variant
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius-clay)] shadow-clay-inset",
        variant === "trail" ? "bg-moss-soft" : "bg-sky-soft",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
        {variant === "trail" ? <TrailTerrain /> : <UrbanTerrain />}
      </svg>
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}

function TrailTerrain() {
  return (
    <g>
      {/* elevation bands (solid) */}
      <path d="M0,100 L0,72 Q30,60 55,64 T100,52 L100,100 Z" fill="#cfe0cb" />
      <path d="M0,100 L0,84 Q34,74 60,78 T100,70 L100,100 Z" fill="#c2d8bd" />
      {/* ridge line */}
      <path d="M0,40 Q22,30 40,36 T74,22 T100,26" fill="none" stroke="#a9c4a3" strokeWidth="1.4" />
      {/* glacier patch */}
      <path d="M62,18 Q72,8 84,14 Q90,24 78,28 Q66,30 62,18 Z" fill="#e3ecf3" />
      {/* river */}
      <path d="M8,4 Q18,26 14,44 T30,78 T24,100" fill="none" stroke="#8fb4cf" strokeWidth="2.2" strokeLinecap="round" />
      {/* trees dots */}
      {[
        [18, 68],
        [24, 58],
        [40, 70],
        [46, 62],
        [58, 74],
        [34, 78],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.3" fill="#7ea877" />
      ))}
    </g>
  )
}

function UrbanTerrain() {
  return (
    <g>
      {/* districts (solid blocks) */}
      <rect x="6" y="8" width="34" height="30" rx="3" fill="#c7d7e8" />
      <rect x="46" y="12" width="28" height="24" rx="3" fill="#cddceb" />
      <rect x="10" y="46" width="30" height="30" rx="3" fill="#cddceb" />
      <rect x="52" y="44" width="40" height="36" rx="3" fill="#c7d7e8" />
      <rect x="70" y="6" width="24" height="28" rx="3" fill="#cddceb" />
      {/* river through the city */}
      <path d="M0,30 Q26,40 42,30 T100,42" fill="none" stroke="#8fb4cf" strokeWidth="3" strokeLinecap="round" />
      {/* main roads */}
      <line x1="44" y1="0" x2="44" y2="100" stroke="#b7c6d6" strokeWidth="1.6" />
      <line x1="0" y1="42" x2="100" y2="42" stroke="#b7c6d6" strokeWidth="1.6" />
      <line x1="0" y1="82" x2="100" y2="82" stroke="#b7c6d6" strokeWidth="1.2" />
    </g>
  )
}

/* Positions a marker in the 0–100 coordinate space via percentage. */
export function MapMarker({
  x,
  y,
  className,
  children,
  style,
}: {
  x: number
  y: number
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
}) {
  return (
    <div
      className={cn("absolute -translate-x-1/2 -translate-y-1/2", className)}
      style={{ left: `${x}%`, top: `${y}%`, ...style }}
    >
      {children}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { Radio } from "lucide-react"
import { cn } from "@/lib/utils"

/* Press-and-hold (3s) SOS trigger. Mirrors the physical wristband button. */
export function SosHoldButton({
  onTrigger,
  fired,
  label = "Hold to send SOS",
  firedLabel = "SOS relayed to control room",
}: {
  onTrigger: () => void
  fired: boolean
  label?: string
  firedLabel?: string
}) {
  const [progress, setProgress] = useState(0)
  const raf = useRef<number | null>(null)
  const start = useRef<number>(0)
  const HOLD_MS = 1600

  function begin() {
    if (fired) return
    start.current = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - start.current) / HOLD_MS)
      setProgress(p)
      if (p >= 1) {
        onTrigger()
        setProgress(0)
        return
      }
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
  }

  function end() {
    if (raf.current) cancelAnimationFrame(raf.current)
    setProgress(0)
  }

  useEffect(() => () => end(), [])

  return (
    <button
      onMouseDown={begin}
      onMouseUp={end}
      onMouseLeave={end}
      onTouchStart={begin}
      onTouchEnd={end}
      disabled={fired}
      className={cn(
        "relative w-full overflow-hidden rounded-[var(--radius-clay)] px-5 py-5 text-center shadow-clay-sm transition-all",
        fired ? "bg-moss text-moss-fg" : "bg-coral text-coral-fg active:shadow-clay-pressed",
      )}
    >
      {!fired && (
        <span
          className="absolute inset-y-0 left-0 bg-coral-fg/25 transition-none"
          style={{ width: `${progress * 100}%` }}
          aria-hidden
        />
      )}
      <span className="relative flex items-center justify-center gap-2 text-base font-extrabold">
        <Radio className="h-5 w-5" />
        {fired ? firedLabel : label}
      </span>
    </button>
  )
}

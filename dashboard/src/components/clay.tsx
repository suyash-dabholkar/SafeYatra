"use client"

import type React from "react"
import { cn } from "@/lib/utils"

/* ------------------------------------------------------------------ */
/*  Claymorphism primitives — build every surface out of these so the  */
/*  puffy solid-color look stays consistent across the whole app.      */
/* ------------------------------------------------------------------ */

type Tone = "neutral" | "teal" | "moss" | "amber" | "coral" | "sky"

const surfaceTone: Record<Tone, string> = {
  neutral: "bg-surface text-ink",
  teal: "bg-teal-soft text-teal",
  moss: "bg-moss-soft text-moss",
  amber: "bg-amber-soft text-amber-fg",
  coral: "bg-coral-soft text-coral",
  sky: "bg-sky-soft text-sky",
}

export function ClayCard({
  tone = "neutral",
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { tone?: Tone }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-clay)] p-5 shadow-clay",
        surfaceTone[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

const buttonTone: Record<Tone, string> = {
  neutral: "bg-surface text-ink",
  teal: "bg-teal text-teal-fg",
  moss: "bg-moss text-moss-fg",
  amber: "bg-amber text-amber-fg",
  coral: "bg-coral text-coral-fg",
  sky: "bg-sky text-sky-fg",
}

export function ClayButton({
  tone = "neutral",
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone }) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[var(--radius-clay-sm)] px-5 py-3",
        "text-sm font-bold shadow-clay-sm transition-all duration-150",
        "hover:brightness-[1.03] active:shadow-clay-pressed active:scale-[0.98]",
        "disabled:opacity-50 disabled:pointer-events-none",
        buttonTone[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

const badgeTone: Record<Tone, string> = {
  neutral: "bg-surface text-ink-soft",
  teal: "bg-teal-soft text-teal",
  moss: "bg-moss-soft text-moss",
  amber: "bg-amber-soft text-amber-fg",
  coral: "bg-coral-soft text-coral",
  sky: "bg-sky-soft text-sky",
}

export function ClayBadge({
  tone = "neutral",
  icon: Icon,
  className,
  children,
}: {
  tone?: Tone
  icon?: React.ComponentType<{ className?: string }>
  className?: string
  children: React.ReactNode
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "text-[11px] font-bold uppercase tracking-wide shadow-clay-sm",
        badgeTone[tone],
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  )
}

export function ClayProgress({
  percent = 0,
  tone = "teal",
}: {
  percent?: number
  tone?: "teal" | "moss" | "amber" | "coral"
}) {
  const fill: Record<string, string> = {
    teal: "bg-teal",
    moss: "bg-moss",
    amber: "bg-amber",
    coral: "bg-coral",
  }
  return (
    <div className="h-3.5 w-full overflow-hidden rounded-full bg-surface-sunken shadow-clay-inset">
      <div
        className={cn("h-full rounded-full transition-all duration-500", fill[tone])}
        style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
      />
    </div>
  )
}

/** A pressed-in circular icon well. */
export function ClayIconWell({
  tone = "teal",
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-[var(--radius-clay-sm)] shadow-clay-sm",
        surfaceTone[tone],
        className,
      )}
    >
      {children}
    </div>
  )
}

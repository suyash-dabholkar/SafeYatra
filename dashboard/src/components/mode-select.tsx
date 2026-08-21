"use client"

import { Mountain, Users, ArrowRight, LogOut } from "lucide-react"
import { useSafety, type UserMode } from "@/components/safety-store"
import { ClayCard, ClayIconWell } from "@/components/clay"

const modes: {
  id: UserMode
  label: string
  desc: string
  icon: typeof Mountain
  tone: "teal" | "sky"
  points: string[]
}[] = [
  {
    id: "trekker",
    label: "Trekker",
    desc: "Solo & group trail tracking",
    icon: Mountain,
    tone: "teal",
    points: ["Live checkpoint distance", "Distance covered & ETA", "One-tap SOS to control room"],
  },
  {
    id: "crowd",
    label: "Crowd Visitor",
    desc: "Festivals, temples & venues",
    icon: Users,
    tone: "sky",
    points: ["Live density map", "Safe-exit guidance", "Wristband SOS mirror"],
  },
]

export function ModeSelect() {
  const { session, setMode, logout } = useSafety()

  return (
    <main className="flex min-h-screen flex-col bg-background px-5 py-8">
      <header className="mx-auto flex w-full max-w-2xl items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-teal">Welcome back</p>
          <h1 className="text-2xl font-extrabold text-ink">{session?.name}</h1>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-xs font-bold text-ink-soft shadow-clay-sm"
        >
          <LogOut className="h-3.5 w-3.5" /> Sign out
        </button>
      </header>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-8">
        <h2 className="mb-1 text-center text-xl font-extrabold text-ink text-balance">
          How are you travelling today?
        </h2>
        <p className="mb-8 text-center text-sm text-ink-soft">Pick a mode to load the right safety tools.</p>

        <div className="grid gap-5 sm:grid-cols-2">
          {modes.map((m) => {
            const Icon = m.icon
            return (
              <button key={m.id} onClick={() => setMode(m.id)} className="text-left">
                <ClayCard className="flex h-full flex-col transition-all duration-150 hover:-translate-y-1">
                  <ClayIconWell tone={m.tone} className="mb-4 h-14 w-14">
                    <Icon className="h-7 w-7" />
                  </ClayIconWell>
                  <h3 className="text-lg font-extrabold text-ink">{m.label}</h3>
                  <p className="mb-4 text-sm text-ink-soft">{m.desc}</p>
                  <ul className="mb-5 flex flex-col gap-2">
                    {m.points.map((p) => (
                      <li key={p} className="flex items-center gap-2 text-xs text-ink-soft">
                        <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-bold text-teal">
                    Continue <ArrowRight className="h-4 w-4" />
                  </span>
                </ClayCard>
              </button>
            )
          })}
        </div>
      </div>
    </main>
  )
}

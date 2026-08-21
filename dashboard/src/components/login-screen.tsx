"use client"

import { useState } from "react"
import { Mountain, ShieldCheck, User, Lock, ArrowRight, Radio } from "lucide-react"
import { useSafety, type Role } from "@/components/safety-store"
import { ClayCard, ClayButton, ClayIconWell } from "@/components/clay"
import { cn } from "@/lib/utils"

const roles: { id: Role; label: string; blurb: string; icon: typeof User; demo: string }[] = [
  { id: "user", label: "User", blurb: "Trekkers & crowd visitors", icon: User, demo: "aarav / trail123" },
  { id: "admin", label: "Admin", blurb: "Command & control room", icon: ShieldCheck, demo: "control / room123" },
]

export function LoginScreen() {
  const { login } = useSafety()
  const [role, setRole] = useState<Role>("user")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    login(role, role === "admin" ? "Control Room" : username.trim() ? capitalize(username) : "Aarav Sharma")
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-8 flex flex-col items-center text-center">
          <ClayIconWell tone="teal" className="mb-4 h-16 w-16">
            <Mountain className="h-8 w-8" />
          </ClayIconWell>
          <h1 className="text-3xl font-extrabold tracking-tight text-ink">SafeYatra</h1>
          <p className="mt-1 text-sm text-ink-soft text-balance">
            Crowd monitoring & trekker safety, in one command platform
          </p>
        </div>

        <ClayCard className="p-6">
          {/* Role selector */}
          <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-ink-faint">
            Sign in as
          </p>
          <div className="mb-6 grid grid-cols-2 gap-3">
            {roles.map((r) => {
              const Icon = r.icon
              const active = role === r.id
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  className={cn(
                    "rounded-[var(--radius-clay-sm)] p-4 text-left transition-all duration-150",
                    active
                      ? "bg-teal text-teal-fg shadow-clay-sm"
                      : "bg-surface text-ink shadow-clay-inset",
                  )}
                >
                  <Icon className="mb-2 h-5 w-5" />
                  <span className="block text-sm font-extrabold">{r.label}</span>
                  <span className={cn("block text-[11px]", active ? "text-teal-fg/80" : "text-ink-faint")}>
                    {r.blurb}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Credentials */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-ink-soft">Username</span>
              <div className="flex items-center gap-2.5 rounded-[var(--radius-clay-sm)] bg-surface px-4 py-3 shadow-clay-inset">
                <User className="h-4 w-4 text-ink-faint" />
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={role === "admin" ? "control" : "aarav"}
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                  autoComplete="username"
                />
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-bold text-ink-soft">Password</span>
              <div className="flex items-center gap-2.5 rounded-[var(--radius-clay-sm)] bg-surface px-4 py-3 shadow-clay-inset">
                <Lock className="h-4 w-4 text-ink-faint" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
                  autoComplete="current-password"
                />
              </div>
            </label>

            <ClayButton tone="teal" type="submit" className="mt-1 w-full py-3.5">
              Enter {role === "admin" ? "command room" : "app"}
              <ArrowRight className="h-4 w-4" />
            </ClayButton>
          </form>

          <div className="mt-5 flex items-center justify-center gap-2 rounded-[var(--radius-clay-sm)] bg-surface px-3 py-2.5 text-center shadow-clay-inset">
            <Radio className="h-3.5 w-3.5 text-teal" />
            <p className="text-[11px] text-ink-soft">
              Demo — any password works. Try{" "}
              <span className="font-bold text-ink">{roles.find((r) => r.id === role)?.demo}</span>
            </p>
          </div>
        </ClayCard>

        <p className="mt-6 text-center text-[11px] text-ink-faint">
          Wristband-linked safety network · v2.4 · Region: Himalaya North
        </p>
      </div>
    </main>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

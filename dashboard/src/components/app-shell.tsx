"use client"

import { SafetyProvider, useSafety } from "@/components/safety-store"
import { LoginScreen } from "@/components/login-screen"
import { ModeSelect } from "@/components/mode-select"
import { TrekkerMode } from "@/components/trekker/trekker-mode"
import { CrowdMode } from "@/components/crowd/crowd-mode"
import { AdminDashboard } from "@/components/admin/admin-dashboard"

function Screens() {
  const { session } = useSafety()

  if (!session) return <LoginScreen />
  if (session.role === "admin") return <AdminDashboard />
  if (!session.mode) return <ModeSelect />
  return session.mode === "trekker" ? <TrekkerMode /> : <CrowdMode />
}

export function AppShell() {
  return (
    <SafetyProvider>
      <Screens />
    </SafetyProvider>
  )
}

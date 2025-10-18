"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { TAB_STORAGE_KEY } from "@/lib/navigation"
import { useAuth } from "@/providers/auth-provider"
import { QuestionsPanelProvider } from "@/providers/questions-panel-provider"
import App from "../App"
import { RadarDashboard } from "./radar/radar-dashboard"

export default function AppLayout({
  children,
}: {
  children: ReactNode
}) {
  const { user } = useAuth()
  const userEmail = user?.email ?? undefined
  const router = useRouter()
  const pathname = usePathname()
  const segment = useSelectedLayoutSegment()

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (pathname !== "/") {
      return
    }

    const lastTab = window.localStorage.getItem(TAB_STORAGE_KEY)
    if (lastTab === "radar") {
      router.replace("/radar")
    }
  }, [pathname, router])

  const isRadarActive = segment === "radar"

  return (
    <QuestionsPanelProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar userEmail={userEmail} />
        <main className="flex-1">
          <div className={isRadarActive ? "hidden" : "block"} aria-hidden={isRadarActive}>
            <App />
          </div>
          <div className={isRadarActive ? "block" : "hidden"} aria-hidden={!isRadarActive}>
            <RadarDashboard />
          </div>
          <div className="hidden" aria-hidden>
            {children}
          </div>
        </main>
      </div>
    </QuestionsPanelProvider>
  )
}

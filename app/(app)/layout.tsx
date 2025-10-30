"use client"

import { useEffect, type ReactNode } from "react"
import { usePathname, useRouter, useSelectedLayoutSegment } from "next/navigation"
import { MessageCircle } from "lucide-react"

import { LeftSidebar } from "@/components/left-sidebar"
import { Button } from "@/components/ui/button"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TAB_STORAGE_KEY } from "@/lib/navigation"
import { QuestionsPanelProvider, useQuestionsPanel } from "@/providers/questions-panel-provider"
import { AssistantProvider } from "@/providers/assistant-provider"
import App from "../App"
import { RadarDashboard } from "./radar/radar-dashboard"

export default function AppLayout({
  children,
}: {
  children: ReactNode
}) {
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
  const isAssistantActive = segment === "assistant" || segment === null
  const isSettingsActive = segment === "settings"

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const tab = isRadarActive ? "radar" : isAssistantActive ? "assistant" : "chat"
    window.localStorage.setItem(TAB_STORAGE_KEY, tab)
  }, [isRadarActive, isAssistantActive])

  return (
    <QuestionsPanelProvider>
      <AssistantProvider>
        <SidebarProvider className="min-h-screen">
          <LeftSidebar />
          <SidebarInset>
            <AppLayoutContent isRadarActive={isRadarActive} isAssistantActive={isAssistantActive} isSettingsActive={isSettingsActive}>
              {children}
            </AppLayoutContent>
          </SidebarInset>
        </SidebarProvider>
      </AssistantProvider>
    </QuestionsPanelProvider>
  )
}

function AppLayoutContent({
  children,
  isRadarActive,
  isAssistantActive,
  isSettingsActive,
}: {
  children: ReactNode
  isRadarActive: boolean
  isAssistantActive: boolean
  isSettingsActive: boolean
}) {
  const { openMobilePanel } = useQuestionsPanel()
  const showDefaultViews = !isSettingsActive

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          {showDefaultViews && (
            <span className="text-sm font-semibold md:hidden">Alphatide</span>
          )}
        </div>
        {/* Question bank button removed - available in AssistantPanel */}
      </header>
      <main className="flex-1">
        {showDefaultViews ? (
          <>
            <div className={!isRadarActive && !isAssistantActive ? "block" : "hidden"} aria-hidden={isRadarActive || isAssistantActive}>
              <App />
            </div>
            <div className={isRadarActive ? "block" : "hidden"} aria-hidden={!isRadarActive}>
              <RadarDashboard />
            </div>
            <div className={isAssistantActive ? "block" : "hidden"} aria-hidden={!isAssistantActive}>
              {children}
            </div>
          </>
        ) : (
          <div>{children}</div>
        )}
      </main>
    </div>
  )
}

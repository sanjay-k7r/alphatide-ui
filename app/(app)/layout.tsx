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
import { N8nChatProvider } from "@/providers/n8n-chat-provider"
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
  const isN8nChatActive = segment === "n8n-chat"
  const isSettingsActive = segment === "settings"

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    const tab = isRadarActive ? "radar" : isN8nChatActive ? "n8n-chat" : "chat"
    window.localStorage.setItem(TAB_STORAGE_KEY, tab)
  }, [isRadarActive, isN8nChatActive])

  return (
    <QuestionsPanelProvider>
      <N8nChatProvider>
        <SidebarProvider className="min-h-screen">
          <LeftSidebar />
          <SidebarInset>
            <AppLayoutContent isRadarActive={isRadarActive} isN8nChatActive={isN8nChatActive} isSettingsActive={isSettingsActive}>
              {children}
            </AppLayoutContent>
          </SidebarInset>
        </SidebarProvider>
      </N8nChatProvider>
    </QuestionsPanelProvider>
  )
}

function AppLayoutContent({
  children,
  isRadarActive,
  isN8nChatActive,
  isSettingsActive,
}: {
  children: ReactNode
  isRadarActive: boolean
  isN8nChatActive: boolean
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
        {showDefaultViews && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Browse questions"
            onClick={openMobilePanel}
            className="md:hidden"
          >
            <MessageCircle className="size-5" />
          </Button>
        )}
      </header>
      <main className="flex-1">
        {showDefaultViews ? (
          <>
            <div className={!isRadarActive && !isN8nChatActive ? "block" : "hidden"} aria-hidden={isRadarActive || isN8nChatActive}>
              <App />
            </div>
            <div className={isRadarActive ? "block" : "hidden"} aria-hidden={!isRadarActive}>
              <RadarDashboard />
            </div>
            <div className={isN8nChatActive ? "block" : "hidden"} aria-hidden={!isN8nChatActive}>
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

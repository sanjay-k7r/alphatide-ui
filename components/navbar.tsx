"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { UserProfile } from "@/components/user-profile"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useQuestionsPanel } from "@/providers/questions-panel-provider"
import { APP_TABS, TAB_STORAGE_KEY } from "@/lib/navigation"
import { MessageCircle, Waves } from "lucide-react"

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const { openMobilePanel } = useQuestionsPanel()
  const pathname = usePathname()
  const router = useRouter()

  const activeTab = pathname?.startsWith("/radar") ? "radar" : "chat"

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(TAB_STORAGE_KEY, activeTab)
  }, [activeTab])

  useEffect(() => {
    APP_TABS.forEach((tab) => {
      router.prefetch(tab.href)
    })
  }, [router])

  return (
    <header className="z-50 border-b border-border bg-background md:sticky md:top-0">
      <div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
        {/* Logo */}
        <div className="flex shrink-0 items-center gap-2">
          <Waves className="size-5 text-foreground" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Alphatide
          </span>
        </div>

        {/* Tab navigation */}
        <nav className="flex flex-1 justify-center">
          <div className="w-full max-w-xs">
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                const nextTab = APP_TABS.find((tab) => tab.id === value)
                if (!nextTab) {
                  return
                }
                if (nextTab.href !== pathname) {
                  router.push(nextTab.href)
                }
              }}
              className="w-full"
            >
              <TabsList className="flex w-full">
                {APP_TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    aria-label={tab.label}
                    className="flex-1"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </nav>

        {/* Right section with theme toggle and user profile */}
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={openMobilePanel}
            aria-label="Browse questions"
          >
            <MessageCircle className="size-5" />
          </Button>
          <ThemeToggle />
          <UserProfile userEmail={userEmail} />
        </div>
      </div>
    </header>
  )
}

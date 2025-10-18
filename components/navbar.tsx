"use client"

import { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { UserProfile } from "@/components/user-profile"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useQuestionsPanel } from "@/providers/questions-panel-provider"
import { APP_TABS, TAB_STORAGE_KEY } from "@/lib/navigation"
import { cn } from "@/lib/utils"
import { MessageCircle, Waves } from "lucide-react"

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const { openMobilePanel } = useQuestionsPanel()
  const pathname = usePathname()

  const activeTab = pathname?.startsWith("/radar") ? "radar" : "chat"

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    window.localStorage.setItem(TAB_STORAGE_KEY, activeTab)
  }, [activeTab])

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
          <div className="flex w-full max-w-xs items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-1.5 shadow-sm">
            {APP_TABS.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  prefetch
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-center text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                    isActive
                      ? "bg-foreground text-background shadow-sm"
                      : "text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                  )}
                >
                  {tab.label}
                </Link>
              )
            })}
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

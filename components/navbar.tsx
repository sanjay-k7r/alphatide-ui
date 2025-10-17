"use client"

import { UserProfile } from "@/components/user-profile"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { useQuestionsPanel } from "@/providers/questions-panel-provider"
import { MessageCircle, Waves } from "lucide-react"

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  const { openMobilePanel } = useQuestionsPanel()

  return (
    <header className="z-50 border-b border-border bg-background md:sticky md:top-0">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Waves className="size-5 text-foreground" />
          <span className="text-sm font-semibold tracking-tight text-foreground">
            Alphatide
          </span>
        </div>

        {/* Right section with theme toggle and user profile */}
        <div className="flex items-center gap-2">
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

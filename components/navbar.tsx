"use client"

import { UserProfile } from "@/components/user-profile"
import { ThemeToggle } from "@/components/theme-toggle"
import { Waves } from "lucide-react"

interface NavbarProps {
  userEmail?: string
}

export function Navbar({ userEmail }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
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
          <ThemeToggle />
          <UserProfile userEmail={userEmail} />
        </div>
      </div>
    </header>
  )
}

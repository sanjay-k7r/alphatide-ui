"use client"

import { UserProfile } from "@/components/user-profile"
import { Waves } from "lucide-react"
import { useAuth } from "@/providers/auth-provider"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const userEmail = user?.email ?? undefined

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header with logo and user profile */}
      <header className="sticky top-0 z-50 border-b border-black/10 bg-transparent backdrop-blur-sm dark:border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Waves className="size-8 text-black dark:text-white" />
            <span className="text-xl font-bold text-black dark:text-white">
              Alphatide
            </span>
          </div>

          {/* User Profile */}
          <UserProfile userEmail={userEmail} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  )
}

"use client"

import type { ReactNode } from "react"
import { AuthProvider, useAuth } from "@/providers/auth-provider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthBoundary>{children}</AuthBoundary>
    </AuthProvider>
  )
}

function AuthBoundary({ children }: { children: ReactNode }) {
  const { loading, error, refresh } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <span>Loading your workspace…</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-black text-white">
        <p>We hit an issue loading your session.</p>
        <p className="text-sm text-gray-400">{error}</p>
        <button
          type="button"
          className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
          onClick={() => {
            void refresh()
          }}
        >
          Try again
        </button>
      </div>
    )
  }

  return <>{children}</>
}

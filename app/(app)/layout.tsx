"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { TAB_STORAGE_KEY } from "@/lib/navigation"
import { useAuth } from "@/providers/auth-provider"
import { QuestionsPanelProvider } from "@/providers/questions-panel-provider"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const userEmail = user?.email ?? undefined
  const router = useRouter()
  const pathname = usePathname()

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

  return (
    <QuestionsPanelProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar userEmail={userEmail} />
        <main className="flex-1">{children}</main>
      </div>
    </QuestionsPanelProvider>
  )
}

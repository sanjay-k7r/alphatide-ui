"use client"

import { Navbar } from "@/components/navbar"
import { useAuth } from "@/providers/auth-provider"
import { QuestionsPanelProvider } from "@/providers/questions-panel-provider"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = useAuth()
  const userEmail = user?.email ?? undefined

  return (
    <QuestionsPanelProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar userEmail={userEmail} />
        <main className="flex-1">{children}</main>
      </div>
    </QuestionsPanelProvider>
  )
}

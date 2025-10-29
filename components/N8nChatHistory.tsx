"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, MessageSquare, Trash2, Clock, Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { UserN8nSession, SessionWithFirstMessage } from "@/lib/types/n8n-session"

type N8nChatHistoryProps = {
  isOpen: boolean
  onClose: () => void
  onSessionSelect: (session: UserN8nSession) => void
  currentSessionId?: string  // Track current session to know when new chat is created
}

export function N8nChatHistory({
  isOpen,
  onClose,
  onSessionSelect,
  currentSessionId,
}: N8nChatHistoryProps) {
  const [sessions, setSessions] = useState<SessionWithFirstMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [lastSessionId, setLastSessionId] = useState<string | undefined>(undefined)

  // Load sessions ONLY when:
  // 1. First time opening (hasn't loaded once)
  // 2. A new chat was created (currentSessionId changed)
  useEffect(() => {
    if (!isOpen) return

    const shouldLoad = !hasLoadedOnce || (currentSessionId && currentSessionId !== lastSessionId)

    if (shouldLoad) {
      console.log('[N8N Chat History] Loading sessions...', {
        reason: !hasLoadedOnce ? 'first load' : 'new chat created',
        currentSessionId
      })
      loadSessions()
      if (currentSessionId) {
        setLastSessionId(currentSessionId)
      }
    } else {
      console.log('[N8N Chat History] Using cached data (history is immutable)')
    }
  }, [isOpen, currentSessionId])

  const loadSessions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      console.log('[N8N Chat History] Loading sessions...')
      const response = await fetch("/api/n8n-sessions")

      console.log('[N8N Chat History] Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('[N8N Chat History] Error response:', errorData)
        throw new Error(errorData.error || "Failed to load chat history")
      }

      const data = await response.json()
      console.log('[N8N Chat History] Loaded sessions:', data.sessions?.length || 0)
      setSessions(data.sessions || [])
      setHasLoadedOnce(true)
    } catch (err) {
      console.error("[N8N Chat History] Error loading sessions:", err)
      setError(err instanceof Error ? err.message : "Failed to load chat history")
    } finally {
      setIsLoading(false)
    }
  }

  // Manual refresh button - user can force refresh if needed
  const handleManualRefresh = () => {
    console.log('[N8N Chat History] Manual refresh requested')
    loadSessions()
  }

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const response = await fetch(`/api/n8n-sessions/${sessionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete session")
      }

      // Remove from local state
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId))
    } catch (err) {
      console.error("Error deleting session:", err)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    })
  }

  const getDateGroup = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sessionDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const diffTime = today.getTime() - sessionDate.getTime()
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays <= 7) return "Previous 7 days"
    if (diffDays <= 15) return "Previous 15 days"
    return "Older"
  }

  // Filter sessions (within 15 days and matching search)
  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = (session.first_message || session.title)
      .toLowerCase()
      .includes(searchQuery.toLowerCase())

    // Check if within 15 days
    const sessionDate = new Date(session.updated_at)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))

    return matchesSearch && diffDays <= 15
  })

  // Group sessions by date
  const groupedSessions = filteredSessions.reduce((groups, session) => {
    const group = getDateGroup(session.updated_at)
    if (!groups[group]) {
      groups[group] = []
    }
    groups[group].push(session)
    return groups
  }, {} as Record<string, SessionWithFirstMessage[]>)

  // Define group order
  const groupOrder = ["Today", "Yesterday", "Previous 7 days", "Previous 15 days", "Older"]
  const orderedGroups = groupOrder.filter(group => groupedSessions[group])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Slide-in Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{
              type: "spring",
              damping: 30,
              stiffness: 300,
            }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-background border-l shadow-2xl"
          >
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Chat History</h2>
                    <p className="text-xs text-muted-foreground">
                      {filteredSessions.length}{" "}
                      {filteredSessions.length === 1 ? "conversation" : "conversations"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleManualRefresh}
                    disabled={isLoading}
                    className="h-9 w-9 rounded-full"
                    title="Refresh"
                  >
                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="h-9 w-9 rounded-full"
                    title="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Search */}
              <div className="border-b px-6 py-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search conversations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 rounded-xl"
                  />
                </div>
              </div>

              {/* Session List */}
              <ScrollArea className="flex-1 px-6 py-4">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="mt-4 text-sm text-muted-foreground">Loading conversations...</p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-destructive">{error}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={loadSessions}
                      className="mt-4"
                    >
                      Try Again
                    </Button>
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {searchQuery ? "No conversations found" : "No conversations yet"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {searchQuery ? "Try a different search" : "Start chatting to create a history"}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {orderedGroups.map((groupName) => (
                      <div key={groupName}>
                        {/* Group Header */}
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
                          {groupName}
                        </h3>

                        {/* Sessions in this group */}
                        <div className="space-y-2">
                          <AnimatePresence mode="popLayout">
                            {groupedSessions[groupName].map((session, index) => (
                              <motion.div
                                key={session.session_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{
                                  duration: 0.2,
                                  delay: index * 0.05,
                                }}
                                className="group"
                              >
                                <div
                                  className={cn(
                                    "w-full rounded-xl border bg-card p-4 text-left transition-all cursor-pointer",
                                    "hover:border-primary/50 hover:shadow-md",
                                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                  )}
                                  onClick={() => {
                                    onSessionSelect(session)
                                    onClose()
                                  }}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      onSessionSelect(session)
                                      onClose()
                                    }
                                  }}
                                >
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="font-medium text-sm truncate mb-1">
                                        {session.first_message || session.title}
                                      </h3>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatDate(session.updated_at)}</span>
                                        {session.message_count !== undefined && (
                                          <>
                                            <span>•</span>
                                            <span>{session.message_count} messages</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(e) => handleDeleteSession(session.session_id, e)}
                                      className={cn(
                                        "h-8 w-8 rounded-full shrink-0",
                                        "opacity-0 group-hover:opacity-100 transition-opacity",
                                        "hover:bg-destructive/10 hover:text-destructive"
                                      )}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

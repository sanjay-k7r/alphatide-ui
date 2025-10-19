"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/client"

type AuthContextValue = {
  user: User | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = createClient()
  const mountedRef = useRef(true)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (!mountedRef.current) {
        return
      }

      if (error) {
        setUser(null)
        setError(error.message)
      } else {
        setUser(user ?? null)
      }
    } catch (unknownError) {
      if (!mountedRef.current) {
        return
      }
      setUser(null)
      setError(
        unknownError instanceof Error
          ? unknownError.message
          : "Failed to load session"
      )
    } finally {
      if (mountedRef.current) {
        setLoading(false)
      }
    }
  }, [supabase])

  useEffect(() => {
    mountedRef.current = true
    void refresh()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
      if (!mountedRef.current) {
        return
      }
      setUser(session?.user ?? null)
      setError(null)
      setLoading(false)
    })

    return () => {
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [refresh, supabase])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      error,
      refresh,
    }),
    [user, loading, error, refresh]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type QuestionsPanelContextValue = {
  isMobileOpen: boolean
  openMobilePanel: () => void
  closeMobilePanel: () => void
  setMobileOpen: (open: boolean) => void
}

const QuestionsPanelContext = createContext<
  QuestionsPanelContextValue | undefined
>(undefined)

export function QuestionsPanelProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const openMobilePanel = useCallback(() => {
    setIsMobileOpen(true)
  }, [])

  const closeMobilePanel = useCallback(() => {
    setIsMobileOpen(false)
  }, [])

  const setMobileOpen = useCallback((open: boolean) => {
    setIsMobileOpen(open)
  }, [])

  const value = useMemo(
    () => ({
      isMobileOpen,
      openMobilePanel,
      closeMobilePanel,
      setMobileOpen,
    }),
    [isMobileOpen, openMobilePanel, closeMobilePanel, setMobileOpen]
  )

  return (
    <QuestionsPanelContext.Provider value={value}>
      {children}
    </QuestionsPanelContext.Provider>
  )
}

export function useQuestionsPanel(): QuestionsPanelContextValue {
  const context = useContext(QuestionsPanelContext)
  if (!context) {
    throw new Error(
      "useQuestionsPanel must be used within a QuestionsPanelProvider"
    )
  }
  return context
}

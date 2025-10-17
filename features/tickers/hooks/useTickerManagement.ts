"use client"

import { useCallback, useState } from "react"
import { tickersAPI } from "@/features/tickers/lib/tickers-api"
import type {
  CreateTickerInput,
  Ticker,
  UpdateTickerInput,
} from "@/features/tickers/types/tickers.types"

export function useTickerManagement(userId: string | undefined) {
  const [userTickers, setUserTickers] = useState<Ticker[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchUserTickers = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)
      const data = await tickersAPI.fetchUserTickers(userId)
      setUserTickers(data)
    } catch (err) {
      setError(err as Error)
      console.error("Error fetching user tickers:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const createTicker = useCallback(
    async (input: CreateTickerInput) => {
      if (!userId) throw new Error("User ID is required")

      try {
        setError(null)
        const newTicker = await tickersAPI.createTicker(input, userId)
        setUserTickers((prev) => [...prev, newTicker])
        return newTicker
      } catch (err) {
        setError(err as Error)
        throw err
      }
    },
    [userId]
  )

  const updateTicker = useCallback(async (id: string, updates: UpdateTickerInput) => {
    try {
      setError(null)
      const updatedTicker = await tickersAPI.updateTicker(id, updates)
      setUserTickers((prev) =>
        prev.map((ticker) => (ticker.id === id ? updatedTicker : ticker))
      )
      return updatedTicker
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  const deleteTicker = useCallback(async (id: string) => {
    try {
      setError(null)
      await tickersAPI.deleteTicker(id)
      setUserTickers((prev) => prev.filter((ticker) => ticker.id !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  return {
    userTickers,
    loading,
    error,
    fetchUserTickers,
    createTicker,
    updateTicker,
    deleteTicker,
  }
}

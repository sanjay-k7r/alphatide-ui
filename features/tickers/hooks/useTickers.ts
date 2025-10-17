"use client"

import { useCallback, useEffect, useState } from "react"
import { tickerCache, tickersAPI } from "@/features/tickers/lib/tickers-api"
import type { Ticker } from "@/features/tickers/types/tickers.types"

export function useTickers() {
  const [tickers, setTickers] = useState<Ticker[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchTickers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await tickersAPI.fetchTickers()
      setTickers(data)
    } catch (err) {
      setError(err as Error)
      console.error("Error fetching tickers:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchTickers()
  }, [fetchTickers])

  useEffect(() => {
    const unsubscribe = tickerCache.onRefresh(() => {
      void fetchTickers()
    })
    return unsubscribe
  }, [fetchTickers])

  const refresh = useCallback(() => {
    tickerCache.invalidate()
    void fetchTickers()
  }, [fetchTickers])

  return {
    tickers,
    loading,
    error,
    refresh,
  }
}

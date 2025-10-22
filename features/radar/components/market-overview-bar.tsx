"use client"

import { useCallback, useState } from "react"
import { RefreshCw, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketMetricCard } from "./market-metric-card"
import { SentimentCard } from "./sentiment-card"
import type { MarketOverviewData } from "@/features/radar/types"

type MarketOverviewStatus = "idle" | "loading" | "ready" | "error"

export function MarketOverviewBar() {
  const [status, setStatus] = useState<MarketOverviewStatus>("idle")
  const [data, setData] = useState<MarketOverviewData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true)
    } else {
      setStatus("loading")
    }
    setError(null)

    try {
      const response = await fetch("/api/market-overview")

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as
          | { error?: string; message?: string }
          | null

        const errorMessage =
          errorData?.error ?? errorData?.message ?? "Failed to fetch market overview"
        throw new Error(errorMessage)
      }

      const result = (await response.json()) as MarketOverviewData
      setData(result)
      setStatus("ready")
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "Unable to load market overview"

      setError(message)
      setStatus("error")
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handleRefresh = useCallback(() => {
    fetchData(true)
  }, [fetchData])

  const handleLoad = useCallback(() => {
    fetchData(false)
  }, [fetchData])

  if (status === "idle") {
    return (
      <div className="flex h-[70px] items-center justify-center rounded-md border border-border/40 bg-card/50 px-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLoad}
        >
          <RefreshCw className="mr-2 size-3" aria-hidden="true" />
          Load Market Data
        </Button>
      </div>
    )
  }

  if (status === "loading") {
    return (
      <div className="flex h-[70px] items-center justify-center rounded-md border border-border/40 bg-card/50 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
          <span>Loading market data...</span>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex h-[70px] items-center justify-between gap-4 rounded-md border border-destructive/40 bg-destructive/5 px-4">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <span>{error ?? "Failed to load market overview"}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={cn("mr-2 size-3", isRefreshing && "animate-spin")}
            aria-hidden="true"
          />
          Retry
        </Button>
      </div>
    )
  }

  if (!data) {
    return null
  }

  return (
    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
      {/* Desktop: All metrics in a row */}
      <div className="hidden lg:flex lg:flex-1 lg:items-center lg:gap-2">
        {data.metrics.map((metric) => (
          <MarketMetricCard key={metric.ticker} metric={metric} />
        ))}
        <SentimentCard sentiment={data.sentiment} />
      </div>

      {/* Mobile: Two rows */}
      <div className="flex flex-col gap-2 lg:hidden">
        {/* Row 1: 3 metric cards + refresh button */}
        <div className="flex items-center gap-1.5">
          {data.metrics.slice(0, 3).map((metric) => (
            <MarketMetricCard key={metric.ticker} metric={metric} />
          ))}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="shrink-0"
            aria-label="Refresh market data"
          >
            <RefreshCw
              className={cn("size-4", isRefreshing && "animate-spin")}
              aria-hidden="true"
            />
          </Button>
        </div>

        {/* Row 2: Sentiment card */}
        <div className="flex">
          <SentimentCard sentiment={data.sentiment} />
        </div>
      </div>

      {/* Desktop: Refresh button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="hidden shrink-0 lg:flex"
        aria-label="Refresh market data"
      >
        <RefreshCw
          className={cn("size-4", isRefreshing && "animate-spin")}
          aria-hidden="true"
        />
      </Button>
    </div>
  )
}

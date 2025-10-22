"use client"

import { useCallback, useMemo, useState } from "react"
import { RadarTickerSelector } from "@/features/radar/components/ticker-selector"
import { MomentumCard } from "@/features/radar/components/momentum-card"
import { type RadarCardState, type MomentumAnalysisResult } from "@/features/radar/types"
import { useTickers } from "@/features/tickers/hooks/useTickers"

export function RadarDashboard() {
  const { tickers, loading, error, refresh } = useTickers()
  const [selectedTicker, setSelectedTicker] = useState("")
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [cards, setCards] = useState<RadarCardState[]>([])

  const tickerSymbols = useMemo(() => {
    return tickers.map((ticker) => ticker.ticker)
  }, [tickers])

  const handleTickerChange = useCallback((value: string) => {
    setSelectedTicker(value)
    setSelectionError(null)
  }, [])

  const handleAddTicker = useCallback(() => {
    if (!selectedTicker) {
      setSelectionError("Select a ticker to add.")
      return
    }

    const symbol = selectedTicker.trim().toUpperCase()

    if (!tickerSymbols.includes(symbol)) {
      setSelectionError("Ticker not found. Try another symbol.")
      return
    }

    if (cards.some((card) => card.ticker === symbol)) {
      setSelectionError(`${symbol} is already being tracked.`)
      return
    }

    const newCard: RadarCardState = {
      id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : `${symbol}-${Date.now()}`,
      ticker: symbol,
      status: "idle",
      result: undefined,
      error: null,
    }

    setCards((current) => [newCard, ...current])
    setSelectedTicker("")
    setSelectionError(null)
  }, [cards, selectedTicker, tickerSymbols])

  const handleRemoveCard = useCallback((card: RadarCardState) => {
    setCards((current) => current.filter((item) => item.id !== card.id))
  }, [])

  const handleRunAnalysis = useCallback(
    async (card: RadarCardState) => {
      setCards((current) =>
        current.map((item) =>
          item.id === card.id
            ? {
                ...item,
                status: "loading",
                error: null,
              }
            : item
        )
      )

      try {
        const result = await analyzeMomentum(card.ticker)
        setCards((current) =>
          current.map((item) =>
            item.id === card.id
              ? {
                  ...item,
                  status: "ready",
                  result,
                  error: null,
                }
              : item
          )
        )
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Unable to analyze momentum right now."

        setCards((current) =>
          current.map((item) =>
            item.id === card.id
              ? {
                  ...item,
                  status: "error",
                  error: message,
                }
              : item
          )
        )
      }
    },
    []
  )

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 md:px-6 lg:px-8">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Radar
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Build a quick stack of tickers and run momentum in seconds. Each card keeps the latest read — refresh for a new pulse or send it to chat for deeper work.
        </p>
      </header>

      <section className="space-y-4">
        <RadarTickerSelector
          value={selectedTicker}
          onValueChange={handleTickerChange}
          onSubmit={handleAddTicker}
          selectionError={selectionError}
          tickers={tickers}
          loading={loading}
          error={error}
          onRefresh={refresh}
        />
        {error ? (
          <p className="text-xs text-muted-foreground">
            Unable to load tickers. Try refreshing or check back later.
          </p>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        {cards.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {cards.map((card) => (
              <MomentumCard
                key={card.id}
                card={card}
                onAnalyze={handleRunAnalysis}
                onRefresh={handleRunAnalysis}
                onRemove={handleRemoveCard}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

async function analyzeMomentum(ticker: string): Promise<MomentumAnalysisResult> {
  const response = await fetch("/api/analyze-momentum", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ticker }),
  })

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null

    const detail = payload?.error ?? payload?.message ?? "Momentum analysis failed."
    throw new Error(detail)
  }

  const payload = (await response.json()) as MomentumAnalysisResult
  const analysis =
    typeof payload.analysis === "string" && payload.analysis.trim().length > 0
      ? payload.analysis.trim()
      : "No analysis available."
  const reasoning =
    typeof payload.reasoning === "string" && payload.reasoning.trim().length > 0
      ? payload.reasoning.trim()
      : "No reasoning supplied."

  // Handle confidence - can be number or string ("low", "medium", "high")
  let confidence: number | string = 0
  if (typeof payload.confidence === "number") {
    confidence = Math.max(0, Math.min(100, Math.round(payload.confidence)))
  } else if (typeof payload.confidence === "string") {
    const confStr = payload.confidence.toLowerCase().trim()
    if (confStr === "low" || confStr === "medium" || confStr === "high") {
      confidence = confStr
    } else {
      // Try to parse as number
      const numConf = Number.parseFloat(payload.confidence)
      confidence = Number.isFinite(numConf) ? Math.max(0, Math.min(100, Math.round(numConf))) : 0
    }
  }

  const timestamp =
    typeof payload.timestamp === "string" && payload.timestamp.length > 0
      ? payload.timestamp
      : new Date().toISOString()
  const summary =
    typeof payload.summary === "string" && payload.summary.trim().length > 0
      ? payload.summary.trim()
      : "No summary available."

  return {
    ticker: payload.ticker ?? ticker,
    summary,
    analysis,
    reasoning,
    confidence,
    timestamp,
  }
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border/60 bg-muted/20 p-10 text-center">
      <p className="text-sm text-muted-foreground">
        Add a ticker to spin up your first momentum card.
      </p>
      <p className="text-xs text-muted-foreground/80">
        No persistence yet — cards reset when you leave the page.
      </p>
    </div>
  )
}

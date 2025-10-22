"use client"

import { useCallback, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { TickerSelect } from "@/features/tickers/components/TickerSelect"
import { MomentumCard } from "@/features/radar/components/momentum-card"
import { type RadarCardState, type MomentumAnalysisResult } from "@/features/radar/types"
import { useTickers } from "@/features/tickers/hooks/useTickers"

export function RadarDashboard() {
  const { tickers, loading, error, refresh } = useTickers()
  const [selectedTicker, setSelectedTicker] = useState("")
  const [selectionError, setSelectionError] = useState<string | null>(null)
  const [cards, setCards] = useState<RadarCardState[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)

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
    setDialogOpen(false)
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
    <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6 lg:px-8">
      {/* Add Ticker Button */}
      <div className="flex items-center justify-start">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 size-4" />
              Add Ticker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Ticker</DialogTitle>
              <DialogDescription>
                Select a ticker to track its momentum analysis.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <TickerSelect
                  value={selectedTicker}
                  onValueChange={handleTickerChange}
                  tickers={tickers}
                  loading={loading}
                  error={error}
                  onRefresh={refresh}
                  placeholder="Select ticker…"
                />
                {selectionError && (
                  <p className="text-sm text-destructive">{selectionError}</p>
                )}
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDialogOpen(false)
                    setSelectedTicker("")
                    setSelectionError(null)
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddTicker} disabled={!selectedTicker}>
                  Add Ticker
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Cards Section */}
      <section className="flex flex-col gap-4">
        {cards.length === 0 ? (
          <EmptyState onAddClick={() => setDialogOpen(true)} />
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

function EmptyState({ onAddClick }: { onAddClick: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border/60 bg-muted/20 p-16 text-center">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          No tickers added yet
        </p>
        <p className="text-xs text-muted-foreground/70">
          Click the + button to add your first ticker and track momentum
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={onAddClick}
        className="mt-2"
      >
        <Plus className="mr-2 size-4" />
        Add Ticker
      </Button>
    </div>
  )
}

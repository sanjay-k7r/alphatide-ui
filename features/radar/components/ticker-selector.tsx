"use client"

import { useCallback, type FormEvent } from "react"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { TickerSelect } from "@/features/tickers/components/TickerSelect"
import type { Ticker } from "@/features/tickers/types/tickers.types"

type RadarTickerSelectorProps = {
  value: string
  onValueChange: (ticker: string) => void
  onSubmit: () => void
  selectionError?: string | null
  tickers: Ticker[]
  loading: boolean
  error: Error | null
  onRefresh?: () => void
}

export function RadarTickerSelector({
  value,
  onValueChange,
  onSubmit,
  selectionError,
  tickers,
  loading,
  error,
  onRefresh,
}: RadarTickerSelectorProps) {
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      onSubmit()
    },
    [onSubmit]
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Ticker Symbol
        </Label>
        <TickerSelect
          value={value}
          onValueChange={onValueChange}
          tickers={tickers}
          loading={loading}
          error={error}
          onRefresh={onRefresh}
          placeholder="Select ticker…"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          disabled={!value}
          className="h-10 px-6"
          aria-disabled={!value}
        >
          Add
        </Button>
        {selectionError ? (
          <p className="text-xs text-muted-foreground">{selectionError}</p>
        ) : null}
      </div>
    </form>
  )
}

"use client"

import { ArrowDown, ArrowUp, Minus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MarketMetric } from "@/features/radar/types"

type MarketMetricCardProps = {
  metric: MarketMetric
}

export function MarketMetricCard({ metric }: MarketMetricCardProps) {
  const { ticker, name, price, change, changeDirection } = metric

  const isPositive = changeDirection === "up"
  const isNegative = changeDirection === "down"
  const isFlat = changeDirection === "flat"

  const changeColor = isPositive
    ? "text-green-600 dark:text-green-500"
    : isNegative
      ? "text-red-600 dark:text-red-500"
      : "text-muted-foreground"

  const ArrowIcon = isPositive ? ArrowUp : isNegative ? ArrowDown : Minus

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border/40 bg-card/50 px-3 py-2 transition-colors hover:border-border/60">
      <div className="text-xs font-medium text-muted-foreground">
        {ticker}
      </div>
      <div className="tabular-nums text-sm font-semibold text-foreground">
        {price !== null ? price.toFixed(2) : "—"}
      </div>
      <div className={cn("flex items-center gap-1 text-xs font-medium", changeColor)}>
        <ArrowIcon className="size-3" aria-hidden="true" />
        <span className="tabular-nums">
          {isPositive ? "+" : isNegative ? "" : ""}
          {change.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

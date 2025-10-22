"use client"

import { cn } from "@/lib/utils"
import type { MarketSentiment } from "@/features/radar/types"

type SentimentCardProps = {
  sentiment: MarketSentiment
}

export function SentimentCard({ sentiment }: SentimentCardProps) {
  const { status, label, description } = sentiment

  const sentimentColor =
    status === "bullish"
      ? "text-green-600 dark:text-green-500"
      : status === "bearish"
        ? "text-red-600 dark:text-red-500"
        : "text-yellow-600 dark:text-yellow-500"

  const dotColor =
    status === "bullish"
      ? "bg-green-600 dark:bg-green-500"
      : status === "bearish"
        ? "bg-red-600 dark:bg-red-500"
        : "bg-yellow-600 dark:bg-yellow-500"

  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-md border border-border/40 bg-card/50 px-3 py-2 transition-colors hover:border-border/60">
      <div className="flex items-center gap-1.5">
        <div className={cn("size-2 rounded-full", dotColor)} aria-hidden="true" />
        <div className={cn("text-[10px] font-medium uppercase tracking-wide", sentimentColor)}>
          {label}
        </div>
      </div>
      <div className="text-sm leading-relaxed text-muted-foreground line-clamp-2" title={description}>
        {description}
      </div>
    </div>
  )
}

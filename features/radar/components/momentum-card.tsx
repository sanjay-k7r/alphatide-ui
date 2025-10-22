"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TAB_STORAGE_KEY } from "@/lib/navigation";
import {
  RADAR_CHAT_PREFILL_EVENT,
  type RadarChatPrefillDetail,
} from "@/features/radar/constants";
import {
  type MomentumAnalysisResult,
  type RadarCardState,
} from "@/features/radar/types";

type MomentumCardProps = {
  card: RadarCardState;
  onAnalyze: (card: RadarCardState) => void;
  onRefresh: (card: RadarCardState) => void;
  onRemove: (card: RadarCardState) => void;
};

export function MomentumCard({
  card,
  onAnalyze,
  onRefresh,
  onRemove,
}: MomentumCardProps) {
  const router = useRouter();

  const formattedTimestamp = useFormattedTimestamp(card.result?.timestamp);

  const handleAnalyze = () => {
    onAnalyze(card);
  };

  const handleRefresh = () => {
    onRefresh(card);
  };

  const handleRemove = () => {
    onRemove(card);
  };

  const handleAnalyzeInChat = () => {
    if (!card.result) {
      return;
    }

    const prompt = buildChatPrompt(card.result);

    try {
      window.dispatchEvent(
        new CustomEvent<RadarChatPrefillDetail>(RADAR_CHAT_PREFILL_EVENT, {
          detail: { prompt },
        })
      );
      window.localStorage.setItem(TAB_STORAGE_KEY, "chat");
      router.push("/");
    } catch (error) {
      console.error("[MomentumCard] Failed to trigger Analyze in Chat", error);
    }
  };

  return (
    <Card className="relative flex w-full max-w-2xl flex-col overflow-hidden border border-border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 pb-3 pt-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {card.ticker}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {card.status === "ready" && formattedTimestamp ? (
            <span className="text-xs text-muted-foreground">
              Updated {formattedTimestamp}
            </span>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleRemove}
            aria-label={`Remove ${card.ticker}`}
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      <CardContent className="flex flex-1 flex-col gap-4 px-5 pb-4 pt-4">
        {card.status === "idle" ? (
          <IdleState onAnalyze={handleAnalyze} />
        ) : null}

        {card.status === "loading" ? <LoadingState /> : null}

        {card.status === "ready" && card.result ? (
          <ResultState result={card.result} />
        ) : null}

        {card.status === "error" ? (
          <ErrorState message={card.error} onRetry={handleRefresh} />
        ) : null}
      </CardContent>

      <footer className="flex flex-wrap items-center gap-2 border-t border-border/60 px-5 py-3">
        {card.status === "ready" ? (
          <>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Refresh
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAnalyzeInChat}
            >
              Analyze in Chat
            </Button>
          </>
        ) : null}
      </footer>
    </Card>
  );
}

function IdleState({ onAnalyze }: { onAnalyze: () => void }) {
  return (
    <div className="flex min-h-[160px] flex-1 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border/60 bg-muted/25 p-5 text-center">
      <p className="text-sm text-muted-foreground">
        Run momentum to see the latest read for this ticker.
      </p>
      <Button type="button" onClick={onAnalyze}>
        Analyze Momentum
      </Button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[160px] flex-1 flex-col items-center justify-center gap-3 rounded-md border border-border/60 bg-muted/40 p-5 text-center">
      <Loader2
        className="size-5 animate-spin text-muted-foreground"
        aria-hidden="true"
      />
      <p className="text-sm text-muted-foreground">Analyzing momentum…</p>
    </div>
  );
}

function ResultState({ result }: { result: MomentumAnalysisResult }) {
  const formattedConfidence = formatConfidence(result.confidence);
  const confidenceTone = useConfidenceTone(result.confidence);

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Summary
          </h3>
          {formattedConfidence ? (
            <>
              <span className="text-muted-foreground/40">|</span>
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground/60">
                Confidence
              </span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  confidenceTone === "text-green-600 dark:text-green-500" &&
                    "bg-green-500/10 text-green-700 dark:bg-green-500/15 dark:text-green-400",
                  confidenceTone === "text-yellow-600 dark:text-yellow-500" &&
                    "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400",
                  confidenceTone === "text-orange-600 dark:text-orange-500" &&
                    "bg-orange-500/10 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
                  confidenceTone === "text-red-600 dark:text-red-500" &&
                    "bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                )}
              >
                {formattedConfidence}
              </span>
            </>
          ) : null}
        </div>
        <p className="text-[15px] leading-relaxed text-foreground">
          {result.summary}
        </p>
      </div>

      {result.analysis ? (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Analysis
          </h3>
          <div className="rounded-md border border-border/70 bg-card/60 px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {result.analysis}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message?: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex min-h-[180px] flex-1 flex-col items-center justify-center gap-3 rounded-md border border-border/70 bg-muted/40 p-6 text-center text-sm text-foreground">
      <p>{message ?? "Momentum analysis failed. Try running it again."}</p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        Retry
      </Button>
    </div>
  );
}

function useFormattedTimestamp(timestamp?: string) {
  return useMemo(() => {
    if (!timestamp) {
      return null;
    }

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      return null;
    }

    return date.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
  }, [timestamp]);
}

function useConfidenceTone(confidence?: number | string) {
  return useMemo(() => {
    if (confidence === undefined || confidence === null) {
      return "text-muted-foreground";
    }

    // Handle string confidence levels
    if (typeof confidence === "string") {
      const trimmed = confidence.trim().toLowerCase();
      if (trimmed === "high") {
        return "text-green-600 dark:text-green-500";
      }
      if (trimmed === "medium") {
        return "text-yellow-600 dark:text-yellow-500";
      }
      if (trimmed === "low") {
        return "text-orange-600 dark:text-orange-500";
      }
    }

    // Handle numeric confidence
    const numericConfidence =
      typeof confidence === "number"
        ? confidence
        : typeof confidence === "string"
        ? Number.parseFloat(confidence)
        : Number.NaN;

    if (Number.isNaN(numericConfidence)) {
      return "text-muted-foreground";
    }

    if (numericConfidence >= 80) {
      return "text-green-600 dark:text-green-500";
    }
    if (numericConfidence >= 60) {
      return "text-yellow-600 dark:text-yellow-500";
    }
    if (numericConfidence >= 40) {
      return "text-orange-600 dark:text-orange-500";
    }
    return "text-red-600 dark:text-red-500";
  }, [confidence]);
}

function buildChatPrompt(result: MomentumAnalysisResult) {
  const formattedConfidence = formatConfidence(result.confidence);
  const summary = [
    `Ticker: ${result.ticker}`,
    `Summary: ${result.summary}`,
    formattedConfidence ? `Confidence: ${formattedConfidence}` : null,
    `Analysis: ${result.analysis}`,
    result.reasoning ? `Reasoning: ${result.reasoning}` : null,
  ]
    .filter((line): line is string => Boolean(line))
    .join("\n");

  return `Analyze ${result.ticker} in detail. Current momentum card summary:\n${summary}`;
}

function formatConfidence(confidence?: number | string | null) {
  if (confidence === undefined || confidence === null) {
    return null;
  }

  if (typeof confidence === "number" && !Number.isNaN(confidence)) {
    return `${confidence}%`;
  }

  if (typeof confidence === "string") {
    const trimmed = confidence.trim().toLowerCase();
    if (!trimmed) {
      return null;
    }

    // Handle string confidence levels (low, medium, high)
    if (trimmed === "low" || trimmed === "medium" || trimmed === "high") {
      return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    }

    // Try to parse as number
    const numeric = Number.parseFloat(trimmed);
    return Number.isNaN(numeric) ? confidence.trim() : `${numeric}%`;
  }

  return null;
}

"use client";

import type { ReactNode } from "react";

type ErrorOverlayProps = {
  error: string | null;
  fallbackMessage?: ReactNode;
  onRetry?: (() => void) | null;
  retryLabel?: string;
};

export function ErrorOverlay({
  error,
  fallbackMessage,
  onRetry,
  retryLabel,
}: ErrorOverlayProps) {
  if (!error && !fallbackMessage) {
    return null;
  }

  const content = error ?? fallbackMessage;

  if (!content) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex h-full w-full flex-col justify-center rounded-[inherit] bg-background/85 p-6 text-center backdrop-blur">
      <div className="pointer-events-auto mx-auto w-full max-w-md rounded-xl bg-card px-6 py-4 text-lg font-medium text-foreground">
        <div>{content}</div>
        {error && onRetry ? (
          <button
            type="button"
            className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-none transition hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            onClick={onRetry}
          >
            {retryLabel ?? "Restart chat"}
          </button>
        ) : null}
      </div>
    </div>
  );
}

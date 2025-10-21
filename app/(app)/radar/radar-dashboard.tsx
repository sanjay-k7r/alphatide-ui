"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { Loader2, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { TickerSelect } from "@/features/tickers/components/TickerSelect";
import { useTickers } from "@/features/tickers/hooks/useTickers";
import { useColorScheme } from "@/hooks/useColorScheme";
import { MOMENTUM_WORKFLOW_ID } from "@/features/momentum/constants";
import { CREATE_SESSION_ENDPOINT, getThemeConfig } from "@/lib/config";

type RunState = "idle" | "running" | "ready" | "error";
type SessionState = "idle" | "loading" | "ready" | "error";

export function RadarDashboard() {
  const { tickers, loading, error, refresh } = useTickers();
  const { scheme } = useColorScheme();

  const [selectedTicker, setSelectedTicker] = useState("");
  const [runState, setRunState] = useState<RunState>("idle");
  const [sessionState, setSessionState] = useState<SessionState>("idle");
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [runError, setRunError] = useState<string | null>(null);
  const [lastRunTicker, setLastRunTicker] = useState<string | null>(null);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  useEffect(() => {
    setRunState("idle");
    setRunError(null);
    setLastRunTicker(null);
    setLastUpdatedAt(null);
  }, [selectedTicker]);

  const themeConfig = useMemo(() => getThemeConfig(scheme), [scheme]);

  const getClientSecret = useCallback(
    async (currentSecret: string | null) => {
      if (!MOMENTUM_WORKFLOW_ID) {
        const message = "Momentum workflow ID is not configured.";
        setSessionError(message);
        setSessionState("error");
        throw new Error(message);
      }

      if (!currentSecret) {
        setSessionState("loading");
        setSessionError(null);
      }

      try {
        const response = await fetch(CREATE_SESSION_ENDPOINT, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflow: { id: MOMENTUM_WORKFLOW_ID },
          }),
        });

        const json = (await response
          .json()
          .catch(() => ({}))) as { client_secret?: unknown; error?: unknown };

        if (!response.ok) {
          const message =
            typeof json?.error === "string"
              ? json.error
              : "Failed to create ChatKit session.";
          setSessionError(message);
          setSessionState("error");
          throw new Error(message);
        }

        const clientSecret =
          typeof json?.client_secret === "string"
            ? json.client_secret
            : null;

        if (!clientSecret) {
          const message = "ChatKit session response missing client secret.";
          setSessionError(message);
          setSessionState("error");
          throw new Error(message);
        }

        setSessionState("ready");
        setSessionError(null);
        return clientSecret;
      } catch (caught) {
        const message =
          caught instanceof Error
            ? caught.message
            : "Unable to create ChatKit session.";
        setSessionError(message);
        setSessionState("error");
        throw caught;
      }
    },
    []
  );

  const chatkit = useChatKit({
    api: { getClientSecret },
    theme: themeConfig,
    header: {
      enabled: false,
    },
    history: {
      enabled: false,
    },
    startScreen: {
      greeting:
        "The momentum agent will post its latest read right here. Use the run button above whenever you want a fresh take.",
      prompts: [],
    },
    composer: {
      placeholder: "Use the Run button above to trigger the agent.",
      attachments: {
        enabled: false,
      },
    },
    threadItemActions: {
      feedback: false,
    },
    disclaimer: {
      text: "Momentum analysis is experimental. Double-check before trading.",
      highContrast: false,
    },
    onResponseStart: () => {
      setRunState("running");
      setRunError(null);
    },
    onResponseEnd: () => {
      setRunState("ready");
      setLastUpdatedAt(new Date());
    },
    onError: ({ error: detail }: { error: unknown }) => {
      const message =
        detail instanceof Error
          ? detail.message
          : "ChatKit encountered an unexpected error.";
      setSessionError(message);
      setSessionState("error");
      console.error("[MomentumAgent] ChatKit error", detail);
    },
  });

  useEffect(() => {
    const element = chatkit.ref.current;
    if (!element) {
      return;
    }

    element.setOptions({
      ...chatkit.control.options,
      theme: themeConfig,
    });
  }, [chatkit, themeConfig]);

  const disabledReason = useMemo(() => {
    if (!selectedTicker) {
      return "Select a ticker to run the momentum agent.";
    }
    if (sessionState === "loading") {
      return "Momentum agent session is still starting.";
    }
    if (sessionState === "error") {
      return sessionError ?? "Momentum agent session failed to start.";
    }
    if (runState === "running") {
      return "Momentum agent is already running.";
    }
    return null;
  }, [selectedTicker, sessionError, sessionState, runState]);

  const handleRetrySession = useCallback(() => {
    setSessionError(null);
    setSessionState("idle");
    setWidgetKey((current) => current + 1);
  }, []);

  const handleRunMomentum = useCallback(async () => {
    if (!selectedTicker || sessionState !== "ready" || !chatkit.ref.current) {
      setRunError(
        !selectedTicker
          ? "Select a ticker first."
          : sessionState === "ready"
            ? "Momentum agent is not ready yet. Try again."
            : sessionError ?? "Momentum agent session is not ready."
      );
      setRunState("error");
      return;
    }

    try {
      setRunState("running");
      setRunError(null);
      setLastRunTicker(selectedTicker);
      setLastUpdatedAt(null);
      await chatkit.setThreadId(null);
      await chatkit.sendUserMessage({
        text: `Analyze momentum for ${selectedTicker}.`,
      });
    } catch (caught) {
      console.error("[RadarDashboard] Failed to send momentum request", caught);
      setRunError("Unable to run the momentum agent. Try again.");
      setRunState("error");
    }
  }, [chatkit, selectedTicker, sessionError, sessionState]);

  const running = runState === "running";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:p-8">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Radar</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Start simple: choose a ticker and let the momentum agent stream its
          take. We&apos;ll layer in more widgets after this path is solid.
        </p>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Ticker
          </Label>
          <TickerSelect
            value={selectedTicker}
            onValueChange={setSelectedTicker}
            tickers={tickers}
            loading={loading}
            error={error}
            onRefresh={refresh}
            placeholder="Select a ticker…"
          />
          {error ? (
            <p className="text-xs text-destructive">
              Unable to load tickers. Refresh or add tickers from the questions
              panel.
            </p>
          ) : null}
        </div>

        <Card className="overflow-hidden border-border/60">
          <CardHeader className="flex flex-col gap-4 border-b bg-muted/30 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">
                Momentum agent
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Press run to trigger the workflow. We pass the selected ticker
                as the only variable so the agent stays focused.
              </p>
              {lastUpdatedAt && lastRunTicker ? (
                <p className="text-xs text-muted-foreground/80">
                  Last run for {lastRunTicker} at{" "}
                  {lastUpdatedAt.toLocaleTimeString()}
                </p>
              ) : null}
            </div>
            <Button
              onClick={handleRunMomentum}
              disabled={Boolean(disabledReason)}
              title={disabledReason ?? "Run momentum analysis"}
              className="inline-flex items-center gap-2"
            >
              {running ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Play className="size-4" aria-hidden="true" />
              )}
              {running ? "Running…" : "Run"}
            </Button>
          </CardHeader>
          <CardContent className="relative space-y-4 p-0">
            {sessionState === "loading" ? (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80">
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                <p className="text-xs text-muted-foreground">
                  Starting momentum agent session…
                </p>
              </div>
            ) : null}

            {sessionState === "error" && sessionError ? (
              <div className="flex flex-col gap-3 p-6 text-sm text-destructive">
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4">
                  {sessionError}
                </div>
                <div>
                  <Button variant="outline" size="sm" onClick={handleRetrySession}>
                    Retry session
                  </Button>
                </div>
              </div>
            ) : null}

            {runState === "error" && runError ? (
              <div className="px-6 pt-6">
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                  {runError}
                </div>
              </div>
            ) : null}

            <div className="relative h-[420px] w-full">
              <ChatKit
                key={widgetKey}
                control={chatkit.control}
                className="momentum-chatkit h-full w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background to-transparent" />
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

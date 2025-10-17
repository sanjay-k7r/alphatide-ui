import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

type Trend = "up" | "down" | "flat"

const marketSnapshot = [
  {
    label: "SPY",
    price: "512.40",
    change: "+1.2%",
    trend: "up" as Trend,
    kpiLabel: "Breadth",
    kpiValue: "68% advancers",
  },
  {
    label: "QQQ",
    price: "432.18",
    change: "+0.8%",
    trend: "up" as Trend,
    kpiLabel: "Leaders",
    kpiValue: "9 of 11 sectors green",
  },
  {
    label: "VIX",
    price: "13.5",
    change: "-0.6",
    trend: "down" as Trend,
    kpiLabel: "Regime",
    kpiValue: "Low volatility",
  },
  {
    label: "Sentiment",
    price: "Bullish",
    change: "12 active alerts",
    trend: "flat" as Trend,
    kpiLabel: "Desk view",
    kpiValue: "Risk-on bias",
  },
]

const watchlist = [
  {
    ticker: "TSLA",
    status: "Bullish momentum building on heavy call flow.",
    confidence: 82,
    overviewKpis: [
      { label: "Setup", value: "Breakout continuation" },
      { label: "Risk/Reward", value: "2.6 : 1" },
      { label: "Next Catalyst", value: "Investor Day 5/21" },
    ],
    agents: [
      {
        id: "momentum",
        label: "Momentum",
        summary: "Higher highs + rising volume.",
        signal: "Bullish breakout",
        confidence: 88,
        change: "+14 pts / 24h",
        kpiLabel: "RSI",
        kpiValue: "68",
      },
      {
        id: "flow",
        label: "Flow",
        summary: "Call sweeps 1.8x average.",
        signal: "Aggressive call buyers",
        confidence: 81,
        change: "+6% premium",
        kpiLabel: "Net flow",
        kpiValue: "+$18M",
      },
      {
        id: "volatility",
        label: "Volatility",
        summary: "IV rank 62, trending higher.",
        signal: "Expect sustained expansion",
        confidence: 72,
        change: "+5 IV rank",
        kpiLabel: "IV rank",
        kpiValue: "62",
      },
      {
        id: "greeks",
        label: "Greeks",
        summary: "Delta stacking near 0.45.",
        signal: "Supports directional exposure",
        confidence: 76,
        change: "+0.08 delta",
        kpiLabel: "Gamma wall",
        kpiValue: "210",
      },
    ],
  },
  {
    ticker: "NVDA",
    status: "Volatility cooling after earnings gap.",
    confidence: 74,
    overviewKpis: [
      { label: "Setup", value: "Post-earnings digestion" },
      { label: "Range", value: "$885 – $935" },
      { label: "Next Catalyst", value: "AI Summit 5/10" },
    ],
    agents: [
      {
        id: "momentum",
        label: "Momentum",
        summary: "Digesting gap with higher lows.",
        signal: "Constructive consolidation",
        confidence: 69,
        change: "+1.2 pts / 4h",
        kpiLabel: "ADX",
        kpiValue: "24",
      },
      {
        id: "flow",
        label: "Flow",
        summary: "Balanced call/put ratio.",
        signal: "Neutral flows post-earnings",
        confidence: 58,
        change: "-3% call premium",
        kpiLabel: "Put/Call",
        kpiValue: "0.92",
      },
      {
        id: "volatility",
        label: "Volatility",
        summary: "IV crushed 18% from peak.",
        signal: "Opens spread opportunities",
        confidence: 83,
        change: "-9 IV rank",
        kpiLabel: "IV rank",
        kpiValue: "41",
      },
      {
        id: "greeks",
        label: "Greeks",
        summary: "Gamma neutral until 125 strike.",
        signal: "Expect range-bound action",
        confidence: 62,
        change: "+0.02 gamma",
        kpiLabel: "Delta neutral",
        kpiValue: "$920",
      },
    ],
  },
  {
    ticker: "AAPL",
    status: "Neutral trend; wait for confirmation above resistance.",
    confidence: 61,
    overviewKpis: [
      { label: "Setup", value: "Mean-reversion play" },
      { label: "Range", value: "$186 – $195" },
      { label: "Next Catalyst", value: "WWDC 6/10" },
    ],
    agents: [
      {
        id: "momentum",
        label: "Momentum",
        summary: "Oscillating near 50DMA.",
        signal: "Needs close above 195",
        confidence: 55,
        change: "+0.4 pts / 24h",
        kpiLabel: "RSI",
        kpiValue: "52",
      },
      {
        id: "flow",
        label: "Flow",
        summary: "Light flow, skew favors puts.",
        signal: "Hedging activity elevated",
        confidence: 48,
        change: "+2% put skew",
        kpiLabel: "Net flow",
        kpiValue: "-$6M",
      },
      {
        id: "volatility",
        label: "Volatility",
        summary: "IV rank 28, compressing.",
        signal: "Premium selling favored",
        confidence: 63,
        change: "-4 IV rank",
        kpiLabel: "IV rank",
        kpiValue: "28",
      },
      {
        id: "greeks",
        label: "Greeks",
        summary: "Theta decay accelerating.",
        signal: "Consider calendars",
        confidence: 59,
        change: "+0.03 theta",
        kpiLabel: "Theta",
        kpiValue: "-0.32",
      },
    ],
  },
]

const agentThemes: Record<string, { background: string; accent: string }> = {
  momentum: {
    background: "bg-muted/30",
    accent: "text-foreground",
  },
  flow: {
    background: "bg-muted/40",
    accent: "text-muted-foreground",
  },
  volatility: {
    background: "bg-muted/50",
    accent: "text-foreground/80",
  },
  greeks: {
    background: "bg-muted/60",
    accent: "text-muted-foreground",
  },
  default: {
    background: "bg-muted/30",
    accent: "text-foreground",
  },
}

type AgentInsight = (typeof watchlist)[number]["agents"][number]

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") {
    return <ArrowUpRight className="size-4 text-emerald-500" aria-hidden="true" />
  }
  if (trend === "down") {
    return <ArrowDownRight className="size-4 text-rose-500" aria-hidden="true" />
  }
  return <Minus className="size-4 text-muted-foreground" aria-hidden="true" />
}

function formatSentence(text: string | undefined) {
  if (!text) return null
  const trimmed = text.trim()
  if (!trimmed) return null
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`
}

function buildAgentReasoning(agent: AgentInsight) {
  return [
    formatSentence(agent.summary),
    formatSentence(`Desk reads: ${agent.signal} (confidence ${agent.confidence}%).`),
    formatSentence(`${agent.kpiLabel} sits at ${agent.kpiValue} (${agent.change}).`),
  ].filter(Boolean) as string[]
}

export default function RadarPage() {
  return (
    <div className="flex min-h-full flex-col bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="mb-4">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Radar</h1>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Mock dashboard preview. Real-time agent insights coming in Phase 2.
          </p>
        </header>

        <section
          aria-label="Market control tower"
          className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
        >
          {marketSnapshot.map((item) => (
            <article
              key={item.label}
              className="flex h-[96px] flex-col justify-between rounded-lg border border-border/60 bg-card px-4 py-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {item.label}
                  </h2>
                  <p className="text-lg font-semibold text-foreground">{item.price}</p>
                </div>
                <TrendIcon trend={item.trend} />
              </div>
              <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                <span
                  className={
                    item.trend === "up"
                      ? "font-semibold text-emerald-500"
                      : item.trend === "down"
                        ? "font-semibold text-rose-500"
                        : "font-semibold text-muted-foreground"
                  }
                >
                  {item.change}
                </span>
                <span className="text-right">
                  {item.kpiLabel}:{" "}
                  <span className="font-semibold text-foreground">{item.kpiValue}</span>
                </span>
              </div>
            </article>
          ))}
        </section>

        <section aria-label="Watchlist overview" className="space-y-3">
          {watchlist.map((item) => (
            <Card
              key={item.ticker}
              className="border-border/60 transition-colors hover:border-border"
            >
              <CardHeader className="border-b border-border/60 px-4 py-2.5">
                <div className="grid gap-y-1.5 text-sm">
                  <div className="grid min-w-0 grid-cols-[minmax(120px,1fr)_repeat(3,minmax(140px,1fr))_minmax(120px,auto)] items-baseline gap-3">
                    <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                      {item.ticker}
                    </CardTitle>
                    {item.overviewKpis.slice(0, 3).map((kpi) => (
                      <span
                        key={`${item.ticker}-${kpi.label}-label`}
                        className="text-xs uppercase tracking-wide text-muted-foreground"
                      >
                        {kpi.label}
                      </span>
                    ))}
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">
                      Confidence
                    </span>
                  </div>
                  <div className="grid min-w-0 grid-cols-[minmax(120px,1fr)_repeat(3,minmax(140px,1fr))_minmax(120px,auto)] items-start gap-3">
                    <span className="truncate text-sm text-muted-foreground">{item.status}</span>
                    {item.overviewKpis.slice(0, 3).map((kpi) => (
                      <span
                        key={`${item.ticker}-${kpi.label}-value`}
                        className="text-sm font-semibold text-foreground"
                      >
                        {kpi.value}
                      </span>
                    ))}
                    <span className="text-sm font-semibold tabular-nums text-foreground">
                      {item.confidence}%
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {item.agents.map((agent) => {
                    const theme = agentThemes[agent.id] ?? agentThemes.default
                    const reasoning = buildAgentReasoning(agent)

                    return (
                      <div
                        key={agent.id}
                        className={cn(
                          "flex min-h-[228px] flex-col rounded-xl bg-card/90 p-4 shadow-sm ring-1 ring-inset ring-border/40 transition-all",
                          theme.background
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <p
                            className={cn(
                              "text-[10px] font-semibold uppercase tracking-[0.3em]",
                              theme.accent
                            )}
                          >
                            {agent.label}
                          </p>
                          <div className="text-right">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-muted-foreground">
                              Focus Metric
                            </span>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                              {agent.kpiLabel}
                            </p>
                            <p className="text-xl font-semibold leading-none text-foreground">
                              {agent.kpiValue}
                            </p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                          <div>
                            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                              Confidence
                            </span>
                            <div className="mt-1 flex items-baseline gap-1 text-foreground">
                              <span className="text-5xl font-semibold leading-none tracking-tight">
                                {agent.confidence}
                              </span>
                              <span className="text-2xl font-semibold leading-none text-foreground/60">%</span>
                            </div>
                            <span className="mt-3 inline-block text-[10px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
                              Δ {agent.change}
                            </span>
                          </div>
                        </div>
                        <div className="mt-6">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            Signal
                          </span>
                          <p className="mt-2 text-base font-semibold leading-snug text-foreground">
                            {agent.signal}
                          </p>
                        </div>
                        <div className="mt-4">
                          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                            Reasoning
                          </span>
                          <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
                            {reasoning.map((sentence, index) => (
                              <p key={`${agent.id}-reasoning-${index}`}>{sentence}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}

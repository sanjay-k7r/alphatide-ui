import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

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

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") {
    return <ArrowUpRight className="size-4 text-emerald-500" aria-hidden="true" />
  }
  if (trend === "down") {
    return <ArrowDownRight className="size-4 text-rose-500" aria-hidden="true" />
  }
  return <Minus className="size-4 text-muted-foreground" aria-hidden="true" />
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
              <CardHeader className="space-y-3 border-b border-border/60 px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="max-w-xl space-y-1">
                    <CardTitle className="text-xl font-semibold leading-tight tracking-tight">
                      {item.ticker}
                    </CardTitle>
                    <CardDescription className="text-sm leading-6 text-muted-foreground">
                      {item.status}
                    </CardDescription>
                  </div>
                  <div className="inline-flex items-center rounded-md border border-emerald-600/30 bg-emerald-500/10 px-4 py-1.5 text-base font-semibold text-emerald-600">
                    {item.confidence}% confidence
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 text-sm">
                  {item.overviewKpis.map((kpi) => (
                    <div key={kpi.label} className="min-w-[140px]">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {kpi.label}
                      </p>
                      <p className="text-sm font-semibold text-foreground">{kpi.value}</p>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {item.agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex min-h-[148px] flex-col justify-between rounded-lg border border-border/50 bg-muted/10 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          {agent.label}
                        </p>
                        <span className="text-sm font-semibold text-foreground">
                          {agent.confidence}%
                        </span>
                      </div>
                      <p className="mt-1 text-base font-semibold leading-snug text-foreground">
                        {agent.signal}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">{agent.summary}</p>
                      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                        <div>
                          <dt className="uppercase tracking-wide">{agent.kpiLabel}</dt>
                          <dd className="text-sm font-semibold text-foreground">
                            {agent.kpiValue}
                          </dd>
                        </div>
                        <div className="text-right">
                          <dt className="uppercase tracking-wide">Change</dt>
                          <dd className="text-sm font-semibold text-foreground">
                            {agent.change}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </section>
      </div>
    </div>
  )
}

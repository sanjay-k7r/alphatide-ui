"use client";

import { useState } from "react";

import { ArrowDownRight, ArrowUpRight, Minus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "flat";

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
];

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
        summary: "Theta decay favored.",
        signal: "Delta neutral positioning",
        confidence: 54,
        change: "+0.03 theta",
        kpiLabel: "Theta decay",
        kpiValue: "0.18",
      },
    ],
  },
];

const agentFilters = [
  { id: "all", label: "All agents" },
  { id: "momentum", label: "Momentum" },
  { id: "flow", label: "Flow" },
  { id: "volatility", label: "Volatility" },
  { id: "greeks", label: "Greeks" },
];

const agentBuckets = [
  { id: "insights", label: "Insights" },
  { id: "actions", label: "Actions" },
  { id: "alerts", label: "Alerts" },
];

type AgentFilter = (typeof agentFilters)[number]["id"];
type AgentBucket = (typeof agentBuckets)[number]["id"];

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") {
    return <ArrowUpRight className="size-4 text-emerald-500" />;
  }

  if (trend === "down") {
    return <ArrowDownRight className="size-4 text-red-500" />;
  }

  return <Minus className="size-4 text-muted-foreground" />;
}

export function RadarDashboard() {
  const [selectedAgentFilter, setSelectedAgentFilter] =
    useState<AgentFilter>("all");
  const [selectedAgentBucket, setSelectedAgentBucket] =
    useState<AgentBucket>("insights");

  return (
    <div className="flex h-full flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Market Radar
          </h1>
          <p className="text-sm text-muted-foreground">
            Agent consensus across macro, flow, and technical signals
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 rounded-full border-dashed"
          >
            <RefreshCw className="mr-2 size-4" />
            Sync desk view
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                {agentBuckets.find((bucket) => bucket.id === selectedAgentBucket)
                  ?.label ?? "Insights"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Focus areas</DropdownMenuLabel>
              <DropdownMenuRadioGroup
                value={selectedAgentBucket}
                onValueChange={(value) =>
                  setSelectedAgentBucket(value as AgentBucket)
                }
              >
                {agentBuckets.map((bucket) => (
                  <DropdownMenuRadioItem key={bucket.id} value={bucket.id}>
                    {bucket.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {marketSnapshot.map((item) => (
          <Card key={item.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {item.label}
              </CardTitle>
              <TrendIcon trend={item.trend} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-foreground">
                {item.price}
              </div>
              <p className="text-xs text-muted-foreground">{item.change}</p>
              <dl className="mt-3 flex items-center justify-between rounded-md border border-dashed border-border bg-muted/30 px-2 py-1 text-xs text-muted-foreground">
                <dt>{item.kpiLabel}</dt>
                <dd className="font-medium text-foreground">{item.kpiValue}</dd>
              </dl>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {watchlist.map((stock) => (
          <Card key={stock.ticker} className="lg:col-span-3">
            <CardHeader className="flex flex-col gap-4 space-y-0 border-b border-border pb-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {stock.ticker}
                  </h3>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600">
                    {stock.status}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Agent confidence {stock.confidence}%
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {stock.overviewKpis.map((kpi) => (
                  <div
                    key={kpi.label}
                    className="flex items-center gap-1 rounded-full border border-dashed border-border px-3 py-1 text-xs text-muted-foreground"
                  >
                    <span className="font-medium text-foreground">
                      {kpi.label}:
                    </span>
                    <span>{kpi.value}</span>
                  </div>
                ))}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">Filter by agent:</p>
                <div className="flex flex-wrap gap-2">
                  {agentFilters.map((filter) => (
                    <Button
                      key={filter.id}
                      type="button"
                      variant={
                        selectedAgentFilter === filter.id ? "default" : "ghost"
                      }
                      size="sm"
                      className={cn(
                        "rounded-full",
                        selectedAgentFilter === filter.id
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground"
                      )}
                      onClick={() => setSelectedAgentFilter(filter.id)}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stock.agents
                  .filter(
                    (agent) =>
                      selectedAgentFilter === "all" ||
                      agent.id === selectedAgentFilter
                  )
                  .map((agent) => (
                    <Card
                      key={agent.id}
                      className={cn(
                        "border border-border/80 bg-card",
                        selectedAgentBucket === "alerts" && agent.confidence > 80
                          ? "border-amber-500/70 bg-amber-500/10"
                          : selectedAgentBucket === "actions" &&
                            agent.confidence > 75
                            ? "border-emerald-500/70 bg-emerald-500/10"
                            : ""
                      )}
                    >
                      <CardHeader className="space-y-1 pb-2">
                        <CardTitle className="text-sm font-medium text-foreground">
                          {agent.label}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                          {agent.summary}
                        </p>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">
                            Signal
                          </p>
                          <p className="text-sm font-medium text-foreground">
                            {agent.signal}
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <div>
                            <p>Confidence</p>
                            <p className="font-medium text-foreground">
                              {agent.confidence}%
                            </p>
                          </div>
                          <div>
                            <p>Change</p>
                            <p className="font-medium text-foreground">
                              {agent.change}
                            </p>
                          </div>
                          <div>
                            <p>{agent.kpiLabel}</p>
                            <p className="font-medium text-foreground">
                              {agent.kpiValue}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}

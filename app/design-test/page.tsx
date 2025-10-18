"use client";

import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw, TrendingUp, Activity, BarChart3, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function DesignTestPage() {
  const [isAnimating, setIsAnimating] = useState(false);
  const [refreshCadence, setRefreshCadence] = useState("30s");
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const triggerAnimation = () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-foreground" />
            <h1 className="text-sm font-semibold tracking-tight">Design System Test</h1>
          </div>
          <div className="text-xs text-muted-foreground">
            Standalone preview • Not connected to app
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Color Palette */}
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Color Palette</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Grayscale */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Grayscale Foundation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <span className="text-sm">Background</span>
                  <span className="text-xs font-mono text-muted-foreground">bg-background</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-foreground p-3">
                  <span className="text-sm text-background">Foreground</span>
                  <span className="text-xs font-mono text-background">bg-foreground</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-muted p-3">
                  <span className="text-sm">Muted</span>
                  <span className="text-xs font-mono text-muted-foreground">bg-muted</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary p-3">
                  <span className="text-sm">Secondary</span>
                  <span className="text-xs font-mono text-muted-foreground">bg-secondary</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border-2 border-border bg-background p-3">
                  <span className="text-sm">Border</span>
                  <span className="text-xs font-mono text-muted-foreground">border-border</span>
                </div>
              </CardContent>
            </Card>

            {/* Semantic Colors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Semantic Colors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="size-4 text-emerald-500" />
                    <span className="text-base font-semibold text-emerald-500">+2.5%</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Positive</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="size-4 text-rose-500" />
                    <span className="text-base font-semibold text-rose-500">-1.8%</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">Negative</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border bg-destructive p-3">
                  <span className="text-sm font-semibold text-white">Destructive</span>
                  <span className="text-xs font-mono text-white/80">bg-destructive</span>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-xs text-muted-foreground">
                    Color is used sparingly and only for critical information
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Text Colors */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Text Hierarchy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm font-semibold text-foreground">Primary text</p>
                  <p className="text-xs text-muted-foreground">text-foreground</p>
                </div>
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="text-sm text-muted-foreground">Secondary text</p>
                  <p className="text-xs text-muted-foreground/70">text-muted-foreground</p>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <p className="text-sm font-semibold text-card-foreground">Card text</p>
                  <p className="text-xs text-muted-foreground">text-card-foreground</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Typography */}
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Typography</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Type Scale */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Type Scale & Weights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    Page Title
                  </p>
                  <p className="text-xs text-muted-foreground">text-2xl font-semibold</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-semibold tracking-tight text-foreground">
                    Section Heading
                  </p>
                  <p className="text-xs text-muted-foreground">text-xl font-semibold</p>
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold text-foreground">Card Title / Ticker</p>
                  <p className="text-xs text-muted-foreground">text-lg font-semibold</p>
                </div>
                <div className="space-y-1">
                  <p className="text-base font-semibold text-foreground">Emphasized Content</p>
                  <p className="text-xs text-muted-foreground">text-base font-semibold</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-foreground">Body Text / Descriptions</p>
                  <p className="text-xs text-muted-foreground">text-sm</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Labels / Metadata
                  </p>
                  <p className="text-xs text-muted-foreground">text-xs uppercase tracking-wide</p>
                </div>
              </CardContent>
            </Card>

            {/* Financial Data Typography */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Financial Data Display
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Ticker
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-foreground">
                      TSLA
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Price
                    </span>
                    <span className="text-lg font-semibold tabular-nums text-foreground">$512.40</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Change
                    </span>
                    <span className="text-base font-semibold tabular-nums text-emerald-500">
                      +1.2%
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      Confidence
                    </span>
                    <span className="text-base font-semibold tabular-nums text-foreground">82%</span>
                  </div>
                </div>
                <div className="space-y-2 rounded-lg border border-border bg-background p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    Dense body text optimized for scanning financial data. Higher highs with rising
                    volume. RSI 68, momentum building.
                  </p>
                  <p className="text-xs text-muted-foreground">
                    text-sm leading-relaxed • Optimized for readability
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Components */}
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Components</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Buttons */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Buttons
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="outline">Outline</Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm">Small</Button>
                  <Button size="default">Default</Button>
                  <Button size="lg">Large</Button>
                  <Button size="icon">
                    <RefreshCw className="size-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button disabled>Disabled</Button>
                  <Button className="active:scale-[0.98] transition-transform">
                    Press Me (Scale Effect)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Inputs & Forms */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Inputs & Forms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="ticker" className="text-xs font-medium">
                    Ticker Symbol
                  </Label>
                  <Input id="ticker" placeholder="AAPL" className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="disabled" className="text-xs font-medium">
                    Disabled Input
                  </Label>
                  <Input id="disabled" placeholder="Disabled" disabled className="h-9 text-sm" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="alerts" checked={alertsEnabled} onCheckedChange={setAlertsEnabled} />
                  <Label htmlFor="alerts" className="text-sm">
                    Enable alerts
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Dropdowns */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Dropdown Menu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="sm" className="w-full">
                      <RefreshCw className="mr-2 size-4" />
                      Refresh: {refreshCadence}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
                      Refresh cadence
                    </DropdownMenuLabel>
                    <DropdownMenuRadioGroup value={refreshCadence} onValueChange={setRefreshCadence}>
                      <DropdownMenuRadioItem value="15s">15s</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="30s">30s</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="1m">1m</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="5m">5m</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>

            {/* Cards */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Card Variants
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Card className="border-border/50 bg-card shadow-sm">
                  <CardContent className="p-3">
                    <p className="text-sm text-foreground">Standard Card</p>
                    <p className="text-xs text-muted-foreground">border-border/50 shadow-sm</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-muted/40 shadow-sm">
                  <CardContent className="p-3">
                    <p className="text-sm text-foreground">Muted Card</p>
                    <p className="text-xs text-muted-foreground">bg-muted/40</p>
                  </CardContent>
                </Card>
                <Card className="border-border/50 bg-card shadow-sm transition-colors hover:border-border">
                  <CardContent className="p-3">
                    <p className="text-sm text-foreground">Hover to see border change</p>
                    <p className="text-xs text-muted-foreground">transition-colors</p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Animations */}
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Animations & Motion</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Micro-interactions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Spinning icon (on action)</p>
                  <Button onClick={triggerAnimation} variant="secondary" size="sm">
                    <RefreshCw
                      className={cn("mr-2 size-4 transition-transform", isAnimating && "animate-spin")}
                    />
                    Trigger Animation
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Scale on press (try clicking)</p>
                  <Button className="active:scale-[0.98] transition-transform" variant="secondary">
                    Press Me
                  </Button>
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Hover transitions</p>
                  <Card className="border-border/50 bg-card shadow-sm transition-all hover:border-border hover:shadow-md">
                    <CardContent className="p-3">
                      <p className="text-sm">Hover over this card</p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  Animation Principles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Zap className="size-4 text-foreground" />
                    <p className="text-sm font-semibold">Fast</p>
                  </div>
                  <p className="text-xs text-muted-foreground">150-300ms transitions for responsive feel</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <Activity className="size-4 text-foreground" />
                    <p className="text-sm font-semibold">Smooth</p>
                  </div>
                  <p className="text-xs text-muted-foreground">60fps minimum, GPU-accelerated properties</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="mb-1 flex items-center gap-2">
                    <BarChart3 className="size-4 text-foreground" />
                    <p className="text-sm font-semibold">Subtle</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Micro-interactions, not showpieces</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator />

        {/* Layout Patterns */}
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Layout Patterns</h2>

          {/* Market Snapshot Grid */}
          <div className="mb-4">
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Market Snapshot Grid (1→2→4 columns)
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {["SPY", "QQQ", "VIX", "Sentiment"].map((label, idx) => (
                <article
                  key={label}
                  className="flex h-[96px] flex-col justify-between rounded-lg border border-border/50 bg-card px-4 py-3 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {label}
                      </h3>
                      <p className="text-xl font-semibold text-foreground">
                        {idx === 0 ? "$512.40" : idx === 1 ? "$432.18" : idx === 2 ? "13.5" : "Bullish"}
                      </p>
                    </div>
                    {idx < 2 ? (
                      <ArrowUpRight className="size-4 text-emerald-500" />
                    ) : idx === 2 ? (
                      <ArrowDownRight className="size-4 text-rose-500" />
                    ) : null}
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-muted-foreground">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        idx < 2 ? "text-emerald-500" : idx === 2 ? "text-rose-500" : ""
                      )}
                    >
                      {idx === 0 ? "+1.2%" : idx === 1 ? "+0.8%" : idx === 2 ? "-0.6" : "12 alerts"}
                    </span>
                    <span>
                      KPI: <span className="font-semibold text-foreground">Value</span>
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* Agent Cards Grid */}
          <div>
            <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Agent Cards Grid (Stacked→2→4 columns)
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Momentum", icon: TrendingUp },
                { label: "Flow", icon: Activity },
                { label: "Volatility", icon: BarChart3 },
                { label: "Greeks", icon: Zap },
              ].map((agent) => (
                <div
                  key={agent.label}
                  className="flex min-h-[200px] flex-col rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-colors hover:border-border"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
                      {agent.label}
                    </p>
                    <p className="text-[11px] font-medium text-muted-foreground">5 min ago</p>
                  </div>
                  <p className="mt-3 text-base font-semibold leading-tight text-foreground">
                    {agent.label === "Momentum"
                      ? "Higher highs + rising volume."
                      : agent.label === "Flow"
                      ? "Call sweeps 1.8x average."
                      : agent.label === "Volatility"
                      ? "IV rank 62, trending higher."
                      : "Delta stacking near 0.45."}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {agent.label === "Momentum"
                      ? "Bullish breakout. RSI is holding at 68 with +14 pts / 24h. Prediction confidence 88%."
                      : agent.label === "Flow"
                      ? "Aggressive call buyers. Net flow is holding at +$18M with +6% premium. Prediction confidence 81%."
                      : agent.label === "Volatility"
                      ? "Expect sustained expansion. IV rank is holding at 62 with +5 IV rank. Prediction confidence 72%."
                      : "Supports directional exposure. Gamma wall is holding at 210 with +0.08 delta. Prediction confidence 76%."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <Separator />

        {/* Responsive Breakpoints */}
        <section>
          <h2 className="mb-4 text-xl font-semibold tracking-tight">Responsive Breakpoints</h2>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="rounded-lg border border-border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Current Breakpoint:</span>
                    <span className="font-mono text-sm font-semibold">
                      <span className="sm:hidden">xs (&lt; 640px)</span>
                      <span className="hidden sm:inline md:hidden">sm (640px+)</span>
                      <span className="hidden md:inline lg:hidden">md (768px+)</span>
                      <span className="hidden lg:inline xl:hidden">lg (1024px+)</span>
                      <span className="hidden xl:inline 2xl:hidden">xl (1280px+)</span>
                      <span className="hidden 2xl:inline">2xl (1536px+)</span>
                    </span>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Mobile First</p>
                    <p className="mt-1 text-sm">Start mobile, enhance up</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Touch Targets</p>
                    <p className="mt-1 text-sm">44x44px minimum</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-muted-foreground">Information Density</p>
                    <p className="mt-1 text-sm">Dense on desktop</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

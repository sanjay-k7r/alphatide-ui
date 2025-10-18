# Alphatide Design System

**Version:** 1.0
**Last Updated:** October 18, 2025
**Product:** Alphatide Options Trading Platform

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Component Library](#component-library)
5. [Layout & Spacing](#layout--spacing)
6. [Animation & Motion](#animation--motion)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Implementation Guidelines](#implementation-guidelines)

---

## Design Philosophy

### Core Principles

**1. Minimal & Intentional**

- Black, white, and grayscale as the foundation
- Color used only for critical information (positive/negative changes, alerts)
- No decorative elements; every pixel serves a purpose

**2. Information Density**

- World-class typography optimized for financial data scanning
- Dense layouts that maximize information per viewport
- Hierarchical organization for rapid comprehension

**3. Flat & Clean**

- No shadows or gradients (except where absolutely necessary for hierarchy)
- Crisp borders and clear separation
- Emphasis through typography and spacing, not visual effects

**4. Performance First**

- Smooth, fast, tiny animations
- Micro-interactions that enhance usability without distraction
- Instant visual feedback for all user actions

**5. Responsive Excellence**

- Mobile-first approach with desktop optimization
- Adaptive layouts that reflow gracefully across breakpoints
- Touch-friendly targets on mobile, information-dense on desktop

---

## Color System

### Base Palette

Our color system is built on a grayscale foundation with minimal accent colors.

#### Grayscale (Light Mode)

```css
--background: #ffffff        /* Pure white background */
--foreground: #111111        /* Near-black text */
--card: #ffffff              /* Card backgrounds */
--muted: #f0f0f0            /* Subtle backgrounds */
--muted-foreground: #6b6b6b /* Secondary text */
--border: #e2e2e2           /* Borders and dividers */
--secondary: #f5f5f5        /* Secondary UI elements */
```

#### Grayscale (Dark Mode)

```css
--background: #090909        /* Near-black background */
--foreground: #f5f5f5        /* Off-white text */
--card: #111111              /* Card backgrounds */
--muted: #141414            /* Subtle backgrounds */
--muted-foreground: #cfcfcf /* Secondary text */
--border: #1f1f1f           /* Borders and dividers */
--secondary: #141414        /* Secondary UI elements */
```

### Accent Colors (Semantic)

Use sparingly and only when conveying critical information:

```css
/* Positive values (gains, bullish signals) */
--emerald-500: #10b981       /* Light mode */
--emerald-400: #34d399       /* Dark mode - softer for dark backgrounds */

/* Negative values (losses, bearish signals) */
--rose-500: #f43f5e          /* Light mode */
--rose-400: #fb7185          /* Dark mode - softer for dark backgrounds */

/* Destructive actions */
--destructive: #d92d20       /* Light mode */
--destructive: #f97066       /* Dark mode */

/* Focus and interactive states */
--ring: #111111              /* Light mode */
--ring: #f5f5f5              /* Dark mode */
```

### Color Usage Guidelines

**DO:**

- Use emerald for positive price changes, bullish signals
- Use rose for negative price changes, bearish signals
- Keep most UI in grayscale
- Use high contrast ratios (WCAG AAA preferred)

**DON'T:**

- Use color as the only means of conveying information
- Add decorative colors
- Use more than 2-3 colors per screen
- Use low-contrast color combinations

---

## Typography

### Font Stack

```css
--font-sans: Arial, Helvetica, sans-serif;
--font-mono: SFMono-Regular, Consolas, "Liberation Mono", monospace;
```

**Rationale:** System fonts for instant loading, cross-platform consistency, and excellent readability.

### Type Scale

Tailwind's default scale, used strategically:

```css
text-xs     /* 0.75rem / 12px  - Labels, metadata, timestamps */
text-sm     /* 0.875rem / 14px - Body text, descriptions */
text-base   /* 1rem / 16px     - Primary content */
text-lg     /* 1.125rem / 18px - Emphasized content */
text-xl     /* 1.25rem / 20px  - Section headings */
text-2xl    /* 1.5rem / 24px   - Page titles */
```

### Font Weights

```css
font-normal      /* 400 - Body text, secondary information */
font-medium      /* 500 - Labels, KPI keys */
font-semibold    /* 600 - Headings, emphasized values */
font-bold        /* 700 - Sparingly for critical alerts */
```

### Typography Patterns

#### Financial Data Display

```tsx
/* Ticker symbols */
<span className="text-lg font-semibold tracking-tight">TSLA</span>

/* Price values */
<span className="text-lg font-semibold tabular-nums">$512.40</span>

/* Percentage changes */
<span className="text-base font-semibold tabular-nums text-emerald-500">+1.2%</span>

/* Labels (uppercase, wide tracking) */
<span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
  IV RANK
</span>

/* Body text with dense information */
<p className="text-sm leading-relaxed text-muted-foreground">
  Higher highs + rising volume. RSI 68.
</p>
```

#### Key Typography Classes

```css
/* Numeric data */
.tabular-nums           /* Monospaced numbers for alignment */

/* Spacing */
/* Monospaced numbers for alignment */

/* Spacing */
.tracking-tight         /* -0.025em - Headings, tickers */
.tracking-wide          /* 0.025em - Labels */
.tracking-[0.32em]      /* Extra wide for agent labels */

/* Line height */
.leading-tight          /* 1.25 - Headlines */
.leading-snug           /* 1.375 - Dense text */
.leading-relaxed; /* 1.625 - Body text */
```

---

## Component Library

All components use **shadcn/ui** exclusively. Never create custom components when a shadcn variant exists.

### Core Components

#### Button

```tsx
import { Button } from "@/components/ui/button"

/* Primary action */
<Button>Execute Trade</Button>

/* Secondary action */
<Button variant="secondary">Cancel</Button>

/* Destructive action */
<Button variant="destructive">Delete Watchlist</Button>

/* Ghost (minimal) */
<Button variant="ghost" size="icon">
  <RefreshCw className="size-4" />
</Button>

/* Icon button with border (theme toggle, toolbars) */
<Button
  variant="ghost"
  size="icon"
  className="size-8 rounded border border-border bg-background hover:bg-muted"
>
  <Moon className="size-4" />
</Button>

/* Sizes */
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
```

#### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

<Card className="border border-border/50 bg-card shadow-sm">
  <CardHeader className="border-b border-border/60 px-4 py-2.5">
    <CardTitle className="text-lg font-semibold tracking-tight">TSLA</CardTitle>
  </CardHeader>
  <CardContent className="px-4 pb-4 pt-3">{/* Content */}</CardContent>
</Card>;
```

#### Dropdown Menu

```tsx
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="secondary" size="sm">
      <RefreshCw className="size-4" />
      30s
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end">
    <DropdownMenuLabel>Refresh cadence</DropdownMenuLabel>
    <DropdownMenuRadioGroup value={value} onValueChange={setValue}>
      <DropdownMenuRadioItem value="15s">15s</DropdownMenuRadioItem>
      <DropdownMenuRadioItem value="30s">30s</DropdownMenuRadioItem>
    </DropdownMenuRadioGroup>
  </DropdownMenuContent>
</DropdownMenu>;
```

#### Input & Form Elements

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

/* Text input */
<div className="space-y-1.5">
  <Label htmlFor="ticker" className="text-xs font-medium">
    Ticker Symbol
  </Label>
  <Input
    id="ticker"
    placeholder="AAPL"
    className="h-9 text-sm"
  />
</div>

/* Switch for toggles */
<div className="flex items-center space-x-2">
  <Switch id="alerts" />
  <Label htmlFor="alerts" className="text-sm">
    Enable alerts
  </Label>
</div>
```

#### Dialog & Sheet

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

/* Modal dialog (desktop) */
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Add Ticker</DialogTitle>
    </DialogHeader>
    {/* Content */}
  </DialogContent>
</Dialog>

/* Sheet (mobile-friendly slide-in) */
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent side="right">
    <SheetHeader>
      <SheetTitle>Settings</SheetTitle>
    </SheetHeader>
    {/* Content */}
  </SheetContent>
</Sheet>
```

#### Theme Toggle

```tsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useColorScheme } from "@/hooks/useColorScheme"

export function ThemeToggle() {
  const { scheme, setScheme } = useColorScheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setScheme(scheme === "dark" ? "light" : "dark")}
      className="size-8 rounded border border-border bg-background hover:bg-muted"
      aria-label="Toggle theme"
    >
      {scheme === "dark" ? (
        <Sun className="size-4 text-foreground" />
      ) : (
        <Moon className="size-4 text-foreground" />
      )}
    </Button>
  )
}
```

**Key Features:**
- Border for better contrast in dark mode
- Less rounded (`rounded` instead of `rounded-md`)
- Background color for visibility
- Hover state with muted background

### Component Customization

Always use Tailwind classes to customize shadcn components:

```tsx
/* DO: Extend with Tailwind utilities */
<Card className="border-border/50 bg-card shadow-sm hover:border-border transition-colors">

/* DON'T: Create custom styled-components or CSS modules */
```

---

## Layout & Spacing

### Grid System

Use CSS Grid for complex layouts, Flexbox for simple ones:

```tsx
/* Responsive grid (cards, agent panels) */
<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
  {items.map(item => <Card key={item.id} />)}
</div>

/* Fixed-column grid with responsive columns */
<div className="grid grid-cols-[minmax(240px,2fr)_minmax(110px,1fr)_repeat(3,minmax(120px,1fr))] gap-4">
  {/* Ticker overview layout */}
</div>

/* Flexbox for simple horizontal layouts */
<div className="flex items-center justify-between gap-3">
  <span>Label</span>
  <Button size="sm">Action</Button>
</div>
```

### Spacing Scale

Tailwind's spacing scale (4px base unit):

```css
gap-1      /* 0.25rem / 4px  */
gap-2      /* 0.5rem / 8px   */
gap-3      /* 0.75rem / 12px */
gap-4      /* 1rem / 16px    */
gap-5      /* 1.25rem / 20px */
gap-6      /* 1.5rem / 24px  */

px-4       /* Horizontal padding: 16px */
py-3       /* Vertical padding: 12px */
```

### Container Widths

```tsx
/* Page container */
<div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

/* Navbar container */
<div className="mx-auto flex h-14 w-full max-w-7xl items-center gap-2 px-4 sm:px-6">
  {/* Nav items */}
</div>
```

### Spacing Patterns

```tsx
/* Section spacing */
<section className="mb-5 space-y-3">
  {/* Cards with consistent vertical spacing */}
</section>

/* Card internal spacing */
<Card>
  <CardHeader className="px-4 py-2.5">
    {/* Compact header */}
  </CardHeader>
  <CardContent className="px-4 pb-4 pt-3">
    {/* Content with breathing room */}
  </CardContent>
</Card>
```

---

## Animation & Motion

### Animation Principles

1. **Purpose-driven:** Every animation serves a functional purpose
2. **Fast:** 150-300ms for most transitions
3. **Smooth:** 60fps minimum, use GPU-accelerated properties
4. **Subtle:** Micro-interactions, not showpieces

### Transition Classes

```css
/* Standard transition for hover states */
.transition-colors      /* Color changes only */
/* Color changes only */
.transition-all         /* All properties (use sparingly) */

/* Duration */
.duration-150           /* 150ms - Quick state changes */
.duration-200           /* 200ms - Default */
.duration-300; /* 300ms - Slower, deliberate */
```

### Animation Examples

```tsx
/* Hover states */
<Card className="transition-colors hover:border-border">

/* Button press feedback */
<Button className="active:scale-[0.98] transition-transform">

/* Icon rotation on action */
<RefreshCw className={cn(
  "size-4 transition-transform",
  isRefreshing && "animate-spin"
)} />

/* Fade in content */
<div className="animate-in fade-in duration-200">
  {content}
</div>

/* Slide in from bottom (mobile sheet) */
<Sheet>
  <SheetContent className="animate-in slide-in-from-right duration-300">
    {content}
  </SheetContent>
</Sheet>
```

### GPU-Accelerated Properties

Prefer these for smooth animations:

```css
transform: translate()   /* Position changes */
transform: scale()       /* Size changes */
opacity                  /* Fade effects */
```

Avoid animating:

```css
/* These trigger layout recalculation */
width, height, margin, padding, top, left
```

---

## Responsive Design

### Breakpoints

```css
/* Tailwind defaults */
sm: 640px   /* Small tablets */
md: 768px   /* Tablets */
lg: 1024px  /* Small desktops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large desktops */
```

### Mobile-First Approach

Start with mobile layout, progressively enhance:

```tsx
/* Mobile: stacked, Desktop: grid */
<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">

/* Mobile: hidden, Desktop: visible */
<div className="hidden lg:block">

/* Mobile: full width, Desktop: constrained */
<Card className="w-full lg:w-auto">
```

### Layout Patterns

#### Market Overview Grid

```tsx
/* 1 column → 2 columns → 4 columns */
<section className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
  {marketSnapshot.map((item) => (
    <Card key={item.label} />
  ))}
</section>
```

#### Agent Cards

```tsx
/* Stacked → 2 columns → 4 columns */
<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
  {agents.map((agent) => (
    <AgentCard key={agent.id} />
  ))}
</div>
```

#### Navbar

```tsx
/* Mobile: hamburger menu, Desktop: full nav */
<header className="border-b border-border md:sticky md:top-0">
  <div className="flex h-14 items-center gap-2">
    {/* Logo */}
    <div className="shrink-0">Logo</div>

    {/* Center nav (always visible) */}
    <nav className="flex flex-1 justify-center">{tabs}</nav>

    {/* Right actions */}
    <div className="shrink-0">
      {/* Mobile: icon only, Desktop: full button */}
      <Button size="icon" className="lg:hidden">
        <Menu />
      </Button>
    </div>
  </div>
</header>
```

### Touch Targets

Minimum 44x44px for interactive elements on mobile:

```tsx
/* Icon buttons on mobile */
<Button size="icon" className="size-11 md:size-9">
  <Icon className="size-5" />
</Button>

/* List items */
<button className="min-h-[44px] w-full">
  {content}
</button>
```

---

## Accessibility

### WCAG 2.1 AA Compliance (Minimum)

#### Color Contrast

```css
/* Light mode */
Foreground (#111111) on Background (#ffffff): 21:1 (AAA)
Muted foreground (#6b6b6b) on Background (#ffffff): 4.6:1 (AA)

/* Dark mode */
Foreground (#f5f5f5) on Background (#090909): 20.5:1 (AAA)
Muted foreground (#cfcfcf) on Background (#090909): 15:1 (AAA)
```

#### Semantic HTML

```tsx
/* Use proper landmarks */
<header>
  <nav aria-label="Main navigation">
<main>
  <section aria-label="Market overview">
    <article>

/* Headings hierarchy */
<h1 className="text-xl">Page Title</h1>
<h2 className="text-xs uppercase">Section Title</h2>

/* ARIA labels for icon-only buttons */
<Button size="icon" aria-label="Refresh data">
  <RefreshCw />
</Button>
```

#### Keyboard Navigation

```tsx
/* Focus visible styles (default from shadcn) */
.focus-visible:outline-none
.focus-visible:ring-2
.focus-visible:ring-ring
.focus-visible:ring-offset-2

/* Skip to content link */
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

#### Screen Reader Support

```tsx
/* Hide decorative icons */
<TrendIcon aria-hidden="true" />

/* Provide context */
<span className="sr-only">Confidence level:</span>
<span aria-live="polite">82%</span>

/* Current page indicator */
<Link aria-current={isActive ? "page" : undefined}>
  Radar
</Link>
```

---

## Implementation Guidelines

### File Structure

```
components/
├── ui/                    # shadcn components (never modify directly)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── navbar.tsx             # App-specific components
├── user-profile.tsx
└── theme-toggle.tsx

app/
├── (app)/
│   ├── layout.tsx         # App layout with navbar
│   ├── page.tsx           # Chat page
│   └── radar/
│       └── page.tsx       # Radar page
└── globals.css            # Global styles (theme variables)

lib/
├── utils.ts               # cn() helper, utilities
└── navigation.ts          # Navigation constants
```

### Adding shadcn Components

```bash
# Always install via CLI (ensures consistency)
npx shadcn@latest add dropdown-menu
npx shadcn@latest add dialog
npx shadcn@latest add switch
```

### Theme Variables

Never hardcode colors. Always use CSS variables:

```tsx
/* DO */
<div className="bg-background text-foreground border-border">

/* DON'T */
<div className="bg-white text-black border-gray-200">
```

### Utility Function

```tsx
import { cn } from "@/lib/utils"

/* Conditional classes */
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === "primary" && "variant-classes"
)}>
```

### Dark Mode

Tailwind automatically handles dark mode with the `dark:` prefix:

```tsx
<div className="bg-card dark:bg-zinc-900">
<p className="text-foreground dark:text-zinc-50">
```

Theme is controlled via `data-color-scheme` attribute on `:root`.

### Performance Considerations

```tsx
/* Minimize re-renders */
const MemoizedCard = React.memo(AgentCard);

/* Virtualize long lists (if needed) */
import { useVirtualizer } from "@tanstack/react-virtual";

/* Lazy load off-screen content */
import dynamic from "next/dynamic";
const HeavyChart = dynamic(() => import("./HeavyChart"), {
  loading: () => <Spinner />,
});

/* Debounce frequent updates */
import { useDebouncedCallback } from "use-debounce";
```

---

## Design Tokens Reference

### Quick Reference

```css
/* Spacing */
Tiny: gap-1 (4px)
Small: gap-2 (8px)
Default: gap-4 (16px)
Large: gap-6 (24px)

/* Border Radius */
--radius: 0.625rem (10px)
Small: rounded-md
Default: rounded-lg
Large: rounded-xl

/* Shadows */
Minimal: shadow-sm
Default: shadow-md (use sparingly)

/* Font Sizes */
Metadata: text-xs (12px)
Body: text-sm (14px)
Emphasized: text-base (16px)
Headings: text-lg (18px)
Titles: text-xl (20px)

/* Font Weights */
Body: font-normal (400)
Labels: font-medium (500)
Emphasized: font-semibold (600)
Alerts: font-bold (700)
```

---

## Examples from Current Implementation

### Market Snapshot Cards

```tsx
<article className="flex h-[96px] flex-col justify-between rounded-lg border border-border/50 bg-card px-4 py-3 shadow-sm dark:bg-zinc-900">
  <div className="flex items-start justify-between">
    <div>
      <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        SPY
      </h2>
      <p className="text-xl font-semibold text-foreground">$512.40</p>
    </div>
    <TrendIcon trend="up" />
  </div>
  <div className="flex items-baseline justify-between text-xs text-muted-foreground">
    <span className="text-sm font-semibold text-emerald-500">+1.2%</span>
    <span>
      Breadth:{" "}
      <span className="font-semibold text-foreground">68% advancers</span>
    </span>
  </div>
</article>
```

### Agent Card

```tsx
<div className="flex min-h-[200px] flex-col rounded-xl border border-border/50 bg-card p-4 shadow-sm transition-colors hover:border-border">
  <div className="flex items-baseline justify-between gap-3">
    <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted-foreground">
      MOMENTUM
    </p>
    <p className="text-[11px] font-medium text-muted-foreground">5 min ago</p>
  </div>
  <p className="mt-3 text-base font-semibold leading-tight text-foreground">
    Higher highs + rising volume.
  </p>
  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
    Bullish breakout. RSI is holding at 68 with +14 pts / 24h. Prediction
    confidence 88%.
  </p>
</div>
```

### Navbar Tabs

```tsx
<nav className="flex flex-1 justify-center">
  <div className="flex w-full max-w-xs items-center gap-1 rounded-full border border-border/60 bg-muted/30 p-1 shadow-sm">
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      return (
        <Link
          key={tab.id}
          href={tab.href}
          className={cn(
            "flex-1 rounded-full px-3 py-1.5 text-center text-xs font-medium transition-colors",
            isActive
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {tab.label}
        </Link>
      );
    })}
  </div>
</nav>
```

---

## Changelog

### Version 1.0 (October 18, 2025)

- Initial design system documentation
- Established color system, typography, component library
- Defined responsive patterns and animation guidelines
- Documented accessibility requirements

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Functional Requirements](./agent-dashboard-requirements.md)

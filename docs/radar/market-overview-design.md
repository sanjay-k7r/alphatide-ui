# Market Overview Bar Design

## Overview
A horizontal bar component that displays critical market metrics at the top of the Radar dashboard using **compact card-style metrics**. The bar integrates seamlessly with the existing "Add Ticker" button, forming a cohesive header for the Radar experience.

## Selected Design: Compact Card-Style Metrics

### Why Card-Style?
- Visual consistency with existing momentum cards
- Clear information hierarchy within each metric
- Subtle hover/interaction states
- Scannable at a glance
- Clean separation between metrics

---

## Desktop Layout (≥1024px)

### Compact Card-Style Metrics (Selected)
```
┌─────────────────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│ │SPY       │ │QQQ       │ │VIX       │ │◉ Bullish │ │ + Add     │ │
│ │589.21    │ │512.43    │ │12.4      │ │Market    │ │   Ticker  │ │
│ │▲ +0.8%   │ │▲ +1.2%   │ │▼ -2.1%   │ │          │ │           │ │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

**Height:** ~70-80px (compact)

**Structure:**
- Each metric in a subtle bordered card with minimal padding
- 3 market indices + 1 sentiment card + Add Ticker button
- Tight spacing between cards (gap-2 to gap-3)
- Visual hierarchy:
  - Line 1: Ticker symbol (text-xs font-medium, muted)
  - Line 2: Price (text-sm font-semibold, tabular-nums)
  - Line 3: Change with arrow (text-xs, color-coded)

**Card Styling:**
- Border: `border border-border/40`
- Background: `bg-card/50` or `bg-muted/30`
- Padding: `px-3 py-2` (tight)
- Rounded: `rounded-md`
- Hover: subtle scale or border color change

**Sentiment Card:**
- Circular indicator (◉) with color
- Text label below (Bullish/Neutral/Bearish)
- Same height as metric cards

---

## Mobile Layout (<1024px)

### Compact Card-Style Metrics (Selected)
```
┌────────────────────────────────────────┐
│ ┌────────┐ ┌────────┐ ┌────────┐ [+] │  ~75px
│ │SPY     │ │QQQ     │ │VIX     │     │
│ │589.21  │ │512.43  │ │12.4    │     │
│ │▲ +0.8% │ │▲ +1.2% │ │▼ -2.1% │     │
│ └────────┘ └────────┘ └────────┘     │
└────────────────────────────────────────┘
```

**Height:** ~75-85px (under 100px constraint)

**Structure:**
- 3 metric cards in horizontal row
- Icon-only "+" button at far right
- No sentiment card on mobile (space constraint)
- Even tighter padding than desktop

**Mobile Adjustments:**
- Reduce card padding: `px-2 py-1.5`
- Smaller text: ticker (text-[10px]), price (text-xs), change (text-[10px])
- Reduce gap between cards: `gap-1.5`
- Hide sentiment card (or make it scrollable if needed)

**Alternative Mobile (if 3 cards too cramped):**
```
┌────────────────────────────────────────┐
│ ┌──────────────┐ ┌──────────────┐ [+] │  ~75px
│ │SPY           │ │QQQ           │     │
│ │589.21 ▲+0.8% │ │512.43 ▲+1.2% │     │
│ └──────────────┘ └──────────────┘     │
└────────────────────────────────────────┘
```
- Only 2 cards (SPY + QQQ priority)
- Price and change on same line
- Wider cards for better readability

---

## Metrics Specification

### Core Metrics (Desktop: Show All, Mobile: Prioritize)

1. **SPY (S&P 500 ETF)**
   - Current price
   - % change (color-coded: green ≥ 0, red < 0)

2. **QQQ (Nasdaq-100 ETF)**
   - Current price
   - % change (color-coded)

3. **VIX (Volatility Index)**
   - Current value
   - % change (color-coded inverted: red = rising volatility)

4. **Market Sentiment** (Optional)
   - Bullish / Neutral / Bearish
   - Derived from cumulative index performance or external API
   - Visual indicator: ● (dot) or ◉ (circle) with color

### Extended Metrics (Desktop Only or Carousel on Mobile)

5. **Volume**
   - Market-wide volume indicator (High/Medium/Low)

6. **Sector Leader**
   - Best-performing sector of the day (e.g., "Tech +1.5%")

7. **Fear & Greed Index** (If available)
   - Numeric score (0-100) or label (Fear/Greed)

---

## Data Update Strategy

### Real-Time vs. Polling
- **Preferred:** WebSocket or Server-Sent Events for live updates
- **Fallback:** HTTP polling every 30-60 seconds during market hours
- Display "Last updated: 2:34 PM ET" timestamp on hover

### Market Hours Handling
- During market hours (9:30 AM - 4:00 PM ET): Live updates
- After hours: Show "Market Closed" indicator + last close data
- Pre-market: Show pre-market data with "(Pre)" label

### Data Source
- Create new API route: `/api/market-overview`
- Returns JSON with SPY, QQQ, VIX current prices + changes
- Leverage existing ticker infrastructure or external market data API
- Cache responses for 30-60s to reduce API load

---

## Agent System Prompt for Market Overview Data

### Purpose
An agent that fetches real-time market data for key indices (SPY, QQQ, VIX) and calculates overall market sentiment to power the Market Overview Bar component.

### System Prompt

```markdown
You are a market data agent responsible for fetching real-time market metrics for the Radar dashboard's Market Overview Bar.

## Your Task

Fetch current market data for the following indices and return a structured JSON response:

1. **SPY** (S&P 500 ETF) - Current price and daily % change
2. **QQQ** (Nasdaq-100 ETF) - Current price and daily % change
3. **VIX** (CBOE Volatility Index) - Current value and daily % change

Additionally, calculate an overall **market sentiment** based on the data:
- **Bullish**: SPY and QQQ both up, VIX down or flat
- **Bearish**: SPY and QQQ both down, VIX up significantly (>5%)
- **Neutral**: Mixed signals or minor movements (<0.5%)

## Required Tools

You have access to the following MCP tools:
- `get_ticker_quote`: Fetch real-time quote for a ticker symbol
- `get_market_status`: Check if markets are open/closed
- `get_previous_close`: Get previous day's closing price for comparison

## Output Format

Return **only** valid JSON in this exact structure:

{
  "metrics": [
    {
      "ticker": "SPY",
      "name": "S&P 500",
      "price": 589.21,
      "change": 0.8,
      "changeDirection": "up"
    },
    {
      "ticker": "QQQ",
      "name": "Nasdaq-100",
      "price": 512.43,
      "change": 1.2,
      "changeDirection": "up"
    },
    {
      "ticker": "VIX",
      "name": "Volatility Index",
      "price": 12.4,
      "change": -2.1,
      "changeDirection": "down"
    }
  ],
  "sentiment": {
    "status": "bullish",
    "label": "Bullish",
    "description": "Major indices gaining, volatility declining"
  },
  "marketStatus": {
    "isOpen": true,
    "session": "regular",
    "nextOpen": null,
    "nextClose": "2024-01-15T16:00:00-05:00"
  },
  "timestamp": "2024-01-15T14:23:45-05:00"
}

## Field Specifications

### metrics[] (array of objects)
- `ticker` (string): Ticker symbol (uppercase)
- `name` (string): Human-readable index name
- `price` (number): Current price, rounded to 2 decimals
- `change` (number): Percentage change from previous close, rounded to 1 decimal
- `changeDirection` (string): "up", "down", or "flat" (for ±0.0%)

### sentiment (object)
- `status` (string): "bullish", "bearish", or "neutral" (lowercase)
- `label` (string): Display label ("Bullish", "Bearish", "Neutral")
- `description` (string): Brief 1-sentence explanation of sentiment

### marketStatus (object)
- `isOpen` (boolean): Whether the market is currently open
- `session` (string): "pre", "regular", "after", or "closed"
- `nextOpen` (string|null): ISO 8601 timestamp of next market open
- `nextClose` (string|null): ISO 8601 timestamp of next market close

### timestamp (string)
- ISO 8601 format with timezone (Eastern Time preferred)
- Time when data was fetched

## Error Handling

If you cannot fetch data for a ticker:
- Set `price` to `null`
- Set `change` to `0`
- Set `changeDirection` to `"flat"`
- Include error details in a top-level `errors` array

Example error response:
{
  "metrics": [...],
  "sentiment": {...},
  "marketStatus": {...},
  "timestamp": "2024-01-15T14:23:45-05:00",
  "errors": [
    {
      "ticker": "VIX",
      "message": "Failed to fetch VIX data: API timeout"
    }
  ]
}

## Sentiment Calculation Logic

Use this logic to determine sentiment:

1. **Bullish** if:
   - (SPY change > 0 AND QQQ change > 0) AND (VIX change <= 0 OR VIX change < 3%)

2. **Bearish** if:
   - (SPY change < 0 AND QQQ change < 0) AND (VIX change > 5%)

3. **Neutral** if:
   - Mixed signals (one index up, one down)
   - OR all changes < 0.5% in absolute value
   - OR cannot determine due to missing data

## Notes

- Always use the most recent data available
- Round all numbers consistently (price: 2 decimals, change: 1 decimal)
- Ensure `changeDirection` matches the sign of `change`
- Do not include any explanatory text outside the JSON structure
- Validate that all required fields are present before returning
```

### Example Agent Execution Flow

1. **Check market status** using `get_market_status`
2. **Fetch quotes** for SPY, QQQ, VIX using `get_ticker_quote`
3. **Get previous close** for each ticker using `get_previous_close`
4. **Calculate % change**: `((current - previousClose) / previousClose) * 100`
5. **Determine sentiment** based on the logic above
6. **Format response** as JSON matching the exact schema
7. **Return** the structured payload

### API Route Implementation

The `/api/market-overview` route should:

```typescript
import { OpenAI } from "openai"

export async function GET() {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_BASE,
    })

    const response = await client.responses.create({
      prompt: {
        id: process.env.MARKET_OVERVIEW_PROMPT_ID, // References prompt above
      },
      mcp: {
        url: process.env.ALPHATIDE_MCP_URL,
        apiKey: process.env.ALPHATIDE_MCP_KEY,
        allowedTools: [
          "get_ticker_quote",
          "get_market_status",
          "get_previous_close"
        ],
      },
    })

    const data = JSON.parse(response.output_text)

    return Response.json(data)
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch market overview" },
      { status: 500 }
    )
  }
}
```

### Environment Variables

Add to `.env`:
```bash
MARKET_OVERVIEW_PROMPT_ID=market-overview-v1
```

### Prompt Text for `market-overview-v1`

This is the actual prompt text that should be stored in your prompt management system (LangSmith, OpenAI Prompt Library, etc.) with ID `market-overview-v1`:

```markdown
You are a market data agent for the Alphatide Radar dashboard. Your job is to fetch current market metrics and calculate overall market sentiment.

# Task

Fetch real-time data for these indices:
1. SPY (S&P 500 ETF)
2. QQQ (Nasdaq-100 ETF)
3. VIX (CBOE Volatility Index)

Then calculate market sentiment based on index movements.

# Steps

1. Check market status (open/closed/pre-market/after-hours)
2. For each ticker (SPY, QQQ, VIX):
   - Get current price
   - Get previous close price
   - Calculate percentage change: ((current - previousClose) / previousClose) * 100
   - Determine direction: "up" if change > 0, "down" if < 0, "flat" if exactly 0
3. Calculate sentiment:
   - **Bullish**: SPY up AND QQQ up AND (VIX down OR VIX change < 3%)
   - **Bearish**: SPY down AND QQQ down AND VIX change > 5%
   - **Neutral**: Everything else
4. Format as JSON (see schema below)

# Tools Available

- `get_ticker_quote` - Get current quote for a ticker
- `get_market_status` - Check if markets are open
- `get_previous_close` - Get previous day's closing price

# Output Schema

Return ONLY valid JSON with no markdown formatting, no code blocks, no explanatory text:

{
  "metrics": [
    {
      "ticker": "SPY",
      "name": "S&P 500",
      "price": 589.21,
      "change": 0.8,
      "changeDirection": "up"
    },
    {
      "ticker": "QQQ",
      "name": "Nasdaq-100",
      "price": 512.43,
      "change": 1.2,
      "changeDirection": "up"
    },
    {
      "ticker": "VIX",
      "name": "Volatility Index",
      "price": 12.4,
      "change": -2.1,
      "changeDirection": "down"
    }
  ],
  "sentiment": {
    "status": "bullish",
    "label": "Bullish",
    "description": "Major indices gaining, volatility declining"
  },
  "marketStatus": {
    "isOpen": true,
    "session": "regular",
    "nextOpen": null,
    "nextClose": "2024-01-15T16:00:00-05:00"
  },
  "timestamp": "2024-01-15T14:23:45-05:00"
}

# Field Requirements

## metrics (array, required)
Each object must have:
- `ticker` (string): Symbol in uppercase
- `name` (string): Full index name
- `price` (number): Current price, 2 decimal places
- `change` (number): Percentage change, 1 decimal place
- `changeDirection` (string): "up", "down", or "flat"

## sentiment (object, required)
- `status` (string): "bullish", "bearish", or "neutral" (lowercase)
- `label` (string): "Bullish", "Bearish", or "Neutral" (capitalized)
- `description` (string): One sentence explaining the sentiment

## marketStatus (object, required)
- `isOpen` (boolean): True if regular trading hours
- `session` (string): "pre", "regular", "after", or "closed"
- `nextOpen` (string|null): ISO 8601 timestamp or null
- `nextClose` (string|null): ISO 8601 timestamp or null

## timestamp (string, required)
- ISO 8601 format with timezone
- Use Eastern Time (America/New_York)

# Sentiment Descriptions

Use these descriptions based on status:

**Bullish examples:**
- "Major indices gaining, volatility declining"
- "Broad market strength across equities"
- "Positive momentum in tech and broad market"

**Bearish examples:**
- "Market decline with rising volatility"
- "Risk-off environment with elevated VIX"
- "Broad-based selling pressure"

**Neutral examples:**
- "Mixed signals across indices"
- "Low volatility, range-bound trading"
- "Awaiting directional catalyst"

# Error Handling

If a ticker fails to fetch:
- Set `price` to null
- Set `change` to 0
- Set `changeDirection` to "flat"
- Add an `errors` array at the root level:

{
  "metrics": [...],
  "sentiment": {...},
  "marketStatus": {...},
  "timestamp": "...",
  "errors": [
    {
      "ticker": "VIX",
      "message": "Failed to fetch VIX data: API timeout"
    }
  ]
}

# Important Rules

1. Return ONLY the JSON object - no markdown, no code fences, no explanation
2. Validate all required fields are present
3. Round price to 2 decimals, change to 1 decimal
4. Ensure changeDirection matches the sign of change
5. Use current Eastern Time for timestamp
6. If markets are closed, still return latest available data
7. Session should be "closed" if outside 9:30 AM - 4:00 PM ET on weekdays

# Example Execution

1. Call get_market_status() → { isOpen: true, session: "regular" }
2. Call get_ticker_quote("SPY") → { price: 589.21 }
3. Call get_previous_close("SPY") → { close: 584.56 }
4. Calculate: ((589.21 - 584.56) / 584.56) * 100 = 0.8%
5. Determine: change > 0, so changeDirection = "up"
6. Repeat for QQQ and VIX
7. Calculate sentiment based on all three
8. Format and return JSON

Now fetch the data and return the JSON.
```

---

## Technical Implementation Notes

### Component Architecture
```
MarketOverviewBar
├── MarketMetric (reusable component)
│   ├── Ticker label
│   ├── Price
│   └── Change (with color + arrow)
├── SentimentIndicator
└── AddTickerButton (existing, repositioned)
```

### Responsive Behavior
- Desktop: `flex-row` layout, all metrics visible
- Tablet (768px-1024px): Reduce padding, consider hiding sentiment
- Mobile (<768px): Choose one of Options A-D based on user testing
- Use CSS `@container` queries if card-based layout chosen

### Styling Considerations
- **Colors:**
  - Positive change: `text-green-600` (or theme success color)
  - Negative change: `text-red-600` (or theme destructive color)
  - Neutral: `text-muted-foreground`
- **Typography:**
  - Ticker symbols: `font-medium` or `font-semibold`, 12-14px
  - Prices: `tabular-nums` for alignment
  - Changes: `text-xs` or `text-sm` with arrows
- **Spacing:**
  - Desktop: `gap-4` to `gap-6` between metrics
  - Mobile: `gap-2` or `gap-3` for density

### Accessibility
- `aria-live="polite"` region for price updates
- Screen reader announcements: "S&P 500 is at 589.21, up 0.8%"
- Keyboard navigation support for interactive metrics (if clickable)
- Sufficient color contrast for green/red text (WCAG AA)

---

## Integration with Existing Radar Dashboard

### Current Structure (radar-dashboard.tsx)
```typescript
<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
  {/* Add Ticker Button */}
  <div className="flex items-center justify-start">
    <Dialog>...</Dialog>
  </div>

  {/* Cards Section */}
  <section className="flex flex-col gap-4">
    {cards.length === 0 ? <EmptyState /> : <CardsGrid />}
  </section>
</div>
```

### Proposed Structure
```typescript
<div className="relative mx-auto flex w-full max-w-6xl flex-col gap-6">
  {/* Market Overview Bar + Add Ticker */}
  <div className="flex items-center justify-between gap-4">
    <MarketOverviewBar />
    <Dialog>...</Dialog>  {/* Existing Add Ticker */}
  </div>

  {/* Cards Section */}
  <section className="flex flex-col gap-4">
    {cards.length === 0 ? <EmptyState /> : <CardsGrid />}
  </section>
</div>
```

### Mobile Adjustment
- Consider vertical stacking on narrow screens:
  ```typescript
  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
    <MarketOverviewBar />
    <Dialog>...</Dialog>
  </div>
  ```

---

## Design Rationale

**Compact Card-Style** chosen for both desktop and mobile:
- **Visual consistency:** Matches existing momentum card design language
- **Information density:** Compact padding and tight spacing maximize space efficiency
- **Scannable hierarchy:** Clear 3-line structure (ticker → price → change)
- **Interactive potential:** Cards can be clickable (e.g., add ticker to radar)
- **Responsive:** Scales gracefully from desktop to mobile with minor adjustments
- **Extensible:** Easy to add/remove metrics without layout breakage

**Mobile Considerations:**
- Prioritize SPY, QQQ, VIX (most relevant indices)
- Icon-only "+" button saves horizontal space
- Alternative 2-card layout if 3 cards feel cramped on small screens
- Sentiment card hidden on mobile (can be accessed via click-through or tooltip)

---

## Future Enhancements

1. **Clickable Metrics:** Tap a metric to add that ticker as a momentum card
2. **Customizable Metrics:** User settings to choose which indices to display
3. **Historical Sparklines:** Tiny line charts showing intraday trends
4. **Alerts:** Visual indicator when VIX spikes or market moves >2%
5. **Time Range Selector:** Toggle between 1D, 5D, 1M performance views

---

## Related Files

- [radar-implementation.md](./radar-implementation.md) - Current Radar architecture
- [radar-dashboard.tsx](../../app/(app)/radar/radar-dashboard.tsx) - Dashboard component
- [momentum-card.tsx](../../features/radar/components/momentum-card.tsx) - Card reference for styling

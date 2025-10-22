# Radar MVF (Minimum Viable Feature) Requirements

**Version:** 1.0
**Date:** October 21, 2025
**Feature:** Single-Card Momentum Scanner

---

## Executive Summary

### What We're Building
A single-card momentum scanner that allows traders to quickly analyze momentum + supporting signals for any ticker. This is **NOT** a chat interface—it's a one-click analysis tool that streams results directly into the card.

### Core Value
Replaces 5-10 minutes of manual research with a 10-second AI-powered momentum analysis that combines:
- Price momentum & volume
- Options flow signals
- Dark pool activity
- Key support/resistance levels
- Gamma positioning

### Why This Matters
From user research: "Where he sees momentum, he will use Alphatide." This feature acts as a **filter**—telling traders which tickers deserve their time and attention.

---

## User Flow

### Step 1: Add Ticker
1. User navigates to Radar tab
2. User sees an input field: "Enter ticker symbol (e.g., TSLA)"
3. User types ticker symbol and presses Enter or clicks "Add"
4. New card appears on screen

### Step 2: Analyze Momentum
1. Card displays with ticker name and "Analyze Momentum" button
2. User clicks "Analyze Momentum"
3. Analysis streams into the card (NOT a chat interface)
4. No text input box appears—this is a one-way information display

### Step 3: View Results
1. Card shows:
   - Confidence score (0-100%)
   - Analysis (2-3 sentences)
   - Reasoning (1-2 sentences)
   - Timestamp
2. User can:
   - Click "Refresh" to re-run analysis
   - Click "Remove" to delete card
   - Add another ticker (repeat flow)

---

## Design Philosophy

**Minimalist & Clean**
- Exclusively use shadcn/ui components
- Black, white, and grayscale color palette only
- No emojis or decorative icons
- Maximum content clarity with minimal visual noise
- Responsive design that works seamlessly on mobile and desktop

## UI Specifications

### Ticker Selection Component

**Use Existing Component:**
- Reuse `TickerSelect` component from [features/tickers/components/TickerSelect.tsx](../../../features/tickers/components/TickerSelect.tsx)
- Same component used in Questions panel
- Clean, searchable dropdown with company names
- Follows existing design patterns

**Ticker Selection UI:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  Select ticker…                       [▼]   │
│  (shadcn Command/Popover dropdown)          │
│                                             │
└─────────────────────────────────────────────┘
```

---

### Card States

#### State 1: Empty State (Before Analysis)
```
┌─────────────────────────────────────────────┐
│ TSLA                                  [×]   │
│                                             │
│                                             │
│           [Analyze Momentum]                │
│                                             │
│                                             │
└─────────────────────────────────────────────┘
```

**Elements:**
- Ticker symbol (top-left, text-lg font-semibold)
- Remove button [×] (top-right, ghost variant)
- "Analyze Momentum" button (centered, default variant)
- Clean white/grayscale background
- Subtle border

---

#### State 2: Loading State (Analysis in Progress)
```
┌─────────────────────────────────────────────┐
│ TSLA                                  [×]   │
│                                             │
│                                             │
│         Analyzing momentum...               │
│         [shadcn spinner component]          │
│                                             │
└─────────────────────────────────────────────┘
```

**Elements:**
- Ticker symbol (top-left)
- Remove button [×] (top-right)
- Loading text with shadcn spinner
- **NO text input field**
- **NO chat interface**

---

#### State 3: Results State (Analysis Complete)
```
┌─────────────────────────────────────────────┐
│ TSLA                                  [×]   │
│                                             │
│ Confidence: 85%                             │
│                                             │
│ Analysis                                    │
│ TSLA up 3.2% at $182 with volume 145%      │
│ above average, breaking above $180          │
│ resistance. Options flow shows $2.3M calls  │
│ vs $400K puts. Watch for continuation       │
│ above $185 or pullback to $180 support.     │
│                                             │
│ Reasoning                                   │
│ Multiple confirming signals—strong volume,  │
│ bullish options flow, and clean breakout    │
│ above key resistance make this a high-      │
│ probability setup.                          │
│                                             │
│ Updated 2:34 PM                             │
│                                             │
│ [Refresh]  [Analyze in Chat]                │
└─────────────────────────────────────────────┘
```

**Elements:**
- Ticker symbol (top-left)
- Remove button [×] (top-right)
- Confidence score (text-base, grayscale text based on score)
- Section headings (text-sm font-medium uppercase tracking-wide)
- Body text (text-sm text-muted-foreground)
- Timestamp (text-xs text-muted-foreground)
- Action buttons (shadcn Button components: outline variant)
- **NO text input field in this card**
- **NO chat interface**
- **NO emojis or colored icons**

---

### Visual Design System

**shadcn/ui Components Used:**
- `Button` (default, outline, ghost variants)
- `Card` (or custom div with border/shadow)
- `Spinner` (from lucide-react or custom)
- `TickerSelect` (existing component)

**Color Palette (Grayscale Only):**
- Text: `text-foreground`, `text-muted-foreground`
- Borders: `border-border`
- Backgrounds: `bg-background`, `bg-card`, `bg-muted`
- Confidence score colors (grayscale):
  - 80-100%: `text-foreground` (dark/strong)
  - 60-79%: `text-foreground/80`
  - 40-59%: `text-foreground/60`
  - 0-39%: `text-muted-foreground`

**Typography:**
- Ticker symbol: `text-lg font-semibold`
- Confidence score: `text-base font-medium`
- Section headings: `text-sm font-medium uppercase tracking-wide`
- Body text: `text-sm leading-relaxed text-muted-foreground`
- Timestamp: `text-xs text-muted-foreground`

**Card Styling:**
- Border: `border border-border`
- Border radius: `rounded-lg`
- Shadow: `shadow-sm`
- Padding: `p-6`
- Background: `bg-card`
- Width: `w-full max-w-2xl` (responsive)

**Spacing:**
- Between sections: `space-y-4`
- Between buttons: `gap-2`
- Internal padding: `p-6`

**Responsive Design:**
- Desktop (≥1024px): Cards in grid layout, max 2 columns
- Tablet (768px-1024px): Single column, full width
- Mobile (<768px): Single column, full width with adjusted padding (`p-4`)
- All interactions work with touch and mouse
- Proper tap targets (min 44px)

---

## Functional Requirements

### FR-1: Add Ticker
- **FR-1.1**: User can select ticker using existing `TickerSelect` component (same as Questions panel)
- **FR-1.2**: Component provides searchable dropdown with ticker symbols and company names
- **FR-1.3**: System validates ticker exists in database
- **FR-1.4**: System prevents duplicate tickers (show error if already added)
- **FR-1.5**: System creates new card for ticker
- **FR-1.6**: Card appears in card list
- **FR-1.7**: Ticker selector resets to placeholder after successful add

### FR-2: Analyze Momentum
- **FR-2.1**: User clicks "Analyze Momentum" button
- **FR-2.2**: System shows loading state immediately
- **FR-2.3**: System calls momentum agent API with ticker symbol
- **FR-2.4**: System streams response into card (NOT a chat interface)
- **FR-2.5**: System updates card with analysis, reasoning, and confidence score
- **FR-2.6**: System shows timestamp of analysis
- **FR-2.7**: **CRITICAL**: No text input box appears—this is ONE-WAY display only

### FR-3: Display Results
- **FR-3.1**: System displays confidence score with color coding
- **FR-3.2**: System displays analysis text (2-3 sentences)
- **FR-3.3**: System displays reasoning text (1-2 sentences)
- **FR-3.4**: System displays timestamp in human-readable format
- **FR-3.5**: System shows "Refresh" and "Analyze in Chat" buttons

### FR-4: Refresh Analysis
- **FR-4.1**: User clicks "Refresh" button
- **FR-4.2**: System re-runs momentum analysis
- **FR-4.3**: System shows loading indicator
- **FR-4.4**: System updates card with new results
- **FR-4.5**: System updates timestamp

### FR-5: Remove Ticker
- **FR-5.1**: User clicks [×] button
- **FR-5.2**: System removes card immediately (no confirmation for MVF)
- **FR-5.3**: Card animates out smoothly

### FR-6: Analyze in Chat
- **FR-6.1**: User clicks "Analyze in Chat" button
- **FR-6.2**: System switches to Chat tab
- **FR-6.3**: System pre-fills chat with context: "Analyze TSLA in detail. Current momentum analysis shows: [brief summary]"
- **FR-6.4**: User can continue conversation in chat interface

---

## API Integration

### Endpoint
```
POST /api/analyze-momentum
```

### Request Body
```json
{
  "ticker": "TSLA"
}
```

### Response Body
```json
{
  "ticker": "TSLA",
  "analysis": "TSLA up 3.2% at $182 with volume 145% above average, breaking above $180 resistance. Options flow shows $2.3M calls vs $400K puts. Watch for continuation above $185 or pullback to $180 support.",
  "reasoning": "Multiple confirming signals—strong volume, bullish options flow, and clean breakout above key resistance make this a high-probability setup.",
  "confidence": 85,
  "timestamp": "2025-10-21T14:34:00Z"
}
```

### Error Response
```json
{
  "error": "Invalid ticker symbol",
  "message": "TSLA not found"
}
```

### Streaming Support (Optional for MVF)
- If backend supports streaming, use Server-Sent Events (SSE)
- Stream tokens as they arrive from agent
- Update card in real-time
- Show final result when stream completes

---

## Technical Implementation Notes

### Frontend Stack
- **Framework**: Next.js 15 with App Router
- **Components**: React Server Components where possible
- **Styling**: Tailwind CSS + shadcn/ui components exclusively
- **Design**: Black, white, and grayscale only—no colors or emojis
- **State Management**: React hooks (useState, useEffect)
- **API Calls**: fetch or LangGraph SDK client
- **Responsive**: Mobile-first approach, works seamlessly on all screen sizes

### Key Components

#### `/app/(app)/radar/page.tsx`
Main Radar page component with responsive grid/flex layout

#### `/features/radar/components/ticker-selector.tsx`
Wrapper around existing `TickerSelect` component from `/features/tickers/components/TickerSelect.tsx`
- Reuses existing ticker data and search functionality
- Consistent with Questions panel UX

#### `/features/radar/components/momentum-card.tsx`
Minimalist card component with three states:
- Empty (before analysis)
- Loading (analysis in progress)
- Results (analysis complete)

Uses shadcn/ui components:
- `Button` (default, outline, ghost variants)
- `Card` or custom styled div with `border`, `rounded-lg`, `shadow-sm`
- Lucide-react icons (X for close, Loader2 for loading)
- All grayscale styling

#### `/app/api/analyze-momentum/route.ts`
API route that calls momentum agent

### Data Flow
```
User Input (Ticker)
  ↓
Add Ticker Button
  ↓
Create Card (Empty State)
  ↓
User Clicks "Analyze Momentum"
  ↓
Loading State
  ↓
API Call to /api/analyze-momentum
  ↓
Momentum Agent (MCP Server)
  ↓
Stream/Return JSON Response
  ↓
Update Card (Results State)
```

---

## Non-Functional Requirements

### NFR-1: Performance
- API response time: <5 seconds
- Card render time: <100ms
- Smooth animations: 60fps

### NFR-2: Responsiveness
- **CRITICAL**: Must work seamlessly on mobile and desktop
- Desktop (≥1024px): Cards in grid layout, max 2 columns
- Tablet (768px-1024px): Single column, full width
- Mobile (<768px): Single column, optimized padding and touch targets
- Cards stack vertically on smaller screens
- Touch-friendly tap targets (min 44x44px)
- Smooth transitions and interactions on all devices

### NFR-3: Error Handling
- Show error message in card if API fails
- Allow retry with "Refresh" button
- Don't crash app on invalid ticker
- Show user-friendly error messages

### NFR-4: Accessibility & Design
- Keyboard navigation support
- Screen reader friendly
- ARIA labels on buttons
- **Grayscale only**: All text and UI elements use black, white, and shades of gray
- **No emojis**: Clean, professional interface without decorative icons
- **shadcn/ui exclusive**: All components from shadcn/ui library
- Sufficient contrast ratios for readability

---

## Out of Scope (Not in MVF)

The following are **explicitly NOT included** in this MVF:

❌ Chat interface within the card
❌ Text input box in the card
❌ Back-and-forth conversation
❌ Multiple analysis types (just momentum for now)
❌ Auto-refresh/polling
❌ Watchlist persistence (cards disappear on page refresh)
❌ User settings/preferences
❌ Historical analysis view
❌ Export/share functionality
❌ Multiple cards expanded at once (nice-to-have, not required)
❌ Drag-and-drop reordering
❌ Alert system
❌ Real-time updates

These MAY be added in future iterations.

---

## Success Criteria

### MVF is complete when:

✅ User can add ticker using existing `TickerSelect` component (same as Questions panel)
✅ Card appears with ticker name and "Analyze Momentum" button
✅ Clicking "Analyze Momentum" shows loading state
✅ Analysis streams/appears in card (NOT in chat interface)
✅ Card displays confidence score, analysis, reasoning, and timestamp
✅ NO text input box appears in card
✅ User can click "Refresh" to re-run analysis
✅ User can click "Analyze in Chat" to open chat with context
✅ User can remove card by clicking [×]
✅ **UI is fully responsive on mobile and desktop** (CRITICAL)
✅ **Design uses only shadcn/ui components** (CRITICAL)
✅ **Color palette is black, white, and grayscale only** (CRITICAL)
✅ **No emojis or decorative icons** (CRITICAL)
✅ Error handling works gracefully
✅ Touch targets are properly sized for mobile (min 44px)

---

## User Testing Questions

After implementing MVF, validate with users:

1. Is the one-click "Analyze Momentum" interaction clear?
2. Does the confidence score help you make decisions?
3. Is the analysis detailed enough, or too verbose?
4. Do you want to add multiple tickers and compare?
5. Would auto-refresh be valuable, or is manual refresh sufficient?
6. Do you click "Analyze in Chat" for deeper questions?

---

## Next Steps After MVF

**Phase 2 Candidates:**
1. Add watchlist persistence (save cards across sessions)
2. Add auto-refresh option (every 5/10/15 minutes)
3. Add multiple analysis types (flow-only, volatility-only)
4. Add card comparison view (side-by-side)
5. Add alert system (notify when confidence changes significantly)

**Long-term Vision:**
Evolve this into the full Radar dashboard with multiple agents, as specified in [radar-requirements.md](./radar-requirements.md).

---

**END OF MVF SPECIFICATION**

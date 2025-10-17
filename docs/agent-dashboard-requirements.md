# Functional Requirements Specification: Auto-Analysis Dashboard MVP

**Version:** 1.0  
**Date:** October 17, 2025  
**Product:** Alphatide Options Trading Dashboard

---

## 1. Executive Summary

### 1.1 Product Vision

An automated intelligence dashboard that continuously analyzes traders' watchlist tickers and presents actionable insights. The system replaces 20 minutes of manual research with instant, pre-processed intelligence.

### 1.2 Core Value Proposition

**For every ticker, answer three questions:**

1. What changed?
2. Does it matter?
3. What should I do about it?

### 1.3 MVP Scope

- Single-page dashboard with market overview + ticker analysis sliders
- 4 autonomous analysis agents per ticker (Momentum, Flow, Volatility, Greeks)
- Automated confidence scoring and trading insights
- Alert system for meaningful changes
- Desktop-first responsive design
- Auto-refresh during market hours

---

## 2. User Stories

### 2.1 Primary User: Options Trader (Ankush)

**As an options trader, I want to:**

1. See overall market conditions at a glance so I understand the trading environment before analyzing individual tickers

2. Add tickers to my watchlist so I can monitor multiple opportunities simultaneously

3. See a traffic light summary for each ticker so I can quickly assess which setups are worth investigating

4. Get a confidence score for each ticker so I know how strong the setup is before trading

5. Expand any ticker to see detailed reasoning from each analysis agent so I understand the "why" behind the signals

6. Receive real-time alerts when significant changes occur so I don't miss important developments

7. Get clear trading guidance ("what should I do") so I can make faster decisions

8. Reorder my watchlist so my most important tickers are at the top

9. Have the system continuously update during market hours so I don't have to manually refresh

10. Access this dashboard on both desktop and mobile so I can trade from anywhere

---

## 3. Functional Requirements

### 3.1 Market Control Tower (Top Section)

**FR-1.1: Display Market Overview**

- MUST show: SPY price, % change, trend direction
- MUST show: QQQ price, % change, trend direction
- MUST show: VIX level, direction, interpretation (Low/Normal/Elevated/High)
- MUST show: Overall market sentiment (Bullish/Neutral/Bearish)
- MUST show: Total active alerts across all tickers
- MUST show: Last update timestamp

**FR-1.2: Visual Indicators**

- MUST use color coding: Green (bullish), Yellow (neutral), Red (bearish)
- MUST be fixed/sticky at top of page
- MUST be single line, compact view (~60-80px height)

**FR-1.3: Update Frequency**

- MUST update every 60 seconds during market hours (9:30 AM - 4:00 PM ET)
- MUST update every 5 minutes outside market hours

---

### 3.2 Ticker Slider - Collapsed View

**FR-2.1: Display Summary Information**

- MUST show ticker symbol with ability to remove/delete
- MUST show confidence score (0-100 scale) with color gradient (Red: 0-40, Yellow: 41-60, Green: 61-100)
- MUST show 4 status indicators: Momentum, Flow, Volatility, Greeks
- Each indicator MUST use traffic light colors (🟢🟡🔴) and brief status text
- Each indicator MUST show on/off toggle state (grayed out when disabled)
- MUST show alert badge with count if alerts exist
- MUST show expand/collapse control
- MUST show settings icon/button to access agent configuration

**FR-2.2: Interaction Requirements**

- MUST expand to detailed view when clicked anywhere on slider
- MUST collapse when clicked again
- MUST allow drag-and-drop reordering
- MUST show hover state for better UX
- MUST persist order after page refresh

**FR-2.3: Visual Requirements**

- MUST be horizontally oriented bar (~50px height)
- MUST have clear visual separation between sliders
- MUST adapt to mobile viewport (stack indicators if needed)

---

### 3.3 Ticker Slider - Expanded View

**FR-3.1: Trading Insight Section**

- MUST display at top of expanded view
- MUST synthesize all agent analyses into 2-4 sentences
- MUST provide directional bias (bullish/bearish/neutral)
- MUST suggest trading strategy or action
- MUST be visually distinct (highlighted background)

**FR-3.2: Agent Analysis Sections**

- MUST display 4 agent sections: Momentum, Flow, Volatility, Greeks
- Each section MUST have:
  - Traffic light status indicator
  - Agent name and last update time
  - On/off toggle switch
  - Refresh interval selector (5, 10, 15, 30, 60 minutes)
  - Manual refresh button
  - One-line status summary
  - 3-5 key data points (bullet format)
  - Three-question framework:
    - "What changed: [explanation]"
    - "Does it matter: [Yes/No + explanation]"
    - "What to do: [actionable guidance]"
- Disabled agents MUST show inactive/grayed state with option to enable
- Disabled agents MUST NOT display data or contribute to confidence score

**FR-3.3: Active Alerts Section**

- MUST display only if alerts exist
- MUST show up to 5 most recent alerts
- Each alert MUST include: timestamp, alert type icon, message
- MUST sort newest first

**FR-3.4: Expansion Behavior**

- MUST animate expand/collapse (smooth transition)
- MUST only allow one expanded ticker at a time (optional: make configurable)
- MUST scroll to bring expanded content into view if needed

---

### 3.4 Add Ticker Functionality

**FR-4.1: Add Ticker Interface**

- MUST provide "Add Ticker" button in header of watchlist section
- MUST show input field when clicked (modal or inline)
- MUST validate ticker symbol exists
- MUST show error message if invalid ticker
- MUST prevent duplicate tickers

**FR-4.2: Post-Add Behavior**

- MUST add new ticker to bottom of watchlist
- MUST immediately begin agent analysis
- MUST show "Analyzing..." loading state until first results available
- MUST persist watchlist to user's account

**FR-4.3: Remove Ticker**

- MUST provide delete/remove control on each ticker
- MUST require confirmation before deletion
- MUST remove from watchlist and stop agent updates

**FR-4.4: Watchlist Limits**

- SHOULD limit to 20 tickers per user (MVP)
- MUST inform user when limit reached

---

### 3.5 Analysis Agents

**Architecture Overview**

- Each agent is an OpenAI agent workflow that returns structured JSON data
- Frontend triggers agent updates via API calls at user-configurable intervals
- Each agent can be toggled on/off independently by the user
- Default refresh interval: 15 minutes (user can adjust per agent)

**FR-5.1: Momentum Agent**

- MUST analyze: price trend, volume, relative strength vs indices
- MUST determine status: Strong Up / Weak Up / Ranging / Weak Down / Strong Down
- MUST contribute 0-25 points to confidence score
- MUST be triggered by frontend at user-configured interval (default: 15 min)
- MUST identify: breakouts, volume spikes, trend changes
- MUST return JSON with: status, confidence contribution, data points, three-question framework

**FR-5.2: Flow Agent**

- MUST analyze: options premium flow, NOPE signal, unusual activity, dark pool trades
- MUST determine status: Bullish / Slightly Bullish / Mixed / Slightly Bearish / Bearish
- MUST contribute 0-30 points to confidence score
- MUST be triggered by frontend at user-configured interval (default: 15 min)
- MUST identify: institutional positioning, large block trades
- MUST return JSON with: status, confidence contribution, data points, three-question framework

**FR-5.3: Volatility Agent**

- MUST analyze: IV Rank, IV vs RV spread, term structure, upcoming catalysts
- MUST determine status: Low / Normal / Elevated / High
- MUST contribute 0-20 points to confidence score
- MUST be triggered by frontend at user-configured interval (default: 15 min)
- MUST identify: IV spikes, IV crush, expensive/cheap options
- MUST return JSON with: status, confidence contribution, data points, three-question framework

**FR-5.4: Greeks Agent**

- MUST analyze: gamma walls, max pain, net delta, OI concentration
- MUST determine status: Favorable / Neutral / Risk
- MUST contribute 0-25 points to confidence score
- MUST be triggered by frontend at user-configured interval (default: 15 min)
- MUST identify: key support/resistance levels, pin risk zones
- MUST return JSON with: status, confidence contribution, data points, three-question framework

**FR-5.5: Agent Data Requirements**

- Each agent MUST use existing Alphatide tools (documented in Tools.md)
- Each agent MUST return structured JSON containing:
  - `status`: current agent status (e.g., "Strong Up", "Bullish", "Low", "Favorable")
  - `confidence_contribution`: points contributed to overall score (0-25/30/20/25)
  - `data_points`: array of 3-5 key metrics and values
  - `what_changed`: explanation of recent changes
  - `does_it_matter`: yes/no with reasoning
  - `what_to_do`: actionable trading guidance
  - `alerts`: array of alert objects (if any)
  - `last_updated`: ISO timestamp
- Each agent MUST cache results server-side to minimize redundant computation
- Each agent MUST handle errors gracefully and return last known good data with error flag

**FR-5.6: Agent Control & Configuration**

- Frontend MUST allow users to toggle each agent on/off independently
- Frontend MUST allow users to configure refresh interval per agent (options: 5, 10, 15, 30, 60 minutes)
- Disabled agents MUST NOT trigger updates or contribute to confidence score
- Disabled agents MUST show inactive state in UI with option to re-enable

---

### 3.6 Confidence Score System

**FR-6.1: Score Calculation**

- MUST aggregate scores from all 4 agents (total possible: 0-100)
- Each agent contributes weighted points based on signal strength
- MUST normalize to 0-100 integer scale
- MUST update whenever any agent updates

**FR-6.2: Score Interpretation**

- 80-100: Very High Confidence (strong alignment)
- 60-79: High Confidence (most indicators aligned)
- 40-59: Medium Confidence (mixed signals)
- 20-39: Low Confidence (conflicting signals)
- 0-19: Very Low Confidence (poor setup)

**FR-6.3: Visual Display**

- MUST use color gradient (Red→Yellow→Green)
- MUST show as badge with target icon: 🎯 72
- MUST be prominent in both collapsed and expanded views

---

### 3.7 Alert System

**FR-7.1: Alert Generation**

- System MUST automatically generate alerts for:
  - Momentum: breakouts, volume spikes, trend changes
  - Flow: unusual activity, large premium flows, NOPE flips
  - Volatility: IV spikes, IV crush, catalyst warnings
  - Greeks: approaching gamma walls, max pain crossings

**FR-7.2: Alert Display**

- MUST show alert count badge on collapsed slider
- MUST list alerts in expanded view
- Each alert MUST include: timestamp, type icon, clear message
- MUST show maximum 5 alerts per ticker

**FR-7.3: Alert Management**

- MUST store alerts for 24 hours
- MUST auto-delete old alerts when limit exceeded
- SHOULD allow user to mark alerts as read (removes from count)
- SHOULD allow user to dismiss individual alerts

**FR-7.4: Alert Priorities**

- System SHOULD prioritize high-severity alerts
- SHOULD show most recent alerts first
- SHOULD NOT spam user with duplicate/similar alerts

---

### 3.8 Auto-Refresh & Update Logic

**FR-8.1: Frontend-Driven Update Strategy**

- Frontend MUST trigger agent updates via API calls at user-configured intervals
- Default interval: 15 minutes per agent (user can adjust to 5, 10, 15, 30, or 60 minutes)
- Frontend MUST maintain separate timers for each agent per ticker
- Frontend MUST skip updates for disabled agents
- SHOULD implement optional manual refresh button per ticker for immediate updates
- SHOULD pause/resume timers based on browser tab visibility (pause when tab inactive)

**FR-8.2: Update Indicators**

- MUST show "Updated: HH:MM AM/PM" timestamp on each agent section
- MUST show "Updating..." indicator when API call is in progress
- SHOULD show subtle pulse/glow animation when new data arrives
- SHOULD show loading spinner only on initial load, not on subsequent updates
- MUST display agent's configured refresh interval in UI (e.g., "Updates every 15 min")

**FR-8.3: Market Hours Awareness**

- MUST detect market status: Pre-Market / Regular Hours / After Hours / Closed
- Frontend SHOULD display current market status in header
- SHOULD suggest longer intervals when market is closed
- MAY show warning if user sets very frequent intervals (<5 min) to manage API usage
- SHOULD allow users to override default behavior if desired

**FR-8.4: Update Orchestration**

- Frontend MUST stagger initial agent calls to avoid simultaneous API requests
- MUST handle multiple tickers without blocking UI (use async/await patterns)
- MUST implement request queuing if concurrent request limit would be exceeded
- MUST show graceful loading states during updates
- MUST NOT block user interaction during background updates

**FR-8.5: Error Handling**

- MUST cache last successful response per agent
- MUST display cached data if API call fails
- MUST show error indicator without breaking UI
- MUST implement exponential backoff for failed requests
- SHOULD retry failed requests up to 3 times before showing error state

---

### 3.9 Responsive Design

**FR-9.1: Desktop Layout (>1024px)**

- MUST show full horizontal sliders
- MUST display all indicators inline
- MUST support drag-and-drop reordering
- SHOULD show 4-6 sliders without scrolling

**FR-9.2: Tablet Layout (768px - 1024px)**

- MUST maintain horizontal sliders
- MAY stack some indicators if needed for space
- MUST remain fully functional

**FR-9.3: Mobile Layout (<768px)**

- MUST convert to vertical card layout
- MUST show confidence score prominently
- MUST allow swipe gestures for expand/collapse
- MUST maintain all functionality
- MAY show simplified collapsed view with fewer indicators

---

### 3.10 Data Persistence

**FR-10.1: User Watchlist**

- MUST save watchlist to user account/database
- MUST persist ticker order
- MUST load watchlist on page load
- MUST sync across devices

**FR-10.2: User Preferences**

- SHOULD save expanded/collapsed state per ticker
- SHOULD remember scroll position
- SHOULD save alert read/unread status

**FR-10.3: Agent Configuration Persistence**

- MUST save agent on/off state per ticker per user
- MUST save refresh interval preferences per agent per ticker per user
- MUST persist configuration across browser sessions
- MUST sync configuration across devices
- Default configuration: all agents enabled, 15-minute interval

**FR-10.4: Analysis Cache**

- Frontend MUST cache agent analysis results in local storage
- Backend MUST cache agent analysis results server-side
- Backend SHOULD respect cache TTL per agent type (5 minutes recommended)
- Frontend MUST serve cached data immediately on page load
- Frontend MUST refresh cache after successful API call

---

## 4. Non-Functional Requirements

### 4.1 Performance

**NFR-1: Page Load Time**

- Initial page load MUST complete within 2 seconds
- Cached watchlist data MUST display within 500ms
- Cached agent data MUST load from local storage immediately on page load

**NFR-2: Update Latency**

- Agent API calls MUST complete within 5 seconds per agent
- Backend SHOULD return cached results within 500ms if available
- UI updates MUST be reflected within 1 second of data arrival
- Frontend MUST NOT block UI during background agent updates

**NFR-3: Frontend Performance**

- Timer management MUST NOT impact browser performance
- Multiple simultaneous ticker updates MUST NOT freeze UI
- Frontend MUST limit concurrent API requests (max 4 simultaneous agent calls)
- Frontend MUST queue additional requests if limit reached
- Frontend SHOULD use Web Workers for timer management if performance degrades

**NFR-4: Scalability**

- System MUST support 100 concurrent users (MVP)
- System MUST handle 20 tickers per user efficiently
- Each user with 20 tickers × 4 agents = max 80 active timers
- Backend MUST handle burst traffic when multiple users' timers align

### 4.2 Reliability

**NFR-5: Uptime**

- System SHOULD maintain 99% uptime during market hours
- System MUST gracefully handle API failures (show cached data)

**NFR-6: Error Handling**

- MUST never show blank/broken state to user
- MUST display meaningful error messages
- MUST fall back to last known good data
- Frontend MUST handle network failures gracefully without crashing

### 4.3 Usability

**NFR-7: Learning Curve**

- New users SHOULD understand dashboard within 2 minutes
- Traffic light system MUST be immediately intuitive
- Trading insights MUST be actionable without explanation
- Agent controls (toggle/interval) MUST be discoverable and intuitive

**NFR-8: Accessibility**

- MUST meet WCAG 2.1 Level AA standards
- MUST support keyboard navigation
- MUST have sufficient color contrast (not relying only on color)
- Toggle switches and controls MUST be keyboard accessible

### 4.4 Security

**NFR-9: Authentication**

- Dashboard MUST require user authentication
- Watchlists MUST be user-specific (no shared data)
- Agent configurations MUST be user-specific

**NFR-10: Data Privacy**

- MUST comply with financial data regulations
- MUST use secure connections (HTTPS)
- API calls MUST include authentication tokens

---

## 5. API Integration Requirements

### 5.1 OpenAI Agent Workflow Architecture

**INT-1: Agent API Endpoints**

- Each agent (Momentum, Flow, Volatility, Greeks) is an OpenAI agent workflow
- Frontend calls agent-specific endpoints: `/api/agents/{agent_type}/{ticker}`
- Agent types: `momentum`, `flow`, `volatility`, `greeks`
- All endpoints return structured JSON (see INT-2 for schema)

**INT-2: Agent Response Schema**

Each agent endpoint MUST return JSON in the following format:

```json
{
  "ticker": "AAPL",
  "agent_type": "momentum",
  "status": "Strong Up",
  "confidence_contribution": 23,
  "data_points": [
    { "label": "Price Trend", "value": "+2.3% (Bullish)" },
    { "label": "Volume", "value": "125% above average" },
    { "label": "Relative Strength", "value": "Outperforming SPY by 1.8%" }
  ],
  "what_changed": "Price broke above 20-day resistance with strong volume",
  "does_it_matter": "Yes - breakout on heavy volume suggests institutional interest",
  "what_to_do": "Consider bullish positions; watch for pullback to $175 support",
  "alerts": [
    {
      "type": "breakout",
      "severity": "high",
      "message": "Breakout above $180 resistance on 2x average volume",
      "timestamp": "2025-10-17T14:30:00Z"
    }
  ],
  "last_updated": "2025-10-17T14:35:12Z",
  "error": null
}
```

Error response format:
```json
{
  "ticker": "AAPL",
  "agent_type": "momentum",
  "error": "API rate limit exceeded",
  "last_known_good_data": { /* cached response */ },
  "timestamp": "2025-10-17T14:35:12Z"
}
```

**INT-3: Backend Agent Tool Usage**

- Each OpenAI agent workflow MUST use existing Alphatide tools:
  - Momentum Agent: `get_price_context_charts`, `get_last_trading_day_price`
  - Flow Agent: `analyze_flow_data`, `get_nope_data`, `get_recent_darkpool_trades`
  - Volatility Agent: `analyze_volatility_comprehensive`
  - Greeks Agent: `analyze_greeks_exposure`, `analyze_max_pain`, `analyze_oi_data`
- System MUST NOT create new data sources for MVP
- Backend MAY cache tool responses to reduce redundant API calls

**INT-4: Rate Limiting & Error Handling**

- Frontend MUST respect API rate limits
- Frontend MUST implement exponential backoff on failures
- Frontend MUST queue requests if needed to avoid exceeding concurrent request limits
- Backend MUST return HTTP 429 when rate limited with Retry-After header
- Backend MUST return cached data with error flag when API unavailable

**INT-5: Data Freshness**

- Backend MUST use most recent available market data
- Backend MUST indicate data staleness in response if source API unavailable
- Backend SHOULD cache analysis results for up to 5 minutes to reduce load
- Frontend MUST display timestamp for each agent's last successful update

---

## 6. Success Criteria

### 6.1 User Metrics

**Success means:**

- Reduce pre-trade analysis time from 20 minutes to <5 minutes
- Provide confidence scores that influence 40-85% of trade decisions (matches current Alphatide usage)
- Alert users to meaningful changes within 60 seconds
- 80% of users keep dashboard open during entire trading session

### 6.2 Technical Metrics

**Success means:**

- <2 second initial load time
- <5 second agent analysis completion
- 99% uptime during market hours
- <1% error rate on API calls

### 6.3 Feature Adoption

**Success means:**

- Average 8-12 tickers per user watchlist
- 70%+ of users expand tickers for detailed view
- 60%+ of users act on trading insights
- Alert engagement rate >50%

---

## 7. Out of Scope (Not in MVP)

**The following are explicitly NOT included in MVP:**

- Real-time WebSocket updates (will use polling)
- Historical playback of analysis
- Backtesting features
- Multiple watchlist management
- Custom agent configuration
- Portfolio tracking
- Trade execution
- Social/sharing features
- Advanced charting
- Mobile native apps (responsive web only)
- Notifications outside the app
- API webhooks
- White-label capabilities

These MAY be considered for future versions based on MVP feedback.

---

## 8. Open Questions & Decisions Needed

**Q1: Single vs Multiple Expanded Tickers**

- Should only one ticker be expandable at a time, or allow multiple?
- **Recommendation**: Start with single (reduces cognitive load)

**Q2: Real-time vs Polling**

- WebSocket for instant updates or HTTP polling for simplicity?
- **Recommendation**: HTTP polling for MVP (every agent has different interval anyway)

**Q3: Alert Notification Method**

- In-app only or also browser notifications?
- **Recommendation**: In-app only for MVP

**Q4: Watchlist Limit**

- How many tickers should we allow per user?
- **Recommendation**: 20 for MVP (can adjust based on performance)

**Q5: Market Data During Closed Hours**

- Should agents run when market is closed?
- **Recommendation**: Reduce frequency but keep monitoring (pre-market prep is valuable)

---

## 9. Acceptance Criteria

**The MVP is complete when:**

✅ User can add/remove tickers to watchlist  
✅ Dashboard shows market overview (SPY/QQQ/VIX)  
✅ Each ticker shows confidence score and 4 status indicators  
✅ User can expand ticker to see detailed agent analysis  
✅ Each agent provides "what changed, does it matter, what to do" guidance  
✅ Trading insight synthesizes all agents into actionable advice  
✅ Alerts are generated and displayed for significant changes  
✅ Dashboard auto-refreshes during market hours  
✅ Works on desktop and mobile browsers  
✅ Loads in <2 seconds, updates in <5 seconds  
✅ Handles errors gracefully (shows cached data)

---

**END OF SPECIFICATION**

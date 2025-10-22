# Radar Implementation

## Overview
- Radar currently ships with a single **Momentum** agent that delivers one-click momentum reads for any supported ticker.
- The experience lives in `app/(app)/radar/radar-dashboard.tsx`, backed by the API route `app/api/analyze-momentum/route.ts`.
- Each card instance owns its own lifecycle (idle → loading → ready | error) and renders through `features/radar/components/momentum-card.tsx`.
- The server route wraps OpenAI’s Responses API plus the Alphatide MCP toolchain, transforming the model output into a strict JSON payload consumed by the UI.

## Frontend Flow
- **Ticker selection** – reuse of `TickerSelect` keeps data sources consistent with the rest of the product. Selected tickers become `RadarCardState` entries.
- **Card lifecycle** – `RadarDashboard` manages an array of cards, each containing the ticker, a status flag, and an optional `MomentumAnalysisResult`. Actions (add, run, refresh, remove) operate on this array.
- **Analysis request** – `analyzeMomentum` issues a POST to `/api/analyze-momentum`. The helper normalises the response (confidence coercion, analysis/summary fallbacks, timestamp sanity checks) before persisting it on the card.
- **Presentation** – `MomentumCard` renders state-specific subcomponents and exposes a shared CTA surface (`Analyze`, `Refresh`, `Remove`). Confidence colouring and timestamp formatting are encapsulated inside the card to avoid duplication.

## Backend Flow
- **Entry point** – POST handler in `app/api/analyze-momentum/route.ts` validates payloads, enforces ticker format, and checks environment configuration.
- **Prompt execution** – Requests are forwarded to the OpenAI Responses API with:
  - `prompt.id` = `MOMENTUM_PROMPT_ID`
  - MCP tool proxy pointed at `ALPHATIDE_MCP_URL`/`ALPHATIDE_MCP_KEY`
  - Restricted `MCP_ALLOWED_TOOLS` whitelist
  - Optional `OPENAI_API_BASE` override
- **Response parsing** – The route expects the assistant to return a JSON string encoded in `output_text`. Fallback logic captures malformed payloads and degrades gracefully to a plain text summary.
- **Contract** – Successful responses are shaped into:
  ```ts
  type MomentumAnalysisResult = {
    ticker: string
    summary: string
    analysis: string
    reasoning: string
    confidence: number | string
    timestamp: string
  }
  ```
  Errors return a structured `{ error, message }` response with appropriate status codes (400 for ticker validation, 500 for configuration/runtime failures).

## Environment Configuration
- `OPENAI_API_KEY` – required; request rejected if missing.
- `OPENAI_API_BASE` – optional; defaults to `https://api.openai.com`.
- `MOMENTUM_PROMPT_ID` – required prompt identifier for the Momentum agent.
- `ALPHATIDE_MCP_URL` / `ALPHATIDE_MCP_KEY` – required to broker MCP tool usage.
- Deployments should ensure these values are present in `.env` or platform secrets. The route surfaces descriptive error messages when any variable is misconfigured.

## Adding Another Agent
1. **Duplicate the contract**  
   - Create a new result type in `features/radar/types.ts` (e.g., `SentimentAnalysisResult`) and a corresponding card state type if the UI diverges from the Momentum card.
   - Maintain common shape where possible so card orchestration can remain generic.
2. **Clone the API route**  
   - Copy `app/api/analyze-momentum/route.ts` into a new folder such as `app/api/analyze-sentiment/route.ts`.
   - Update prompt IDs, MCP tool whitelist, and any agent-specific request payload structure.
   - Reuse shared helpers (`safeParseJson`, error parsing) to keep behaviour consistent.
3. **Create the card component**  
   - Start from `features/radar/components/momentum-card.tsx`; extract shared UI primitives (headers, action bar, loading/error states) into reusable helpers if multiple cards will coexist.
   - Tailor display fields to the new agent’s payload while preserving the status handling contract (`idle`, `loading`, `ready`, `error`).
4. **Register the agent in the dashboard**  
   - Extend `RadarDashboard` with a factory or configuration map that describes each agent (`id`, `label`, `createCardState`, `runAnalysis`).
   - Ensure the add-ticker flow lets users choose which agent to instantiate, or seed default cards per agent as required.
5. **Wire up environment variables & documentation**  
   - Introduce new `PROMPT_ID` / MCP variables as needed and document them alongside the existing Momentum entries.
   - Update this document and the MVF requirements to reflect the new agent’s behaviour.

Following the pattern above keeps each agent self-contained (API + card component + types) while sharing the orchestration layer. As more agents arrive, consider extracting shared utilities (e.g., confidence formatting, error panels) into `features/radar/utils` to minimise duplication.


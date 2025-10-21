import { NextResponse } from "next/server";

type AnalyzeMomentumRequest = {
  ticker?: string;
};

type AnalyzeMomentumResponse = {
  ticker: string;
  summary: string;
  analysis: string;
  reasoning: string;
  confidence: number;
  timestamp: string;
};

// const MOMENTUM_PROMPT_ID =
//   process.env.MOMENTUM_PROMPT_ID?.trim() ||
//   "pmpt_68f7e2f0ad788197b73386002e126a35014f91b158069ddc"

const MOMENTUM_PROMPT_ID = process.env.MOMENTUM_PROMPT?.trim() || "";

const ALPHATIDE_MCP_URL = process.env.ALPHATIDE_MCP_URL?.trim() || null;
const ALPHATIDE_MCP_KEY = process.env.ALPHATIDE_MCP_KEY?.trim() || null;

const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() || null;
const OPENAI_API_BASE =
  process.env.OPENAI_API_BASE?.trim() || "https://api.openai.com";

const MCP_ALLOWED_TOOLS = [
  "darkpool_recent",
  "darkpool_ticker",
  "analyst_ratings",
  "analyst_upgrades",
  "analyst_downgrades",
  "analyst_buy_ratings",
  "earnings_afterhours",
  "earnings_premarket",
  "earnings_historical",
  "flow_greek",
  "flow_net_premium",
  "flow_spot_exposures",
  "flow_analyze",
  "flow_nope",
  "greeks_exposure",
  "max_pain",
  "open_interest",
  "options_activity",
  "volatility_realized",
  "volatility_stats",
  "volatility_term_structure",
  "volatility_analyze",
  "market_status",
  "quote",
  "price_intraday",
  "sma",
  "ema",
  "market_news",
] as const;

const RESPONSES_BETA_HEADER = "responses=v1";

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await safeParseJson<AnalyzeMomentumRequest>(request);
    const ticker = normalizeTicker(body?.ticker);

    if (!ticker) {
      return NextResponse.json(
        {
          error: "Invalid ticker symbol",
          message: "Provide a valid ticker symbol to analyze momentum.",
        },
        { status: 400 }
      );
    }

    const configError = validatePromptConfiguration();
    if (configError) {
      return NextResponse.json(
        {
          error: "Momentum prompt is not configured",
          message: configError,
        },
        { status: 500 }
      );
    }

    const result = await runMomentumPromptAnalysis(ticker);

    return NextResponse.json(result satisfies AnalyzeMomentumResponse);
  } catch (error) {
    console.error("[analyze-momentum] unexpected error", error);
    return NextResponse.json(
      {
        error: "Momentum analysis failed",
        message: "Unable to complete momentum analysis. Try again shortly.",
      },
      { status: 500 }
    );
  }
}

export function GET(): Response {
  return NextResponse.json(
    {
      error: "Method Not Allowed",
      message: "Use POST to analyze momentum.",
    },
    { status: 405 }
  );
}

async function runMomentumPromptAnalysis(
  ticker: string
): Promise<AnalyzeMomentumResponse> {
  const serverUrl = ALPHATIDE_MCP_URL;
  const serverKey = ALPHATIDE_MCP_KEY;

  if (!serverUrl || !serverKey) {
    throw new Error("Momentum prompt MCP configuration is missing.");
  }
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const body = {
    prompt: {
      id: MOMENTUM_PROMPT_ID,
      version: "5",
    },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `Analyze momentum for ${ticker}. Respond with JSON containing analysis, reasoning, confidence (0-100), and timestamp.`,
          },
        ],
      },
    ],
    reasoning: {
      summary: "auto",
    },
    tools: [
      {
        type: "mcp",
        allowed_tools: [...MCP_ALLOWED_TOOLS],
        require_approval: "never",
        server_label: "alphatide_mcp",
        server_url: serverUrl,
        headers: {
          "x-api-key": serverKey,
        },
      },
    ],
    store: false,
    include: ["reasoning.encrypted_content", "web_search_call.action.sources"],
  };

  const response = await fetch(`${OPENAI_API_BASE}/v1/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "OpenAI-Beta": RESPONSES_BETA_HEADER,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const detail = await parseErrorDetail(response);
    console.error("[analyze-momentum] prompt request failed", {
      status: response.status,
      detail,
    });
    const message =
      extractDetailMessage(detail) ??
      `OpenAI request failed (${response.status})`;
    throw new Error(message);
  }

  const json = (await response.json()) as unknown;

  const text = extractResponseText(json);

  const payload = parseMomentumPayload(text);

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analyze-momentum] prompt text", text);
    console.debug("[analyze-momentum] parsed payload", payload);
  }

  const analysis = sanitizeText(payload.analysis, "No analysis available.");
  const reasoning = sanitizeText(payload.reasoning, "No reasoning provided.");
  const summary = resolveSummary(payload.summary, analysis);

  return {
    ticker,
    summary,
    analysis,
    reasoning,
    confidence: normalizeConfidence(payload.confidence),
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };
}

function validatePromptConfiguration(): string | null {
  if (!OPENAI_API_KEY) {
    return "Set OPENAI_API_KEY in your environment.";
  }
  if (!ALPHATIDE_MCP_URL || !ALPHATIDE_MCP_KEY) {
    return "Configure ALPHATIDE_MCP_URL and ALPHATIDE_MCP_KEY to enable MCP access.";
  }
  if (!MOMENTUM_PROMPT_ID) {
    return "Set MOMENTUM_PROMPT_ID with your OpenAI prompt identifier.";
  }
  return null;
}

async function parseErrorDetail(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

function extractDetailMessage(detail: unknown): string | null {
  if (!detail) {
    return null;
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (typeof detail === "object") {
    if (
      "message" in detail &&
      typeof (detail as { message?: unknown }).message === "string"
    ) {
      return (detail as { message: string }).message;
    }
    if ("error" in detail) {
      const errorValue = (detail as { error?: unknown }).error;
      if (typeof errorValue === "string") {
        return errorValue;
      }
      if (
        errorValue &&
        typeof errorValue === "object" &&
        "message" in errorValue &&
        typeof (errorValue as { message?: unknown }).message === "string"
      ) {
        return (errorValue as { message: string }).message;
      }
      try {
        return JSON.stringify(errorValue);
      } catch {
        return String(errorValue);
      }
    }
    try {
      return JSON.stringify(detail);
    } catch {
      return String(detail);
    }
  }

  return String(detail);
}

type PromptPayload = {
  summary?: unknown;
  analysis?: unknown;
  reasoning?: unknown;
  confidence?: unknown;
  timestamp?: unknown;
};

function resolveSummary(summary: unknown, analysis: string): string {
  const primary = sanitizeText(summary, "");
  if (primary) {
    return primary;
  }

  const derived = deriveSummaryFromAnalysis(analysis);
  return derived ?? "No summary available.";
}

function deriveSummaryFromAnalysis(analysis: string): string | null {
  if (!analysis || analysis === "No analysis available.") {
    return null;
  }

  const firstSentenceMatch = analysis.match(/[^.!?]+[.!?]/);
  if (firstSentenceMatch?.[0]) {
    return firstSentenceMatch[0].trim();
  }

  const firstLine = analysis.split("\n").find((line) => line.trim().length > 0);
  return firstLine ? firstLine.trim() : null;
}

function extractResponseText(response: unknown): string {
  if (
    response &&
    typeof response === "object" &&
    "output_text" in response &&
    typeof (response as { output_text?: string }).output_text === "string"
  ) {
    const trimmed = (response as { output_text: string }).output_text.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  const outputs = Array.isArray(
    (response as { output?: unknown[] } | undefined)?.output
  )
    ? ((response as { output?: unknown[] }).output as unknown[])
    : [];

  for (const output of outputs) {
    const content = Array.isArray(
      (output as { content?: unknown[] } | undefined)?.content
    )
      ? ((output as { content?: unknown[] }).content as unknown[])
      : [];
    for (const piece of content) {
      if (
        piece &&
        typeof piece === "object" &&
        "text" in piece &&
        typeof (piece as { text?: string }).text === "string"
      ) {
        const candidate = (piece as { text: string }).text.trim();
        if (candidate.length > 0) {
          return candidate;
        }
      }
    }
  }

  throw new Error("Momentum prompt returned empty output.");
}

function parseMomentumPayload(text: string): PromptPayload {
  const cleaned = stripCodeFence(text);
  try {
    const parsed = JSON.parse(cleaned) as PromptPayload;
    return parsed;
  } catch (error) {
    console.error("[analyze-momentum] failed to parse prompt output", {
      text: cleaned,
      error,
    });
    throw new Error("Momentum prompt returned invalid JSON.");
  }
}

function stripCodeFence(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    return fenceMatch[1].trim();
  }
  return text.trim();
}

async function safeParseJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

function normalizeTicker(value?: string | null): string | null {
  const trimmed = value?.trim();
  if (!trimmed) {
    return null;
  }
  const upper = trimmed.toUpperCase();
  if (!/^[A-Z.]{1,6}$/.test(upper)) {
    return null;
  }
  return upper;
}

function sanitizeText(value: unknown, fallback: string): string {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeConfidence(value: unknown): number {
  const numeric =
    typeof value === "number"
      ? value
      : Number.parseFloat(typeof value === "string" ? value : "0");
  if (!Number.isFinite(numeric)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(numeric)));
}

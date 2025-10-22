import { NextResponse } from "next/server";
import type { MarketOverviewData } from "@/features/radar/types";

const MARKET_OVERVIEW_PROMPT_ID = process.env.MARKET_OVERVIEW_PROMPT_ID?.trim() || "";
const ALPHATIDE_MCP_URL = process.env.ALPHATIDE_MCP_URL?.trim() || null;
const ALPHATIDE_MCP_KEY = process.env.ALPHATIDE_MCP_KEY?.trim() || null;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY?.trim() || null;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE?.trim() || "https://api.openai.com";

const MCP_ALLOWED_TOOLS = [
  "quote",
  "market_status",
  "price_intraday",
] as const;

const RESPONSES_BETA_HEADER = "responses=v1";

export async function GET(): Promise<Response> {
  try {
    const configError = validateConfiguration();
    if (configError) {
      return NextResponse.json(
        {
          error: "Market overview is not configured",
          message: configError,
        },
        { status: 500 }
      );
    }

    const result = await fetchMarketOverview();

    return NextResponse.json(result satisfies MarketOverviewData);
  } catch (error) {
    console.error("[market-overview] unexpected error", error);
    return NextResponse.json(
      {
        error: "Market overview failed",
        message: "Unable to fetch market overview. Try again shortly.",
      },
      { status: 500 }
    );
  }
}

async function fetchMarketOverview(): Promise<MarketOverviewData> {
  const serverUrl = ALPHATIDE_MCP_URL;
  const serverKey = ALPHATIDE_MCP_KEY;

  if (!serverUrl || !serverKey) {
    throw new Error("Market overview MCP configuration is missing.");
  }
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const body = {
    prompt: {
      id: MARKET_OVERVIEW_PROMPT_ID,
    },
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: "Fetch current market overview data.",
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
    include: ["reasoning.encrypted_content"],
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
    console.error("[market-overview] prompt request failed", {
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
  let raw = text.trim();

  console.log("[market-overview] prompt raw output:", raw);

  // Try to extract JSON from markdown code blocks if present
  const jsonBlockMatch = raw.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
  if (jsonBlockMatch) {
    raw = jsonBlockMatch[1].trim();
    console.log("[market-overview] extracted JSON from code block:", raw);
  }

  // Parse the JSON response from the prompt
  let parsed: MarketOverviewData;
  try {
    parsed = JSON.parse(raw) as MarketOverviewData;
    if (process.env.NODE_ENV !== "production") {
      console.debug("[market-overview] parsed successfully", parsed);
    }
  } catch (parseError) {
    console.error("[market-overview] failed to parse prompt output", parseError);
    console.error("[market-overview] raw output that failed to parse:", raw);
    throw new Error(`Failed to parse market overview data. Raw output: ${raw.substring(0, 200)}`);
  }

  // Validate required fields
  if (!parsed.metrics || !Array.isArray(parsed.metrics)) {
    throw new Error("Invalid market overview data: missing metrics");
  }
  if (!parsed.sentiment || typeof parsed.sentiment !== "object") {
    throw new Error("Invalid market overview data: missing sentiment");
  }
  if (!parsed.marketStatus || typeof parsed.marketStatus !== "object") {
    throw new Error("Invalid market overview data: missing marketStatus");
  }

  return parsed;
}

function validateConfiguration(): string | null {
  if (!OPENAI_API_KEY) {
    return "Set OPENAI_API_KEY in your environment.";
  }
  if (!ALPHATIDE_MCP_URL || !ALPHATIDE_MCP_KEY) {
    return "Configure ALPHATIDE_MCP_URL and ALPHATIDE_MCP_KEY to enable MCP access.";
  }
  if (!MARKET_OVERVIEW_PROMPT_ID) {
    return "Set MARKET_OVERVIEW_PROMPT_ID with your OpenAI prompt identifier.";
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

  throw new Error("Market overview prompt returned empty output.");
}

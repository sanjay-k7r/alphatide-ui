export type MomentumCardStatus = "idle" | "loading" | "ready" | "error"

export interface MomentumAnalysisResult {
  ticker: string
  summary: string
  analysis: string
  reasoning: string
  confidence: number | string
  timestamp: string
  darkpool_summary?: string
  darkpool_analysis?: string
  darkpool_confidence?: number | string
}

export interface RadarCardState {
  id: string
  ticker: string
  status: MomentumCardStatus
  result?: MomentumAnalysisResult
  error?: string | null
}

// Market Overview Types
export type MarketSentimentStatus = "bullish" | "bearish" | "neutral"
export type ChangeDirection = "up" | "down" | "flat"
export type MarketSession = "pre" | "regular" | "after" | "closed"

export interface MarketMetric {
  ticker: string
  name: string
  price: number | null
  change: number
  changeDirection: ChangeDirection
}

export interface MarketSentiment {
  status: MarketSentimentStatus
  label: string
  description: string
}

export interface MarketStatus {
  isOpen: boolean
  session: MarketSession
  nextOpen: string | null
  nextClose: string | null
}

export interface MarketOverviewData {
  metrics: MarketMetric[]
  sentiment: MarketSentiment
  marketStatus: MarketStatus
  timestamp: string
  errors?: Array<{
    ticker: string
    message: string
  }>
}

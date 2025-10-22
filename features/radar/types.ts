export type MomentumCardStatus = "idle" | "loading" | "ready" | "error"

export interface MomentumAnalysisResult {
  ticker: string
  summary: string
  analysis: string
  reasoning: string
  confidence: number | string
  timestamp: string
}

export interface RadarCardState {
  id: string
  ticker: string
  status: MomentumCardStatus
  result?: MomentumAnalysisResult
  error?: string | null
}

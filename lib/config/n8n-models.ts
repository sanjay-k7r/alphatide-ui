export const N8N_MODELS = {
  CLAUDE_4_5: "claude-4-5",
  GPT_5: "gpt-5",
} as const

export type N8nModel = (typeof N8N_MODELS)[keyof typeof N8N_MODELS]

export const N8N_MODEL_LABELS: Record<N8nModel, string> = {
  [N8N_MODELS.CLAUDE_4_5]: "Claude 4.5",
  [N8N_MODELS.GPT_5]: "GPT-5",
}

export const DEFAULT_N8N_MODEL: N8nModel = N8N_MODELS.CLAUDE_4_5

export const N8N_MODEL_OPTIONS = Object.entries(N8N_MODEL_LABELS).map(
  ([value, label]) => ({
    value: value as N8nModel,
    label,
  })
)

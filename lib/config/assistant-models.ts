export const ASSISTANT_MODELS = {
  CLAUDE_4_5: "claude-4-5",
  GPT_5: "gpt-5",
} as const

export type AssistantModel = (typeof ASSISTANT_MODELS)[keyof typeof ASSISTANT_MODELS]

export const ASSISTANT_MODEL_LABELS: Record<AssistantModel, string> = {
  [ASSISTANT_MODELS.CLAUDE_4_5]: "Claude 4.5",
  [ASSISTANT_MODELS.GPT_5]: "GPT-5",
}

export const DEFAULT_ASSISTANT_MODEL: AssistantModel = ASSISTANT_MODELS.CLAUDE_4_5

export const ASSISTANT_MODEL_OPTIONS = Object.entries(ASSISTANT_MODEL_LABELS).map(
  ([value, label]) => ({
    value: value as AssistantModel,
    label,
  })
)

// Workflow stores message as JSONB with this structure
export type AssistantMessageJson = {
  type: 'human' | 'ai' | 'system'
  content: string
  additional_kwargs?: Record<string, unknown>
  response_metadata?: Record<string, unknown>
}

export type AssistantChatHistory = {
  id: number
  session_id: string
  message: AssistantMessageJson  // JSONB column
}

export type UserAssistantSession = {
  id: string
  user_id: string
  session_id: string
  title: string
  model?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
}

export type CreateSessionInput = {
  title?: string
  model?: string
  metadata?: Record<string, unknown>
}

export type SessionWithFirstMessage = UserAssistantSession & {
  first_message?: string
  message_count?: number
}

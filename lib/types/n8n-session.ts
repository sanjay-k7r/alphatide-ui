// n8n stores message as JSONB with this structure
export type N8nMessageJson = {
  type: 'human' | 'ai' | 'system'
  content: string
  additional_kwargs?: Record<string, unknown>
  response_metadata?: Record<string, unknown>
}

export type N8nChatHistory = {
  id: number
  session_id: string
  message: N8nMessageJson  // JSONB column
}

export type UserN8nSession = {
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

export type SessionWithFirstMessage = UserN8nSession & {
  first_message?: string
  message_count?: number
}

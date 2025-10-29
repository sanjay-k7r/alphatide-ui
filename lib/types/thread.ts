export type Thread = {
  id: string
  thread_id: string
  user_id: string
  title: string
  created_at: string
  updated_at: string
  messages?: ThreadMessage[]
  metadata?: Record<string, unknown>
}

export type ThreadMessage = {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export type CreateThreadInput = {
  title: string
  user_id: string
  metadata?: Record<string, unknown>
}

export type UpdateThreadInput = {
  title?: string
  updated_at?: string
  metadata?: Record<string, unknown>
}

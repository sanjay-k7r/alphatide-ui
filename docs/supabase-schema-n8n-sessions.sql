-- Create user_n8n_sessions table to map users to their N8N chat sessions
-- This table stores metadata about each chat session
-- The actual messages are stored in n8n_chat_histories table (managed by n8n)

CREATE TABLE IF NOT EXISTS user_n8n_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT 'New Chat',
  model TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_user_n8n_sessions_user_id ON user_n8n_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_n8n_sessions_session_id ON user_n8n_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_user_n8n_sessions_updated_at ON user_n8n_sessions(updated_at DESC);

-- Enable Row Level Security
ALTER TABLE user_n8n_sessions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own sessions
CREATE POLICY "Users can view own sessions"
  ON user_n8n_sessions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own sessions
CREATE POLICY "Users can create own sessions"
  ON user_n8n_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own sessions
CREATE POLICY "Users can update own sessions"
  ON user_n8n_sessions
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own sessions
CREATE POLICY "Users can delete own sessions"
  ON user_n8n_sessions
  FOR DELETE
  USING (auth.uid() = user_id);

-- Optional: Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_n8n_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_n8n_sessions_updated_at
  BEFORE UPDATE ON user_n8n_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_n8n_sessions_updated_at();

-- Grant necessary permissions (adjust as needed for your setup)
GRANT ALL ON user_n8n_sessions TO authenticated;
GRANT ALL ON user_n8n_sessions TO service_role;

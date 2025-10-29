-- RLS Policies for n8n_chat_histories table
-- This allows users to read chat history for their sessions

-- First, enable RLS on the table (if not already enabled)
ALTER TABLE n8n_chat_histories ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow users to read messages for their sessions
-- This joins with user_n8n_sessions to verify ownership
CREATE POLICY "Users can read their own chat history"
ON n8n_chat_histories
FOR SELECT
USING (
  session_id IN (
    SELECT session_id
    FROM user_n8n_sessions
    WHERE user_id = auth.uid()
  )
);

-- Policy 2: Allow n8n (or service role) to insert messages
CREATE POLICY "Service role can insert messages"
ON n8n_chat_histories
FOR INSERT
WITH CHECK (true);

-- Policy 3: Allow service role to read all (for n8n workflow)
CREATE POLICY "Service role can read all messages"
ON n8n_chat_histories
FOR SELECT
TO service_role
USING (true);

-- Grant necessary permissions
GRANT SELECT ON n8n_chat_histories TO authenticated;
GRANT INSERT ON n8n_chat_histories TO service_role;
GRANT SELECT ON n8n_chat_histories TO service_role;

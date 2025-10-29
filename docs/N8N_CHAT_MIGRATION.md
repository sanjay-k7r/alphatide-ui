# N8N Chat Migration Guide

## Overview

This migration updates the N8N chat to use a session-based architecture that integrates with n8n's postgres chat memory node.

## Architecture Changes

### Old Architecture ❌
- Used `threads` table with `thread_id`
- Saved entire conversations in app
- No integration with n8n's memory system

### New Architecture ✅
- **`n8n_chat_histories`** - Managed by n8n, stores all messages
- **`user_n8n_sessions`** - Maps users to their session IDs
- Session-based approach aligns with n8n postgres memory
- Frontend only tracks session metadata, n8n stores actual messages

## Database Setup

### 1. Create `user_n8n_sessions` Table

Run this SQL in your Supabase SQL Editor:

```sql
-- See: docs/supabase-schema-n8n-sessions.sql
```

The table structure:
- `id` - UUID primary key
- `user_id` - References auth.users
- `session_id` - Unique session identifier (sent to n8n)
- `title` - Display title (from first user message)
- `model` - AI model used (claude-4-5, gpt-5, etc.)
- `created_at` / `updated_at` - Timestamps
- `metadata` - JSONB for additional data

### 2. Verify `n8n_chat_histories` Table

n8n's postgres chat memory node should have created this table. Verify with:

```sql
SELECT * FROM n8n_chat_histories LIMIT 5;
```

Expected columns:
- `id`
- `session_id`
- `role` (user/assistant/system)
- `message`
- `created_at`

## Code Changes

### New Files Created

1. **Types** - `lib/types/n8n-session.ts`
   - `N8nChatHistory` - Message structure
   - `UserN8nSession` - Session metadata
   - `SessionWithFirstMessage` - For list view

2. **API Routes** - Session management
   - `app/api/n8n-sessions/route.ts`
     - GET: List user's sessions
     - POST: Create new session
   - `app/api/n8n-sessions/[session_id]/route.ts`
     - GET: Load session with full history
     - PATCH: Update session (e.g., title)
     - DELETE: Delete session

3. **Components** - New chat interface
   - `components/N8nChatPanel-new.tsx`
     - Session-based chat
     - Auto-creates session on first message
     - Loads history from n8n_chat_histories
   - `components/N8nChatHistory-new.tsx`
     - Lists sessions with first message preview
     - Shows message count per session
     - Load/delete sessions

### Files to Replace

Replace the old files with new versions:

```bash
# Backup old files (optional)
mv components/N8nChatPanel.tsx components/N8nChatPanel-old.tsx
mv components/N8nChatHistory.tsx components/N8nChatHistory-old.tsx

# Rename new files to active
mv components/N8nChatPanel-new.tsx components/N8nChatPanel.tsx
mv components/N8nChatHistory-new.tsx components/N8nChatHistory.tsx
```

### Files to Remove (After Migration)

Once verified, you can remove:
- Old thread-based files (if not needed)
- `app/api/threads/` directory
- `lib/types/thread.ts`

## How It Works

### Flow Diagram

```
User sends message
       ↓
Frontend creates session (if new)
       ↓
sessionId = "n8n-{uuid}"
       ↓
Saves to user_n8n_sessions table
       ↓
Sends to /api/n8n-chat with sessionId
       ↓
n8n webhook receives: { chatInput, model, sessionId }
       ↓
n8n postgres memory node stores in n8n_chat_histories
       ↓
Frontend loads history via session_id query
```

### Session Management

**Creating a Session:**
1. User types first message
2. Frontend generates session ID: `n8n-{uuid}`
3. Creates record in `user_n8n_sessions`
4. Sends message to n8n with `sessionId`
5. n8n memory node associates messages with session

**Loading History:**
1. User clicks on session in history panel
2. Frontend fetches from `/api/n8n-sessions/{session_id}`
3. API joins `user_n8n_sessions` + `n8n_chat_histories`
4. Returns full conversation history
5. Renders in chat window

**New Chat:**
1. User clicks "New Chat" button
2. Clears messages and session ID
3. Next message creates new session

## n8n Configuration

Your n8n workflow should:

1. Accept webhook with:
```json
{
  "chatInput": "user message",
  "model": "claude-4-5",
  "sessionId": "n8n-{uuid}"
}
```

2. Use **Postgres Chat Memory** node:
   - Connection: Your Supabase postgres
   - Table: `n8n_chat_histories`
   - Session ID: `{{ $json.sessionId }}`

3. Return streaming response (unchanged)

## Testing Checklist

- [ ] Run SQL to create `user_n8n_sessions` table
- [ ] Verify n8n_chat_histories exists
- [ ] Replace component files
- [ ] Test: Create new chat
- [ ] Test: Send message (session created)
- [ ] Test: View in history panel
- [ ] Test: Load previous session
- [ ] Test: Delete session
- [ ] Test: Search sessions
- [ ] Verify: Messages stored in n8n_chat_histories
- [ ] Verify: Session metadata in user_n8n_sessions

## Migration Benefits

✅ Integrates with n8n's memory system
✅ No duplicate message storage
✅ Session-based architecture (industry standard)
✅ Better scalability
✅ Cleaner separation of concerns
✅ Full chat history managed by n8n

## Rollback Plan

If issues occur:

```bash
# Restore old files
mv components/N8nChatPanel-old.tsx components/N8nChatPanel.tsx
mv components/N8nChatHistory-old.tsx components/N8nChatHistory.tsx

# Old system will continue using threads table
```

## Support

Check logs for debugging:
- `[N8N Chat]` - Frontend chat component
- `[N8N Sessions API]` - Backend API
- `[N8N Chat History]` - History panel
- `[N8N API]` - Webhook proxy

All session operations log to browser console for easy debugging.

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateSessionInput } from '@/lib/types/n8n-session'
import { randomUUID } from 'crypto'

// GET /api/n8n-sessions - List all sessions for the current user with first message
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch sessions for this user, ordered by most recent
    const { data: sessions, error } = await supabase
      .from('user_n8n_sessions')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[N8N Sessions API] Error fetching sessions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: error.message },
        { status: 500 }
      )
    }

    // For each session, get the first user message from n8n_chat_histories
    const sessionsWithMessages = await Promise.all(
      (sessions || []).map(async (session) => {
        // n8n stores messages as JSONB: { type: 'human'|'ai', content: '...' }
        const { data: messages } = await supabase
          .from('n8n_chat_histories')
          .select('message')
          .eq('session_id', session.session_id)
          .order('id', { ascending: true })
          .limit(1)

        // Get message count
        const { count } = await supabase
          .from('n8n_chat_histories')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.session_id)

        // Extract content from JSONB message where type is 'human'
        const firstMessage = messages?.[0]?.message
        const firstContent = firstMessage?.type === 'human' ? firstMessage.content : session.title

        return {
          ...session,
          first_message: firstContent,
          message_count: count || 0,
        }
      })
    )

    return NextResponse.json({ sessions: sessionsWithMessages })
  } catch (error) {
    console.error('[N8N Sessions API] Unexpected error fetching sessions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/n8n-sessions - Create a new session
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: CreateSessionInput = await request.json()

    const now = new Date().toISOString()
    const sessionId = `n8n-${randomUUID()}`

    const sessionData = {
      user_id: user.id,
      session_id: sessionId,
      title: body.title || 'New Chat',
      model: body.model,
      created_at: now,
      updated_at: now,
      metadata: body.metadata || {},
    }

    const { data: session, error } = await supabase
      .from('user_n8n_sessions')
      .insert(sessionData)
      .select()
      .single()

    if (error) {
      console.error('[N8N Sessions API] Error creating session:', error)
      return NextResponse.json(
        { error: 'Failed to create session', details: error.message },
        { status: 500 }
      )
    }

    console.log('[N8N Sessions API] Session created:', sessionId)
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('[N8N Sessions API] Unexpected error creating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

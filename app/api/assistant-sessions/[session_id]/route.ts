import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ session_id: string }>
}

// GET /api/assistant-sessions/:session_id - Get session with full chat history
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { session_id } = await context.params
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the session and verify ownership
    const { data: session, error: sessionError } = await supabase
      .from('user_n8n_sessions')
      .select('*')
      .eq('session_id', session_id)
      .eq('user_id', user.id)
      .single()

    if (sessionError) {
      if (sessionError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }
      console.error('[Assistant Sessions API] Error fetching session:', sessionError)
      return NextResponse.json(
        { error: 'Failed to fetch session', details: sessionError.message },
        { status: 500 }
      )
    }

    // Fetch chat history for this session from chat_histories
    // Note: chat memory uses 'id' for ordering, not 'created_at'
    const { data: messages, error: messagesError } = await supabase
      .from('n8n_chat_histories')
      .select('*')
      .eq('session_id', session_id)
      .order('id', { ascending: true })

    if (messagesError) {
      console.error('[Assistant Sessions API] Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: 'Failed to fetch messages', details: messagesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      session,
      messages: messages || [],
    })
  } catch (error) {
    console.error('[Assistant Sessions API] Unexpected error fetching session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/assistant-sessions/:session_id - Delete a session
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { session_id } = await context.params
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Delete the session (only if owned by user)
    const { error } = await supabase
      .from('user_n8n_sessions')
      .delete()
      .eq('session_id', session_id)
      .eq('user_id', user.id)

    if (error) {
      console.error('[Assistant Sessions API] Error deleting session:', error)
      return NextResponse.json(
        { error: 'Failed to delete session', details: error.message },
        { status: 500 }
      )
    }

    // Note: We don't delete from chat_histories to preserve the data
    // You can add this if you want to delete the messages too

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Assistant Sessions API] Unexpected error deleting session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/assistant-sessions/:session_id - Update session (e.g., title)
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { session_id } = await context.params
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: session, error } = await supabase
      .from('user_n8n_sessions')
      .update(updateData)
      .eq('session_id', session_id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }
      console.error('[Assistant Sessions API] Error updating session:', error)
      return NextResponse.json(
        { error: 'Failed to update session', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ session })
  } catch (error) {
    console.error('[Assistant Sessions API] Unexpected error updating session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { CreateThreadInput } from '@/lib/types/thread'
import { randomUUID } from 'crypto'

// GET /api/threads - List all threads for the current user
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

    // Fetch threads for this user, ordered by most recent
    const { data: threads, error } = await supabase
      .from('threads')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching threads:', error)
      return NextResponse.json(
        { error: 'Failed to fetch threads', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ threads })
  } catch (error) {
    console.error('Unexpected error fetching threads:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/threads - Create a new thread
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

    const body: CreateThreadInput = await request.json()

    const now = new Date().toISOString()
    const threadData = {
      thread_id: randomUUID(),
      user_id: user.id,
      title: body.title || 'New Chat',
      created_at: now,
      updated_at: now,
      metadata: body.metadata || {},
    }

    const { data: thread, error } = await supabase
      .from('threads')
      .insert(threadData)
      .select()
      .single()

    if (error) {
      console.error('Error creating thread:', error)
      return NextResponse.json(
        { error: 'Failed to create thread', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ thread }, { status: 201 })
  } catch (error) {
    console.error('Unexpected error creating thread:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

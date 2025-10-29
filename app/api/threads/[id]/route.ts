import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import type { UpdateThreadInput } from '@/lib/types/thread'

type RouteContext = {
  params: Promise<{ id: string }>
}

// GET /api/threads/:id - Get a specific thread
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch the thread
    const { data: thread, error } = await supabase
      .from('threads')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Thread not found' },
          { status: 404 }
        )
      }
      console.error('Error fetching thread:', error)
      return NextResponse.json(
        { error: 'Failed to fetch thread', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ thread })
  } catch (error) {
    console.error('Unexpected error fetching thread:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/threads/:id - Update a thread
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body: UpdateThreadInput = await request.json()

    const updateData = {
      ...body,
      updated_at: new Date().toISOString(),
    }

    const { data: thread, error } = await supabase
      .from('threads')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Thread not found' },
          { status: 404 }
        )
      }
      console.error('Error updating thread:', error)
      return NextResponse.json(
        { error: 'Failed to update thread', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ thread })
  } catch (error) {
    console.error('Unexpected error updating thread:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/threads/:id - Delete a thread
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { error } = await supabase
      .from('threads')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting thread:', error)
      return NextResponse.json(
        { error: 'Failed to delete thread', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Unexpected error deleting thread:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

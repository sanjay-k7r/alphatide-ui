import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Query to get all tables in the public schema
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')

    if (error) {
      // If direct query doesn't work, try listing known tables
      const knownTables = [
        'profiles',
        'threads',
        'messages',
        'users',
        'watchlists',
        'portfolios',
        'alerts',
        'trades',
        'positions'
      ]

      const existingTables = []

      for (const tableName of knownTables) {
        const { error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(0)

        if (!tableError) {
          existingTables.push(tableName)
        }
      }

      return NextResponse.json({
        method: 'table_check',
        tables: existingTables,
        note: 'Listed by checking common table names'
      })
    }

    return NextResponse.json({
      method: 'schema_query',
      tables: data?.map(t => t.table_name) || []
    })
  } catch (error) {
    console.error('Error checking tables:', error)
    return NextResponse.json(
      { error: 'Failed to check tables', details: String(error) },
      { status: 500 }
    )
  }
}

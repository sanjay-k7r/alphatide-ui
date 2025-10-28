import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function listTables() {
  console.log('Connecting to Supabase...\n')

  // Query the information_schema to get all tables
  const { data, error } = await supabase
    .rpc('get_tables')
    .select()

  if (error) {
    console.error('Error fetching tables using RPC:', error)
    console.log('\nTrying alternative method...\n')

    // Alternative: Try to query known common tables
    const commonTables = ['users', 'profiles', 'threads', 'messages', 'sessions', 'watchlists', 'portfolios']

    console.log('Checking for common tables:')
    for (const table of commonTables) {
      const { error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(0)

      if (!tableError) {
        console.log(`✓ ${table}`)
      }
    }

    return
  }

  console.log('Tables in your Supabase project:')
  console.log(data)
}

listTables()

import { createBrowserClient } from "@supabase/ssr"

/**
 * Singleton Supabase browser client
 * Creates a single instance to prevent multiple connections
 * Used in client components only
 */
let supabase: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  if (!supabase) {
    supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return supabase
}

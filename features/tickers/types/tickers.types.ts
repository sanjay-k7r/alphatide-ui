export interface Ticker {
  id: string
  ticker: string
  name: string | null
  description?: string | null
  is_public?: boolean
  user_id?: string | null
  created_at: string
}

export interface CreateTickerInput {
  ticker: string
  name?: string | null
  description?: string | null
  is_public?: boolean
}

export interface UpdateTickerInput {
  ticker?: string
  name?: string | null
  description?: string | null
  is_public?: boolean
}

export function transformTickerFromDB(row: any): Ticker {
  return {
    id: row.id,
    ticker: row.ticker,
    name: row.name,
    description: row.description,
    is_public: row.is_public,
    user_id: row.user_id,
    created_at: row.created_at,
  }
}

export function transformTickerToDB(
  ticker: Partial<CreateTickerInput | UpdateTickerInput>
): Record<string, unknown> {
  return ticker
}

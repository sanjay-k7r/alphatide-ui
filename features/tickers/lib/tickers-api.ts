import { createClient } from "@/lib/supabase/client"
import type {
  CreateTickerInput,
  Ticker,
  UpdateTickerInput,
} from "@/features/tickers/types/tickers.types"
import {
  transformTickerFromDB,
  transformTickerToDB,
} from "@/features/tickers/types/tickers.types"

class TickerCacheManager {
  private static instance: TickerCacheManager
  private cache: Ticker[] | null = null
  private cacheTimestamp: number | null = null
  private readonly CACHE_DURATION = 5 * 60 * 1000
  private eventTarget = new EventTarget()

  private constructor() {}

  public static getInstance(): TickerCacheManager {
    if (!TickerCacheManager.instance) {
      TickerCacheManager.instance = new TickerCacheManager()
    }
    return TickerCacheManager.instance
  }

  public getCache(): Ticker[] | null {
    if (!this.cache || !this.cacheTimestamp) {
      return null
    }

    const now = Date.now()
    if (now - this.cacheTimestamp > this.CACHE_DURATION) {
      this.invalidate()
      return null
    }

    return this.cache
  }

  public setCache(tickers: Ticker[]): void {
    this.cache = tickers
    this.cacheTimestamp = Date.now()
  }

  public invalidate(): void {
    this.cache = null
    this.cacheTimestamp = null
    this.eventTarget.dispatchEvent(new Event("refresh"))
  }

  public onRefresh(callback: () => void): () => void {
    this.eventTarget.addEventListener("refresh", callback)
    return () => this.eventTarget.removeEventListener("refresh", callback)
  }
}

export const tickerCache = TickerCacheManager.getInstance()

export class TickersAPI {
  private static instance: TickersAPI
  private supabase

  private constructor() {
    this.supabase = createClient()
  }

  public static getInstance(): TickersAPI {
    if (!TickersAPI.instance) {
      TickersAPI.instance = new TickersAPI()
    }
    return TickersAPI.instance
  }

  async fetchTickers(): Promise<Ticker[]> {
    const cached = tickerCache.getCache()
    if (cached) {
      return cached
    }

    const { data, error } = await this.supabase
      .from("tickers")
      .select("*")
      .order("ticker")

    if (error) throw error

    const tickers = (data || []).map(transformTickerFromDB)
    tickerCache.setCache(tickers)
    return tickers
  }

  async fetchUserTickers(userId: string): Promise<Ticker[]> {
    const { data, error } = await this.supabase
      .from("tickers")
      .select("*")
      .eq("user_id", userId)
      .order("ticker")

    if (error) throw error
    return (data || []).map(transformTickerFromDB)
  }

  async createTicker(
    input: CreateTickerInput,
    userId: string
  ): Promise<Ticker> {
    const dbInput = transformTickerToDB(input)

    const { data, error } = await this.supabase
      .from("tickers")
      .insert({
        ...dbInput,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error

    tickerCache.invalidate()
    return transformTickerFromDB(data)
  }

  async updateTicker(id: string, updates: UpdateTickerInput): Promise<Ticker> {
    const dbUpdates = transformTickerToDB(updates)

    const { data, error } = await this.supabase
      .from("tickers")
      .update(dbUpdates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    tickerCache.invalidate()
    return transformTickerFromDB(data)
  }

  async deleteTicker(id: string): Promise<void> {
    const { error } = await this.supabase.from("tickers").delete().eq("id", id)

    if (error) throw error
    tickerCache.invalidate()
  }
}

export const tickersAPI = TickersAPI.getInstance()

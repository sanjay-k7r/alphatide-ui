export interface Question {
  id: string
  user_id: string | null
  text: string
  category: string
  subcategory: string | null
  order_index: number
  is_global: boolean
  created_at: string
  updated_at: string
}

export interface QuestionsByCategory {
  [category: string]: {
    [subcategory: string]: Question[]
  }
}

export interface CreateQuestionInput {
  text: string
  category: string
  subcategory: string | null
  order_index: number
  is_global?: boolean
}

export interface UpdateQuestionInput {
  text?: string
  category?: string
  subcategory?: string | null
  order_index?: number
  is_global?: boolean
}

export const QUESTION_CATEGORIES = [
  "TraderZone",
  "MarketMaker",
  "Earnings",
  "News",
  "Labs",
  "Other",
] as const

export type QuestionCategory = (typeof QUESTION_CATEGORIES)[number]

export const CATEGORY_COLORS: Record<string, string> = {
  traderzone: "emerald",
  marketmaker: "blue",
  earnings: "purple",
  news: "amber",
  labs: "pink",
  other: "gray",
}

export function getCategoryPriority(category: string): number {
  switch (category.toLowerCase()) {
    case "labs":
      return -1
    case "traderzone":
      return 0
    case "marketmaker":
      return 1
    case "earnings":
      return 2
    case "news":
      return 3
    case "news flash":
      return 4
    default:
      return 999
  }
}

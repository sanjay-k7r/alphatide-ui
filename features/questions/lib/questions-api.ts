import { createClient } from "@/lib/supabase/client"
import type {
  Question,
  CreateQuestionInput,
  UpdateQuestionInput,
} from "@/features/questions/types/questions.types"

export class QuestionsAPI {
  private static instance: QuestionsAPI
  private supabase

  private constructor() {
    this.supabase = createClient()
  }

  public static getInstance(): QuestionsAPI {
    if (!QuestionsAPI.instance) {
      QuestionsAPI.instance = new QuestionsAPI()
    }
    return QuestionsAPI.instance
  }

  async fetchQuestions(userId: string): Promise<Question[]> {
    const { data, error } = await this.supabase
      .from("questions")
      .select("*")
      .or(`is_global.eq.true,user_id.eq.${userId}`)
      .order("category")
      .order("subcategory")
      .order("order_index")

    if (error) throw error
    return data || []
  }

  async createQuestion(
    input: CreateQuestionInput,
    userId: string
  ): Promise<Question> {
    const { data, error } = await this.supabase
      .from("questions")
      .insert({
        ...input,
        user_id: userId,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateQuestion(
    id: string,
    updates: UpdateQuestionInput
  ): Promise<Question> {
    const { data, error } = await this.supabase
      .from("questions")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteQuestion(id: string): Promise<void> {
    const { error } = await this.supabase.from("questions").delete().eq("id", id)

    if (error) throw error
  }

  subscribeToGlobalQuestions(callback: (question: Question) => void) {
    return this.supabase
      .channel("global-questions")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: "is_global=eq.true",
        },
        (payload: { new: Question }) => {
          callback(payload.new)
        }
      )
      .subscribe()
  }

  subscribeToUserQuestions(userId: string, callback: (question: Question) => void) {
    return this.supabase
      .channel(`user-questions-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "questions",
          filter: `user_id=eq.${userId}`,
        },
        (payload: { new: Question }) => {
          callback(payload.new)
        }
      )
      .subscribe()
  }
}

export const questionsAPI = QuestionsAPI.getInstance()

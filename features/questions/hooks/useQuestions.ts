"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { questionsAPI } from "@/features/questions/lib/questions-api"
import type {
  CreateQuestionInput,
  Question,
  QuestionsByCategory,
  UpdateQuestionInput,
} from "@/features/questions/types/questions.types"
import { getCategoryPriority } from "@/features/questions/types/questions.types"

export function useQuestions(userId: string | undefined) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchQuestions = useCallback(async () => {
    if (!userId) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await questionsAPI.fetchQuestions(userId)
      setQuestions(data)
    } catch (err) {
      setError(err as Error)
      console.error("Error fetching questions:", err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void fetchQuestions()
  }, [fetchQuestions])

  useEffect(() => {
    if (!userId) {
      return
    }

    const globalChannel = questionsAPI.subscribeToGlobalQuestions(() => {
      void fetchQuestions()
    })

    const userChannel = questionsAPI.subscribeToUserQuestions(userId, () => {
      void fetchQuestions()
    })

    return () => {
      void globalChannel.unsubscribe()
      void userChannel.unsubscribe()
    }
  }, [fetchQuestions, userId])

  const questionsByCategory = useMemo((): QuestionsByCategory => {
    const grouped: QuestionsByCategory = {}

    questions.forEach((question) => {
      if (!grouped[question.category]) {
        grouped[question.category] = {}
      }

      const subcategory = question.subcategory || "General"
      if (!grouped[question.category][subcategory]) {
        grouped[question.category][subcategory] = []
      }

      grouped[question.category][subcategory].push(question)
    })

    const sortedGrouped: QuestionsByCategory = {}
    Object.keys(grouped)
      .sort((a, b) => getCategoryPriority(a) - getCategoryPriority(b))
      .forEach((category) => {
        sortedGrouped[category] = grouped[category]
      })

    return sortedGrouped
  }, [questions])

  const createQuestion = useCallback(
    async (input: CreateQuestionInput) => {
      if (!userId) throw new Error("User ID is required")

      try {
        setError(null)
        const newQuestion = await questionsAPI.createQuestion(input, userId)
        setQuestions((prev) => [...prev, newQuestion])
        return newQuestion
      } catch (err) {
        setError(err as Error)
        throw err
      }
    },
    [userId]
  )

  const updateQuestion = useCallback(
    async (id: string, updates: UpdateQuestionInput) => {
      try {
        setError(null)
        const updatedQuestion = await questionsAPI.updateQuestion(id, updates)
        setQuestions((prev) =>
          prev.map((question) =>
            question.id === id ? updatedQuestion : question
          )
        )
        return updatedQuestion
      } catch (err) {
        setError(err as Error)
        throw err
      }
    },
    []
  )

  const deleteQuestion = useCallback(async (id: string) => {
    try {
      setError(null)
      await questionsAPI.deleteQuestion(id)
      setQuestions((prev) => prev.filter((question) => question.id !== id))
    } catch (err) {
      setError(err as Error)
      throw err
    }
  }, [])

  return {
    questions,
    questionsByCategory,
    loading,
    error,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    refresh: fetchQuestions,
  }
}

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import type { CreateQuestionInput } from "@/features/questions/types/questions.types"
import { QUESTION_CATEGORIES } from "@/features/questions/types/questions.types"
import { isAdminUser } from "@/features/questions/utils/admin"

type CurrentUser = {
  id: string
  email?: string | null
} | null

interface AddQuestionDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (question: CreateQuestionInput) => Promise<void>
  currentUser: CurrentUser
}

export function AddQuestionDialog({
  isOpen,
  onClose,
  onAdd,
  currentUser,
}: AddQuestionDialogProps) {
  const [formData, setFormData] = useState({
    text: "",
    category: "",
    subcategory: "",
    order_index: 0,
    is_global: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAdmin = isAdminUser(currentUser?.id)

  const resetForm = () => {
    setFormData({
      text: "",
      category: "",
      subcategory: "",
      order_index: 0,
      is_global: false,
    })
    setError(null)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!formData.text.trim()) {
      setError("Question text is required")
      return
    }
    if (!formData.category.trim()) {
      setError("Category is required")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const questionData: CreateQuestionInput = {
        text: formData.text.trim(),
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim() || null,
        order_index: formData.order_index,
        is_global: isAdmin ? formData.is_global : false,
      }

      await onAdd(questionData)
      resetForm()
      onClose()
    } catch (err) {
      console.error("Failed to create question:", err)
      setError(
        err instanceof Error ? err.message : "Failed to create question"
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(event) => {
          if (isSubmitting) {
            event.preventDefault()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Add New Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="question-text">Question Text</Label>
            <Textarea
              id="question-text"
              placeholder="Enter your question... Use {ticker} for ticker placeholder"
              value={formData.text}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, text: event.target.value }))
              }
              required
              className="min-h-[80px]"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use{" "}
              <code className="rounded bg-muted px-1">{`{ticker}`}</code> as a
              placeholder for ticker symbols
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="question-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger id="question-category">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="question-subcategory">Subcategory</Label>
              <Input
                id="question-subcategory"
                placeholder="Optional"
                value={formData.subcategory}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    subcategory: event.target.value,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="question-order">Order Index</Label>
              <Input
                id="question-order"
                type="number"
                min={0}
                value={formData.order_index}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    order_index: Number(event.target.value),
                  }))
                }
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Make Global</span>
                <Switch
                  checked={formData.is_global && isAdmin}
                  disabled={!isAdmin || isSubmitting}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_global: checked }))
                  }
                />
              </Label>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Only admins can create global questions.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : "Add question"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

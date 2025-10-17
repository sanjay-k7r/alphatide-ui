"use client"

import { useEffect, useMemo, useState } from "react"
import { AlertTriangle, Trash2 } from "lucide-react"
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
import { Separator } from "@/components/ui/separator"
import type { Question } from "@/features/questions/types/questions.types"
import { QUESTION_CATEGORIES } from "@/features/questions/types/questions.types"
import { isAdminUser } from "@/features/questions/utils/admin"

type CurrentUser = {
  id: string
  email?: string | null
} | null

interface EditQuestionDialogProps {
  question: Question | null
  onUpdate: (
    id: string,
    updates: Partial<
      Omit<Question, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onClose?: () => void
  currentUser: CurrentUser
}

export function EditQuestionDialog({
  question,
  onUpdate,
  onDelete,
  onClose,
  currentUser,
}: EditQuestionDialogProps) {
  const [formData, setFormData] = useState({
    text: "",
    category: "",
    subcategory: "",
    order_index: 0,
    is_global: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")

  const isAdmin = useMemo(
    () => isAdminUser(currentUser?.id),
    [currentUser?.id]
  )

  useEffect(() => {
    if (question) {
      setFormData({
        text: question.text,
        category: question.category,
        subcategory: question.subcategory || "",
        order_index: question.order_index,
        is_global: question.is_global || false,
      })
      setShowDeleteConfirm(false)
      setDeleteConfirmText("")
    }
  }, [question])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!question || !formData.text.trim() || !formData.category.trim()) {
      return
    }

    setIsSubmitting(true)
    try {
      const updateData = {
        text: formData.text.trim(),
        category: formData.category.trim(),
        subcategory: formData.subcategory.trim() || null,
        order_index: formData.order_index,
        is_global: isAdmin ? formData.is_global : question.is_global,
      }

      await onUpdate(question.id, updateData)
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to update question:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!question || deleteConfirmText.toLowerCase() !== "delete") {
      return
    }

    setIsDeleting(true)
    try {
      await onDelete(question.id)
      setShowDeleteConfirm(false)
      setDeleteConfirmText("")
      if (onClose) {
        onClose()
      }
    } catch (error) {
      console.error("Failed to delete question:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  if (!question) {
    return null
  }

  return (
    <Dialog
      open={!!question}
      onOpenChange={(open) => {
        if (!open && onClose) {
          onClose()
        }
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(event) => {
          if (isSubmitting || isDeleting) {
            event.preventDefault()
          }
        }}
        onEscapeKeyDown={(event) => {
          if (isSubmitting || isDeleting) {
            event.preventDefault()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>Edit Question</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-question-text">Question Text</Label>
            <Textarea
              id="edit-question-text"
              placeholder="Enter your question... Use {ticker} for ticker placeholder"
              value={formData.text}
              onChange={(event) =>
                setFormData((prev) => ({ ...prev, text: event.target.value }))
              }
              required
              className="min-h-[80px]"
              disabled={isSubmitting || isDeleting}
            />
            <p className="text-xs text-muted-foreground">
              Tip: Use{" "}
              <code className="rounded bg-muted px-1">{`{ticker}`}</code> as a
              placeholder for ticker symbols
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-question-category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value: string) =>
                  setFormData((prev) => ({ ...prev, category: value }))
                }
                disabled={isSubmitting || isDeleting}
              >
                <SelectTrigger id="edit-question-category">
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
              <Label htmlFor="edit-question-subcategory">Subcategory</Label>
              <Input
                id="edit-question-subcategory"
                placeholder="Optional"
                value={formData.subcategory}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    subcategory: event.target.value,
                  }))
                }
                disabled={isSubmitting || isDeleting}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-question-order">Order Index</Label>
              <Input
                id="edit-question-order"
                type="number"
                min={0}
                value={formData.order_index}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    order_index: Number(event.target.value),
                  }))
                }
                disabled={isSubmitting || isDeleting}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center justify-between">
                <span>Make Global</span>
                <Switch
                  checked={formData.is_global && isAdmin}
                  disabled={!isAdmin || isSubmitting || isDeleting}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_global: checked }))
                  }
                />
              </Label>
              {!isAdmin && (
                <p className="text-xs text-muted-foreground">
                  Only admins can change global status.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onClose?.()}
              disabled={isSubmitting || isDeleting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || isDeleting}>
              {isSubmitting ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>

        <Separator />

        <div className="space-y-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive">
            <AlertTriangle className="size-4" />
            Danger Zone
          </div>
          {showDeleteConfirm ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Type <span className="font-semibold text-destructive">delete</span> to confirm.
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(event) => setDeleteConfirmText(event.target.value)}
                placeholder="Type delete to confirm"
                disabled={isDeleting || isSubmitting}
              />
              <div className="flex items-center gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting || isSubmitting}
                >
                  {isDeleting ? "Deleting…" : "Confirm delete"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteConfirmText("")
                  }}
                  disabled={isDeleting || isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting || isSubmitting}
              className="flex items-center gap-2"
            >
              <Trash2 className="size-4" />
              Delete question
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

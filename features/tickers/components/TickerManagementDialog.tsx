"use client"

import { useEffect, useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTickerManagement } from "@/features/tickers/hooks/useTickerManagement"
import { tickerCache } from "@/features/tickers/lib/tickers-api"
import type { Ticker } from "@/features/tickers/types/tickers.types"

type CurrentUser = {
  id: string
  email?: string | null
} | null

interface TickerManagementDialogProps {
  isOpen: boolean
  onClose: () => void
  currentUser: CurrentUser
  onTickerMutated?: () => void
}

export function TickerManagementDialog({
  isOpen,
  onClose,
  currentUser,
  onTickerMutated,
}: TickerManagementDialogProps) {
  const userId = currentUser?.id
  const [editingTicker, setEditingTicker] = useState<Ticker | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    ticker: "",
    name: "",
    description: "",
  })
  const [saving, setSaving] = useState(false)

  const isAdmin = Boolean(
    currentUser?.email && currentUser.email.toLowerCase().includes("admin")
  )

  const {
    userTickers,
    loading,
    fetchUserTickers,
    createTicker,
    updateTicker,
    deleteTicker,
  } = useTickerManagement(userId)

  useEffect(() => {
    if (isOpen && userId) {
      void fetchUserTickers()
    }
  }, [fetchUserTickers, isOpen, userId])

  useEffect(() => {
    if (!isOpen) {
      resetForm()
      setShowDeleteConfirm(null)
      setDeleteConfirmText("")
    }
  }, [isOpen])

  if (!userId) {
    return null
  }

  const resetForm = () => {
    setFormData({ ticker: "", name: "", description: "" })
    setEditingTicker(null)
    setShowForm(false)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!userId) return

    try {
      setSaving(true)
      const tickerPayload = {
        ticker: formData.ticker.toUpperCase(),
        name: formData.name || null,
        description: formData.description || null,
        is_public: isAdmin ? false : false,
      }

      if (editingTicker) {
        await updateTicker(editingTicker.id, tickerPayload)
        toast.success("Ticker updated successfully")
      } else {
        await createTicker(tickerPayload)
        toast.success("Ticker created successfully")
      }

      tickerCache.invalidate()
      resetForm()
      onTickerMutated?.()
    } catch (error: unknown) {
      console.error("Error saving ticker:", error)
      const errorCode =
        typeof error === "object" && error !== null && "code" in error
          ? (error as { code?: string }).code
          : undefined

      if (errorCode === "23505") {
        toast.error("Ticker already exists")
      } else {
        toast.error("Failed to save ticker")
      }
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (ticker: Ticker) => {
    if (deleteConfirmText !== "delete") {
      toast.error("Please type 'delete' to confirm")
      return
    }

    try {
      setSaving(true)
      await deleteTicker(ticker.id)
      toast.success("Ticker deleted successfully")
      tickerCache.invalidate()
      setShowDeleteConfirm(null)
      setDeleteConfirmText("")
      onTickerMutated?.()
    } catch (error) {
      console.error("Error deleting ticker:", error)
      toast.error("Failed to delete ticker")
    } finally {
      setSaving(false)
    }
  }

  const canDelete = (ticker: Ticker) => !ticker.is_public

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[80vh] max-w-2xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Manage Your Tickers</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 overflow-y-auto p-4">
            {!showForm && (
              <Button onClick={() => setShowForm(true)} className="w-fit" size="sm">
                <Plus className="mr-2 size-4" />
                Add ticker
              </Button>
            )}

            {showForm && (
              <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">
                    {editingTicker ? "Edit ticker" : "Add ticker"}
                  </h3>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticker-symbol">Symbol</Label>
                  <Input
                    id="ticker-symbol"
                    value={formData.ticker}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, ticker: event.target.value }))
                    }
                    placeholder="e.g. AAPL"
                    maxLength={8}
                    required
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticker-name">Display name</Label>
                  <Input
                    id="ticker-name"
                    value={formData.name}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, name: event.target.value }))
                    }
                    placeholder="e.g. Apple Inc."
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ticker-description">Description</Label>
                  <Textarea
                    id="ticker-description"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Optional notes"
                    rows={3}
                    disabled={saving}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={saving}
                  >
                    Discard
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : editingTicker ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Your tickers</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    tickerCache.invalidate()
                    void fetchUserTickers()
                  }}
                  disabled={loading}
                >
                  Refresh
                </Button>
              </div>

              {loading ? (
                <p className="text-sm text-muted-foreground">Loading tickers…</p>
              ) : userTickers.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  You have not created any tickers yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {userTickers.map((ticker) => (
                    <li
                      key={ticker.id}
                      className="flex items-start justify-between rounded-lg border p-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{ticker.ticker}</span>
                          {ticker.is_public && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                              Public
                            </span>
                          )}
                        </div>
                        {ticker.name && (
                          <p className="text-sm text-muted-foreground">{ticker.name}</p>
                        )}
                        {ticker.description && (
                          <p className="text-xs text-muted-foreground/80">
                            {ticker.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingTicker(ticker)
                            setFormData({
                              ticker: ticker.ticker,
                              name: ticker.name || "",
                              description: ticker.description || "",
                            })
                            setShowForm(true)
                          }}
                          disabled={saving}
                        >
                          <Edit className="size-4" />
                        </Button>
                        {canDelete(ticker) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setShowDeleteConfirm(ticker.id)
                              setDeleteConfirmText("")
                            }}
                            disabled={saving}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      {showDeleteConfirm === ticker.id && (
                        <div className="col-span-2 mt-3 w-full space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3">
                          <p className="text-sm text-muted-foreground">
                            Type{" "}
                            <span className="font-semibold text-destructive">delete</span>{" "}
                            to confirm removal of {ticker.ticker}.
                          </p>
                          <Input
                            value={deleteConfirmText}
                            onChange={(event) => setDeleteConfirmText(event.target.value)}
                            placeholder="Type delete to confirm"
                            disabled={saving}
                          />
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(ticker)}
                              disabled={saving}
                            >
                              Delete ticker
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowDeleteConfirm(null)
                                setDeleteConfirmText("")
                              }}
                              disabled={saving}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

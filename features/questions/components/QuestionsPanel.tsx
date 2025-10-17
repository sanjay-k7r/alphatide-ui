"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Plus,
  Search,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useQuestions } from "@/features/questions/hooks/useQuestions";
import { useTickers } from "@/features/tickers/hooks/useTickers";
import { TickerSelect } from "@/features/tickers/components/TickerSelect";
import { AddQuestionDialog } from "@/features/questions/components/AddQuestionDialog";
import { EditQuestionDialog } from "@/features/questions/components/EditQuestionDialog";
import { TickerManagementDialog } from "@/features/tickers/components/TickerManagementDialog";
import type {
  Question,
  QuestionsByCategory,
} from "@/features/questions/types/questions.types";
import { getCategoryPriority } from "@/features/questions/types/questions.types";
import { isAdminUser } from "@/features/questions/utils/admin";
import type { Ticker } from "@/features/tickers/types/tickers.types";

type CurrentUser = {
  id: string;
  email?: string | null;
} | null;

interface QuestionsPanelProps {
  currentUser: CurrentUser;
  onQuestionInsert: (text: string) => void;
  className?: string;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

type FilteredQuestions = QuestionsByCategory;

const CATEGORY_ITEM_CLASSES =
  "border border-transparent bg-transparent text-foreground hover:border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function getCategoryColors(_category: string) {
  return CATEGORY_ITEM_CLASSES;
}

const SUBCATEGORY_CLASSES = "border-border text-foreground/70";

function getSubcategoryColors(_category: string) {
  return SUBCATEGORY_CLASSES;
}

export function QuestionsPanel({
  currentUser,
  onQuestionInsert,
  className,
  isMobileOpen,
  onMobileOpenChange,
}: QuestionsPanelProps) {
  const userId = currentUser?.id;
  const isAdmin = isAdminUser(userId);
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const {
    questionsByCategory,
    loading: questionsLoading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuestions(userId);

  const {
    tickers,
    loading: tickersLoading,
    error: tickersError,
    refresh: refreshTickers,
  } = useTickers();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicker, setSelectedTicker] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [tickerPopoverQuestionId, setTickerPopoverQuestionId] = useState<
    string | null
  >(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [showTickerManager, setShowTickerManager] = useState(false);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const mobileOpen =
    typeof isMobileOpen === "boolean" ? isMobileOpen : internalMobileOpen;
  const handleMobileOpenChange = useCallback(
    (open: boolean) => {
      if (onMobileOpenChange) {
        onMobileOpenChange(open);
      } else {
        setInternalMobileOpen(open);
      }
    },
    [onMobileOpenChange]
  );
  const dragStartRef = useRef<number | null>(null);
  const pointerIdRef = useRef<number | null>(null);
  const dragOffsetRef = useRef(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const setDragOffsetSafe = useCallback((value: number) => {
    dragOffsetRef.current = value;
    setDragOffset(value);
  }, []);

  useEffect(() => {
    if (selectedTicker) {
      setTickerPopoverQuestionId(null);
    }
  }, [selectedTicker]);

  useEffect(() => {
    if (isDesktop && mobileOpen) {
      handleMobileOpenChange(false);
    }
  }, [handleMobileOpenChange, isDesktop, mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) {
      if (dragOffsetRef.current !== 0) {
        setDragOffsetSafe(0);
      }
      if (isDragging) {
        setIsDragging(false);
      }
      pointerIdRef.current = null;
      dragStartRef.current = null;
      setTickerPopoverQuestionId(null);
    }
  }, [isDragging, mobileOpen, setDragOffsetSafe]);

  const categories = useMemo(() => {
    return Object.keys(questionsByCategory).sort(
      (a, b) => getCategoryPriority(a) - getCategoryPriority(b)
    );
  }, [questionsByCategory]);

  useEffect(() => {
    if (categories.length > 0) {
      const traderZone = categories.find(
        (category) => category.toLowerCase() === "traderzone"
      );
      if (traderZone) {
        setExpandedCategories(new Set([traderZone]));
      }
    }
  }, [categories.join(",")]);

  const filteredQuestions = useMemo((): FilteredQuestions => {
    if (!searchQuery) {
      return questionsByCategory;
    }

    const filtered: FilteredQuestions = {};
    const lowerSearchQuery = searchQuery.toLowerCase();

    Object.entries(questionsByCategory).forEach(([category, subcategories]) => {
      const filteredSubcategories: Record<string, Question[]> = {};

      Object.entries(subcategories).forEach(([subcategory, questions]) => {
        const matches = questions.filter((question) => {
          const haystacks = [
            question.text,
            question.category,
            question.subcategory ?? "",
          ];
          return haystacks.some((value) =>
            value.toLowerCase().includes(lowerSearchQuery)
          );
        });

        if (matches.length > 0) {
          filteredSubcategories[subcategory] = matches;
        }
      });

      if (Object.keys(filteredSubcategories).length > 0) {
        filtered[category] = filteredSubcategories;
      }
    });

    return filtered;
  }, [questionsByCategory, searchQuery]);

  const toggleCategory = (category: string) => {
    setExpandedCategories((current) => {
      const next = new Set(current);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const finishDrag = useCallback(
    (shouldClose: boolean) => {
      setIsDragging(false);
      pointerIdRef.current = null;
      dragStartRef.current = null;
      if (shouldClose) {
        handleMobileOpenChange(false);
      } else {
        setDragOffsetSafe(0);
      }
    },
    [handleMobileOpenChange, setDragOffsetSafe]
  );

  const handleDragStart = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }
      pointerIdRef.current = event.pointerId;
      dragStartRef.current = event.clientY;
      setIsDragging(true);
      setDragOffsetSafe(0);
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    [setDragOffsetSafe]
  );

  const handleDragMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.preventDefault();
      const startY = dragStartRef.current ?? event.clientY;
      const delta = event.clientY - startY;
      if (delta <= 0) {
        setDragOffsetSafe(0);
        return;
      }
      const clampedDelta = Math.min(delta, 320);
      setDragOffsetSafe(clampedDelta);
    },
    [isDragging, setDragOffsetSafe]
  );

  const handleDragEnd = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (pointerIdRef.current !== event.pointerId) {
        return;
      }
      event.currentTarget.releasePointerCapture(event.pointerId);
      const shouldClose = dragOffsetRef.current > 120;
      finishDrag(shouldClose);
    },
    [finishDrag]
  );

  const handleDragCancel = useCallback(
    (event?: React.PointerEvent<HTMLDivElement>) => {
      if (
        event &&
        pointerIdRef.current !== null &&
        event.currentTarget.hasPointerCapture(pointerIdRef.current)
      ) {
        event.currentTarget.releasePointerCapture(pointerIdRef.current);
      }
    finishDrag(false);
    },
    [finishDrag]
  );

  const replaceTicker = useCallback(
    (text: string) => {
      return selectedTicker
        ? text.replace(/\{ticker\}/g, selectedTicker)
        : text;
    },
    [selectedTicker]
  );

  const renderHighlightedText = useCallback(
    (text: string) => {
      if (!text.includes("{ticker}")) {
        return text;
      }

      if (selectedTicker) {
        return replaceTicker(text);
      }

      const parts = text.split(/(\{ticker\})/g);
      return parts.map((part, index) => {
        if (part === "{ticker}") {
          return (
            <span
              key={index}
              className="rounded bg-muted px-1 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {part}
            </span>
          );
        }
        return part;
      });
    },
    [replaceTicker, selectedTicker]
  );

  const handleQuestionSelect = useCallback(
    (question: Question) => {
      const requiresTicker = question.text.includes("{ticker}");
      if (requiresTicker && !selectedTicker) {
        setTickerPopoverQuestionId(question.id);
        return;
      }

      setTickerPopoverQuestionId(null);
      const processedText = replaceTicker(question.text);
      onQuestionInsert(processedText);
      if (!isDesktop) {
        handleMobileOpenChange(false);
      }
    },
    [handleMobileOpenChange, isDesktop, onQuestionInsert, replaceTicker, selectedTicker]
  );

  const handleQuestionCreated = async (input: {
    text: string;
    category: string;
    subcategory: string | null;
    order_index: number;
    is_global?: boolean;
  }) => {
    await createQuestion(input);
  };

  const handleQuestionUpdated = async (
    id: string,
    updates: Partial<
      Omit<Question, "id" | "user_id" | "created_at" | "updated_at">
    >
  ) => {
    await updateQuestion(id, updates);
    setEditingQuestion(null);
  };

  const handleQuestionDeleted = async (id: string) => {
    await deleteQuestion(id);
    setEditingQuestion(null);
  };

  const canEditQuestion = useCallback(
    (question: Question) => {
      if (isAdmin) {
        return true;
      }
      if (!userId) {
        return false;
      }
      return question.user_id === userId;
    },
    [isAdmin, userId]
  );

  const desktopPanel = (
    <div
      className={cn(
        "flex h-[90vh] w-[360px] flex-col overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar shadow-sm transition-colors",
        className
      )}
    >
      <QuestionsPanelContent
        isMobile={false}
        loading={questionsLoading}
        filteredQuestions={filteredQuestions}
        categories={categories}
        expandedCategories={expandedCategories}
        onToggleCategory={toggleCategory}
        renderHighlightedText={renderHighlightedText}
        onQuestionSelect={handleQuestionSelect}
        tickerPopoverQuestionId={tickerPopoverQuestionId}
        setTickerPopoverQuestionId={setTickerPopoverQuestionId}
        selectedTicker={selectedTicker}
        setSelectedTicker={setSelectedTicker}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onAddQuestion={() => setShowAddDialog(true)}
        onManageTickers={() => setShowTickerManager(true)}
        canEditQuestion={canEditQuestion}
        onEditQuestion={setEditingQuestion}
        tickersProps={{
          tickers,
          loading: tickersLoading,
          error: tickersError,
          refresh: refreshTickers,
        }}
        isAdmin={isAdmin}
        userId={userId}
      />
    </div>
  );

  const sheetStyle =
    isDragging && dragOffset > 0
      ? {
          transform: `translateY(${dragOffset}px)`,
        }
      : undefined;

  const sheetClassName = cn(
    "flex h-[85vh] flex-col rounded-t-3xl border-t border-sidebar-border bg-sidebar p-0 shadow-lg transition-transform duration-300",
    isDragging && "transition-none"
  );

  return (
    <>
      {isDesktop ? (
        desktopPanel
      ) : (
        <Sheet open={mobileOpen} onOpenChange={handleMobileOpenChange}>
          <SheetContent
            side="bottom"
            className={sheetClassName}
            style={sheetStyle}
            onInteractOutside={(event) => {
              const target = event.target as Element;
              if (
                target?.closest("[data-radix-popper-content-wrapper]") ||
                target?.closest("[data-radix-select-content]") ||
                target?.closest("[cmdk-root]")
              ) {
                event.preventDefault();
              }
            }}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Questions panel</SheetTitle>
            </SheetHeader>
            <div
              className="mx-auto mt-3 mb-2 h-1.5 w-12 rounded-full bg-muted-foreground/40"
              style={{ touchAction: "none" }}
              onPointerDown={handleDragStart}
              onPointerMove={handleDragMove}
              onPointerUp={handleDragEnd}
              onPointerCancel={handleDragCancel}
            />
            <QuestionsPanelContent
              isMobile
              loading={questionsLoading}
              filteredQuestions={filteredQuestions}
              categories={categories}
              expandedCategories={expandedCategories}
              onToggleCategory={toggleCategory}
              renderHighlightedText={renderHighlightedText}
              onQuestionSelect={handleQuestionSelect}
              tickerPopoverQuestionId={tickerPopoverQuestionId}
              setTickerPopoverQuestionId={setTickerPopoverQuestionId}
              selectedTicker={selectedTicker}
              setSelectedTicker={setSelectedTicker}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onAddQuestion={() => setShowAddDialog(true)}
              onManageTickers={() => setShowTickerManager(true)}
              canEditQuestion={canEditQuestion}
              onEditQuestion={setEditingQuestion}
              tickersProps={{
                tickers,
                loading: tickersLoading,
                error: tickersError,
                refresh: refreshTickers,
              }}
              isAdmin={isAdmin}
              userId={userId}
            />
          </SheetContent>
        </Sheet>
      )}

      <AddQuestionDialog
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onAdd={handleQuestionCreated}
        currentUser={currentUser}
      />
      <EditQuestionDialog
        question={editingQuestion}
        onUpdate={handleQuestionUpdated}
        onDelete={handleQuestionDeleted}
        onClose={() => setEditingQuestion(null)}
        currentUser={currentUser}
      />
      <TickerManagementDialog
        isOpen={showTickerManager}
        onClose={() => setShowTickerManager(false)}
        currentUser={currentUser}
        onTickerMutated={() => refreshTickers()}
      />
    </>
  );
}

interface QuestionsPanelContentProps {
  isMobile: boolean;
  loading: boolean;
  filteredQuestions: FilteredQuestions;
  categories: string[];
  expandedCategories: Set<string>;
  onToggleCategory: (category: string) => void;
  renderHighlightedText: (text: string) => ReactNode;
  onQuestionSelect: (question: Question) => void;
  tickerPopoverQuestionId: string | null;
  setTickerPopoverQuestionId: (questionId: string | null) => void;
  selectedTicker: string;
  setSelectedTicker: (ticker: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onAddQuestion: () => void;
  onManageTickers: () => void;
  canEditQuestion: (question: Question) => boolean;
  onEditQuestion: (question: Question) => void;
  tickersProps: {
    tickers: Ticker[];
    loading: boolean;
    error: Error | null;
    refresh: () => void;
  };
  isAdmin: boolean;
  userId?: string;
}

function QuestionsPanelContent({
  isMobile,
  loading,
  filteredQuestions,
  categories,
  expandedCategories,
  onToggleCategory,
  renderHighlightedText,
  onQuestionSelect,
  tickerPopoverQuestionId,
  setTickerPopoverQuestionId,
  selectedTicker,
  setSelectedTicker,
  searchQuery,
  setSearchQuery,
  onAddQuestion,
  onManageTickers,
  canEditQuestion,
  onEditQuestion,
  tickersProps,
  isAdmin,
  userId,
}: QuestionsPanelContentProps) {
  return (
    <div
      className={cn(
        "flex h-full flex-col",
        isMobile ? "px-4 pb-4" : "p-4"
      )}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-sidebar-foreground">
            Questions
          </h2>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onManageTickers}
              title="Manage tickers"
            >
              <Settings2 className="size-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={onAddQuestion}
              disabled={!userId}
              title={userId ? "Add question" : "Sign in to add questions"}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <TickerSelect
            value={selectedTicker}
            onValueChange={setSelectedTicker}
            tickers={tickersProps.tickers}
            loading={tickersProps.loading}
            error={tickersProps.error}
            onRefresh={tickersProps.refresh}
            placeholder="Select a ticker to personalise prompts…"
          />
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search questions…"
            className="h-10 rounded-lg border border-sidebar-border bg-background pl-10 text-sm"
            aria-label="Search questions"
          />
        </div>
      </div>

      <div className="mt-4 flex-1 overflow-y-auto pb-6">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading questions…
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-lg border border-dashed border-sidebar-border p-6 text-center text-sm text-muted-foreground">
            No questions available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {categories
              .filter((category) => {
                if (category.toLowerCase() === "test" && !isAdmin) {
                  return false;
                }
                return Boolean(filteredQuestions[category]);
              })
              .map((category) => {
                const subcategories = filteredQuestions[category];
                if (!subcategories) {
                  return null;
                }

                return (
                  <div key={`category-${category}`} className="space-y-2">
                    <button
                      onClick={() => onToggleCategory(category)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide transition-colors",
                        getCategoryColors(category)
                      )}
                    >
                      {expandedCategories.has(category) ? (
                        <ChevronDown className="size-3" />
                      ) : (
                        <ChevronRight className="size-3" />
                      )}
                      <span>{category}</span>
                    </button>

                    {expandedCategories.has(category) && (
                      <div className="space-y-2 pl-4">
                        {Object.entries(subcategories).map(
                          ([subcategory, questions]) => {
                            const displaySubcategory =
                              questions[0]?.subcategory || subcategory;
                            return (
                              <div
                                key={`${category}-${subcategory}`}
                                className="space-y-1"
                              >
                                {subcategory !== "default" &&
                                  subcategory !== "General" && (
                                    <div
                                      className={cn(
                                        "ml-1 border-l-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide",
                                        getSubcategoryColors(category)
                                      )}
                                    >
                                      {displaySubcategory}
                                    </div>
                                  )}
                                <div className="space-y-1.5">
                                  {questions.map((question) => (
                                    <div
                                      key={question.id}
                                      className="group flex items-start gap-2 rounded-md border border-transparent px-2 py-2 transition-colors hover:border-sidebar-border hover:bg-sidebar-accent/50"
                                    >
                                      <Popover
                                        open={
                                          tickerPopoverQuestionId ===
                                            question.id && !selectedTicker
                                        }
                                        onOpenChange={(open) => {
                                          setTickerPopoverQuestionId(
                                            open ? question.id : null
                                          );
                                        }}
                                      >
                                        <PopoverTrigger asChild>
                                          <button
                                            onClick={() =>
                                              onQuestionSelect(question)
                                            }
                                            className="flex-1 text-left text-sm leading-snug text-sidebar-foreground hover:text-sidebar-primary"
                                          >
                                            {renderHighlightedText(
                                              question.text
                                            )}
                                          </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-72 p-4 text-sm">
                                          <p className="font-medium">
                                            Select a ticker first
                                          </p>
                                          <p className="mt-2 text-xs text-muted-foreground">
                                            Pick a ticker so we can personalise
                                            this prompt automatically.
                                          </p>
                                          <div className="mt-3">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              onClick={() =>
                                                setTickerPopoverQuestionId(null)
                                              }
                                            >
                                              Got it
                                            </Button>
                                          </div>
                                        </PopoverContent>
                                      </Popover>
                                      {canEditQuestion(question) && (
                                        <Button
                                          size="icon"
                                          variant="ghost"
                                          className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
                                          onClick={() =>
                                            onEditQuestion(question)
                                          }
                                        >
                                          <Edit2 className="size-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}

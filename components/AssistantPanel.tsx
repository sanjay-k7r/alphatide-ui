"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  History,
  Plus,
  ChevronDown,
  MessageCircle,
  Waves,
  ArrowUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ColorScheme } from "@/hooks/useColorScheme";
import { AssistantHistory } from "@/components/AssistantHistory";
import { QuestionsPanel } from "@/features/questions/components/QuestionsPanel";
import { useAuth } from "@/providers/auth-provider";
import { MarkdownMessage } from "@/components/MarkdownMessage";
import { CopyButton } from "@/components/CopyButton";
import type {
  UserAssistantSession,
  AssistantChatHistory as ChatMessage,
} from "@/lib/types/assistant-session";
import {
  DEFAULT_ASSISTANT_MODEL,
  ASSISTANT_MODEL_OPTIONS,
  ASSISTANT_MODEL_LABELS,
  type AssistantModel,
} from "@/lib/config/assistant-models";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

type AssistantPanelProps = {
  theme: ColorScheme;
  className?: string;
};

export function AssistantPanel({ theme, className }: AssistantPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AssistantModel>(
    DEFAULT_ASSISTANT_MODEL
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  // Create a new session when starting a new chat
  const createNewSession = async (firstMessage: string) => {
    try {
      console.log("[Assistant] Creating new session...");
      const response = await fetch("/api/assistant-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title:
            firstMessage.slice(0, 50) + (firstMessage.length > 50 ? "..." : ""),
          model: selectedModel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("[Assistant] Session created:", data.session.session_id);
        setCurrentSessionId(data.session.session_id);
        return data.session.session_id;
      } else {
        console.error("[Assistant] Failed to create session:", response.status);
        return null;
      }
    } catch (error) {
      console.error("[Assistant] Error creating session:", error);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Create assistant message placeholder
    const assistantMessageId = `msg-${Date.now()}-assistant`;
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Create session if this is the first message
      let sessionId = currentSessionId;
      if (!sessionId) {
        sessionId = await createNewSession(userMessage.content);
        if (!sessionId) {
          throw new Error("Failed to create session");
        }
      }

      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          model: selectedModel,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response body");
      }

      let accumulatedContent = "";

      console.log("[Assistant] Starting to read stream...");

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log("[Assistant] Stream complete");
          // Mark streaming as complete
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessageId
                ? { ...msg, isStreaming: false }
                : msg
            )
          );
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulatedContent += data.content;

                // Update the assistant message with streaming content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? {
                          ...msg,
                          content: accumulatedContent,
                          isStreaming: true,
                        }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.warn("[Assistant] Failed to parse SSE data:", line);
            }
          }
        }
      }
    } catch (error) {
      console.error("Assistant chat error:", error);

      // Update assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content:
                  error instanceof Error
                    ? `Error: ${error.message}`
                    : "Sorry, I encountered an error. Please try again.",
                isStreaming: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  const handleSessionSelect = async (session: UserAssistantSession) => {
    console.log("[Assistant] Loading session:", session.session_id);

    try {
      // Fetch the full chat history for this session
      const response = await fetch(
        `/api/assistant-sessions/${session.session_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to load session");
      }

      const data = await response.json();
      const chatMessages: ChatMessage[] = data.messages || [];

      // Convert to Message format
      // Workflow stores messages as JSONB: { type: 'human'|'ai', content: '...' }
      const loadedMessages: Message[] = chatMessages.map((msg) => ({
        id: String(msg.id),
        role: msg.message.type === "human" ? "user" : "assistant",
        content: msg.message.content,
        timestamp: new Date(),
      }));

      setMessages(loadedMessages);
      setCurrentSessionId(session.session_id);
      setSelectedModel(
        (session.model as AssistantModel) || DEFAULT_ASSISTANT_MODEL
      );

      console.log(
        "[Assistant] Session loaded with",
        loadedMessages.length,
        "messages"
      );
    } catch (error) {
      console.error("[Assistant] Error loading session:", error);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
    setSelectedModel(DEFAULT_ASSISTANT_MODEL);
  };

  const handleQuestionInsert = (text: string) => {
    setInput(text);
    setIsQuestionsOpen(false);
    // Focus the textarea
    textareaRef.current?.focus();
  };

  return (
    <>
      <div
        className={cn(
          "flex h-[90vh] w-full flex-col overflow-hidden rounded-2xl border bg-background",
          className
        )}
      >
        {/* Minimalist Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-8 w-8 rounded-lg"
              title="New chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
              className="h-8 w-8 rounded-lg"
              title="Chat history"
            >
              <History className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsQuestionsOpen(true)}
              className="h-8 w-8 rounded-lg"
              title="Question bank"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center max-w-md space-y-2">
                <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted mb-2">
                  <Waves className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-md text-muted-foreground">Alphatide</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{
                      duration: 0.2,
                      ease: "easeOut",
                    }}
                    className={cn(
                      "flex flex-col gap-1",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-2.5",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50"
                      )}
                    >
                      {message.role === "user" ? (
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                      ) : (
                        <MarkdownMessage
                          content={message.content}
                          isStreaming={message.isStreaming}
                        />
                      )}
                    </div>

                    {/* Timestamp and Copy Button (only for assistant messages) */}
                    {message.role === "assistant" && !message.isStreaming && (
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] text-muted-foreground/60">
                          {(() => {
                            const now = new Date();
                            const msgDate = message.timestamp;
                            const isToday = now.toDateString() === msgDate.toDateString();
                            const isYesterday =
                              new Date(now.getTime() - 86400000).toDateString() === msgDate.toDateString();

                            const time = msgDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            });

                            if (isToday) {
                              return time;
                            } else if (isYesterday) {
                              return `Yesterday ${time}`;
                            } else {
                              const date = msgDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              });
                              return `${date} ${time}`;
                            }
                          })()}
                        </span>
                        <CopyButton content={message.content} />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t bg-background px-4 py-4">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="What do you want to know?"
                disabled={isLoading}
                className={cn(
                  "min-h-[52px] max-h-[200px] resize-none rounded-2xl border bg-muted/30 pr-12 pl-4 py-3.5 text-sm",
                  "focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50",
                  "placeholder:text-muted-foreground/60"
                )}
                rows={1}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isLoading}
                size="icon"
                className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 rounded-full"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <ArrowUp className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Model Selector Footer */}
            <div className="mt-2 flex items-center justify-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs",
                      "text-muted-foreground hover:text-foreground",
                      "transition-colors duration-150",
                      "hover:bg-muted/50",
                      "focus:outline-none focus:ring-1 focus:ring-primary/20"
                    )}
                  >
                    {/* <Sparkles className="h-3 w-3" /> */}
                    <span>{ASSISTANT_MODEL_LABELS[selectedModel]}</span>
                    <ChevronDown className="h-3 w-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-40">
                  {ASSISTANT_MODEL_OPTIONS.map((option) => (
                    <DropdownMenuItem
                      key={option.value}
                      onClick={() => setSelectedModel(option.value)}
                      className={cn(
                        "cursor-pointer text-sm",
                        selectedModel === option.value && "bg-accent"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {/* <Sparkles className="h-3.5 w-3.5" /> */}
                        <span>{option.label}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Chat History Sidebar */}
      <AssistantHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSessionSelect={handleSessionSelect}
        currentSessionId={currentSessionId || undefined}
      />

      {/* Questions Sidebar */}
      <QuestionsPanel
        currentUser={user}
        onQuestionInsert={handleQuestionInsert}
        isMobileOpen={isQuestionsOpen}
        onMobileOpenChange={setIsQuestionsOpen}
        forceSheetMode={true}
      />
    </>
  );
}

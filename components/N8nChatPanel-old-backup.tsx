"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Bot, User, History, Plus, ChevronDown, Sparkles } from "lucide-react";
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
import { N8nChatHistory } from "@/components/N8nChatHistory";
import type { Thread } from "@/lib/types/thread";
import {
  DEFAULT_N8N_MODEL,
  N8N_MODEL_OPTIONS,
  N8N_MODEL_LABELS,
  type N8nModel,
} from "@/lib/config/n8n-models";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
};

type N8nChatPanelProps = {
  theme: ColorScheme;
  className?: string;
};

export function N8nChatPanel({ theme, className }: N8nChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  // Removed: const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<N8nModel>(DEFAULT_N8N_MODEL);
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
      abortControllerRef.current = new AbortController();

      const response = await fetch("/api/n8n-chat", {
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
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('No response body');
      }

      let accumulatedContent = '';

      console.log('[N8N Chat] Starting to read stream...');

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          console.log('[N8N Chat] Stream complete');
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
        console.log('[N8N Chat] Received chunk:', chunk.length, 'bytes at', new Date().toISOString());
        console.log('[N8N Chat] Chunk content:', chunk);

        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('[N8N Chat] Parsed data:', data);
              if (data.content) {
                accumulatedContent += data.content;
                console.log('[N8N Chat] Accumulated content so far:', accumulatedContent);

                // Update the assistant message with streaming content
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedContent, isStreaming: true }
                      : msg
                  )
                );
              }
            } catch (e) {
              console.warn('[N8N Chat] Failed to parse SSE data:', line);
            }
          }
        }
      }

    } catch (error) {
      console.error("N8N chat error:", error);

      // Update assistant message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? {
                ...msg,
                content: error instanceof Error
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

  // REMOVED: Old thread-saving logic (migrated to session-based approach)
  // Session management will be handled in the new N8nChatPanel-new.tsx

  const handleThreadSelect = (thread: any) => {
    // Temporarily disabled - use new session-based component instead
    console.log('[N8N Chat] Thread selection disabled in old component');
  };

  const handleNewChat = () => {
    setMessages([]);
  };

  return (
    <>
      <div
        className={cn(
          "flex h-[90vh] w-full flex-col overflow-hidden rounded-2xl border bg-background",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">N8N Assistant</h2>
              <p className="text-xs text-muted-foreground">Powered by n8n workflow</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="h-9 w-9 rounded-full"
              title="New chat"
            >
              <Plus className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsHistoryOpen(true)}
              className="h-9 w-9 rounded-full"
              title="View chat history"
            >
              <History className="h-5 w-5" />
            </Button>
          </div>
        </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to N8N Chat</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              Start a conversation with the N8N workflow assistant. Ask questions or send messages to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{
                    duration: 0.3,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  )}

                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-3",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <div className="whitespace-pre-wrap text-sm">
                      {message.content}
                      {message.isStreaming && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.8,
                            ease: "easeInOut",
                          }}
                          className="ml-1 inline-block h-4 w-1 bg-current"
                        />
                      )}
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                      <User className="h-4 w-4 text-primary-foreground" />
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
      <div className="border-t bg-background px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            disabled={isLoading}
            className="min-h-[44px] max-h-[200px] resize-none rounded-xl border-input bg-background px-4 py-3 text-sm focus-visible:ring-1 focus-visible:ring-primary"
            rows={1}
          />
          <Button
            type="submit"
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 shrink-0 rounded-xl"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </form>

        {/* Model Selector and Footer */}
        <div className="mt-2 flex items-center justify-between">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium",
                  "text-muted-foreground hover:text-foreground",
                  "transition-colors duration-150",
                  "hover:bg-muted/50",
                  "focus:outline-none focus:ring-2 focus:ring-primary/20"
                )}
              >
                <Sparkles className="h-3 w-3" />
                <span>{N8N_MODEL_LABELS[selectedModel]}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {N8N_MODEL_OPTIONS.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setSelectedModel(option.value)}
                  className={cn(
                    "cursor-pointer",
                    selectedModel === option.value && "bg-accent"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{option.label}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <p className="text-xs text-muted-foreground">
            Powered by n8n workflow
          </p>
        </div>
      </div>
    </div>

    {/* Chat History Sidebar */}
    <N8nChatHistory
      isOpen={isHistoryOpen}
      onClose={() => setIsHistoryOpen(false)}
      onThreadSelect={handleThreadSelect}
    />
    </>
  );
}

"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface MarkdownMessageProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

/**
 * Formats the content to ensure proper spacing between status messages and streaming responses.
 * Adds line breaks before markdown headers that indicate the start of the main response.
 */
function formatContent(content: string): string {
  // If content contains a markdown header (# ), ensure there's proper spacing before it
  // This handles cases where status messages are followed immediately by the streaming response
  const headerPattern = /([^\n])(# 🎯)/g;

  // Add two newlines before headers that aren't already on a new line
  let formatted = content.replace(headerPattern, "$1\n\n$2");

  // Also handle other common separators
  const commonSeparators = [
    /([^\n])(#{1,6} [A-Z])/g, // Any header followed by capital letter
  ];

  commonSeparators.forEach(pattern => {
    formatted = formatted.replace(pattern, "$1\n\n$2");
  });

  return formatted;
}

/**
 * Checks if the content is still in the status message phase (before main response)
 * Returns true if streaming and no markdown headers are present yet
 */
function isInStatusPhase(content: string, isStreaming?: boolean): boolean {
  if (!isStreaming) return false;

  // Check if content contains any markdown headers (indicating main response has started)
  const hasHeaders = /^#{1,6}\s+/m.test(content);

  // Show spinner if no headers AND (content is empty OR has status text)
  return !hasHeaders;
}

export function MarkdownMessage({
  content,
  isStreaming,
  className,
}: MarkdownMessageProps) {
  const formattedContent = formatContent(content);
  const showStatusSpinner = isInStatusPhase(content, isStreaming);

  return (
    <div className={cn("text-[13px] leading-[1.5]", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          // Headings - compact with minimal spacing
          h1: ({ children }) => (
            <h1 className="text-base font-semibold mt-4 mb-1.5 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-[14px] font-semibold mt-2.5 mb-1 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-[13px] font-semibold mt-2 mb-0.5 first:mt-0">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-[13px] font-medium mt-1.5 mb-0.5 first:mt-0">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-[13px] font-medium mt-1.5 mb-0.5 first:mt-0">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-[13px] font-medium mt-1.5 mb-0.5 first:mt-0">
              {children}
            </h6>
          ),

          // Paragraphs - tight spacing
          p: ({ children }) => (
            <p className="mb-2 last:mb-0 leading-[1.5]">{children}</p>
          ),

          // Lists - compact with minimal indentation
          ul: ({ children }) => (
            <ul className="my-1.5 ml-4 space-y-0.5 list-disc marker:text-muted-foreground/60">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="my-1.5 ml-4 space-y-0.5 list-decimal marker:text-muted-foreground/60 marker:text-xs">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-0.5 leading-[1.5]">{children}</li>
          ),

          // Inline code - subtle background
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code
                  className="px-1 py-0.5 rounded bg-muted/60 text-[12px] font-mono border border-border/40"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // Block code handled by pre
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          // Code blocks - compact with syntax highlighting
          pre: ({ children }) => (
            <pre className="my-2 p-2.5 rounded-lg bg-muted/40 border border-border/50 overflow-x-auto text-[12px] leading-[1.4] font-mono">
              {children}
            </pre>
          ),

          // Blockquotes - minimal left border
          blockquote: ({ children }) => (
            <blockquote className="my-2 pl-3 border-l-2 border-muted-foreground/30 text-muted-foreground italic">
              {children}
            </blockquote>
          ),

          // Tables - compact and clean
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-[12px]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-border">{children}</thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr className="border-b border-border/40 last:border-0">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1 text-left font-semibold">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1 leading-[1.4]">{children}</td>
          ),

          // Links - subtle underline
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 decoration-primary/30 hover:decoration-primary/60 transition-colors"
            >
              {children}
            </a>
          ),

          // Horizontal rule - subtle divider
          hr: () => <hr className="my-3 border-border/40" />,

          // Strong/Bold
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),

          // Emphasis/Italic
          em: ({ children }) => <em className="italic">{children}</em>,

          // Strikethrough
          del: ({ children }) => (
            <del className="text-muted-foreground line-through">{children}</del>
          ),
        }}
      >
        {formattedContent}
      </ReactMarkdown>

      {/* Show spinner during status messages, cursor during main response streaming */}
      {isStreaming && (
        <>
          {showStatusSpinner ? (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-1.5 inline-flex items-center align-middle"
            >
              <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
            </motion.span>
          ) : (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                repeat: Infinity,
                duration: 0.8,
                ease: "easeInOut",
              }}
              className="ml-1 inline-block h-3.5 w-0.5 bg-current align-middle"
            />
          )}
        </>
      )}
    </div>
  );
}

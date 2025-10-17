"use client";

import { useCallback, useRef } from "react";
import { toast } from "sonner";
import {
  ChatKitPanel,
  type ChatKitPanelHandle,
  type FactAction,
} from "@/components/ChatKitPanel";
import { QuestionsPanel } from "@/features/questions/components/QuestionsPanel";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useAuth } from "@/providers/auth-provider";
import { useQuestionsPanel } from "@/providers/questions-panel-provider";

export default function App() {
  const { scheme, setScheme } = useColorScheme();
  const { user } = useAuth();
  const { isMobileOpen, setMobileOpen, closeMobilePanel } = useQuestionsPanel();
  const chatkitRef = useRef<ChatKitPanelHandle | null>(null);

  const handleWidgetAction = useCallback(async (action: FactAction) => {
    if (process.env.NODE_ENV !== "production") {
      console.info("[ChatKitPanel] widget action", action);
    }
  }, []);

  const handleResponseEnd = useCallback(() => {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[ChatKitPanel] response end");
    }
  }, []);

  const handleQuestionInsert = useCallback(
    async (text: string) => {
      if (!chatkitRef.current) {
        toast.error("Chat input is not ready yet. Please try again.");
        return;
      }

      try {
        await chatkitRef.current.setComposerValue(text);
        if (isMobileOpen) {
          closeMobilePanel();
        }
      } catch (error) {
        console.error("Failed to populate composer:", error);
        toast.error("Couldn't add the question to the chat. Try again in a moment.");
      }
    },
    [closeMobilePanel, isMobileOpen]
  );

  return (
    <main className="flex min-h-screen flex-col bg-slate-100 dark:bg-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 py-6 lg:flex-row">
        <div className="flex flex-1 justify-center lg:justify-start">
          <div className="w-full lg:max-w-4xl">
            <ChatKitPanel
              ref={chatkitRef}
              theme={scheme}
              onWidgetAction={handleWidgetAction}
              onResponseEnd={handleResponseEnd}
              onThemeRequest={setScheme}
            />
          </div>
        </div>
        <div className="hidden lg:flex lg:w-[380px] lg:flex-none lg:flex-col">
          <QuestionsPanel
            currentUser={user}
            onQuestionInsert={handleQuestionInsert}
            isMobileOpen={isMobileOpen}
            onMobileOpenChange={setMobileOpen}
          />
        </div>
      </div>
    </main>
  );
}

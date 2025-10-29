"use client";

import { N8nChatPanel } from "@/components/N8nChatPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function N8nChatPage() {
  const { scheme } = useColorScheme();

  return (
    <main className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <N8nChatPanel theme={scheme} />
      </div>
    </main>
  );
}

"use client";

import { AssistantPanel } from "@/components/AssistantPanel";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function AssistantPage() {
  const { scheme } = useColorScheme();

  return (
    <main className="flex h-full w-full items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <AssistantPanel theme={scheme} />
      </div>
    </main>
  );
}

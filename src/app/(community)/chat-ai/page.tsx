// app/(community)/chat-ai/page.tsx

import type { Metadata } from "next";
import { ChatInterface } from "@/components/ai/ChatInterface";

export const metadata: Metadata = {
  title: "Assistant IA — Communauté",
  description: "Posez vos questions à notre assistant IA communautaire.",
};

/**
 * Page dédiée au chat avec l'assistant IA.
 */
export default function ChatAIPage() {
  return (
    <div
      className="h-[calc(100vh-4rem)] max-w-2xl mx-auto px-4 py-4"
      suppressHydrationWarning
    >
      <ChatInterface className="h-full" />
    </div>
  );
}

// app/(community)/chat-ai/page.tsx
"use client";

import React from "react";
import { ChatInterface } from "@/components/ai/ChatInterface";

export default function AIPage() {
  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#f6f7f0] px-0 pb-16 sm:px-3 sm:py-3 lg:pb-3">
      <div className="flex min-h-0 flex-1 overflow-hidden border-[rgba(194,201,187,0.45)] bg-white/70 shadow-sm sm:rounded-2xl sm:border">
        <ChatInterface />
      </div>
    </div>
  );
}

// app/(community)/chat-ai/page.tsx
"use client";

import React from "react";
import { ChatInterface } from "@/components/ai/ChatInterface";

export default function AIPage() {
  return (
    <div className="flex-1 flex overflow-hidden bg-[#f9faf2]">
      <div className="flex-1 flex overflow-hidden  bg-white/50 backdrop-blur-sm border border-[rgba(194,201,187,0.3)] shadow-sm">
        <ChatInterface />
      </div>
    </div>
  );
}

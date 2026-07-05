// components/ai/MessageBubble.tsx
"use client";

import type { AIMessage } from "@/types/ai.types";
import { Bot, User } from "lucide-react";

interface MessageBubbleProps {
  message: AIMessage;
}

/**
 * Bulle compacte d'affichage d'un message (user ou assistant).
 * Variante légère de ChatMessage — sans markdown ni actions,
 * pour aperçus, notifications ou widgets condensés.
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end gap-2 sm:gap-3 ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={`Message de ${isUser ? "l'utilisateur" : "l'assistant"}`}
    >
      {/* Avatar assistant */}
      {!isUser && (
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mb-1"
          style={{
            background: "linear-gradient(135deg, #31452d 0%, #1f2d1d 100%)",
            color: "#e8f5df",
          }}
        >
          <Bot size={14} className="sm:w-[16px] sm:h-[16px]" />
        </div>
      )}

      {/* Bulle */}
      <div
        className={`max-w-[85%] sm:max-w-[80%] px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-sm leading-relaxed shadow-sm transition-all ${
          isUser
            ? "bg-[#31452d] text-white rounded-br-sm"
            : "bg-white border border-[rgba(194,201,187,0.3)] text-[#191c18] rounded-bl-sm"
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {message.isStreaming && (
            <span
              className="inline-block w-0.5 h-3.5 bg-current ml-1 align-middle animate-pulse rounded-full"
              aria-hidden="true"
            />
          )}
        </p>

        <time
          dateTime={message.createdAt?.toISOString()}
          className={`block mt-1 text-[10px] font-medium ${
            isUser ? "text-white/60 text-right" : "text-[#72796e]/60"
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {message.createdAt?.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>

      {/* Avatar user */}
      {isUser && (
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mb-1"
          style={{
            background: "linear-gradient(135deg, #42493e 0%, #31452d 100%)",
            color: "#e8f5df",
          }}
        >
          <User size={14} className="sm:w-[16px] sm:h-[16px]" />
        </div>
      )}
    </div>
  );
}

"use client";

// components/ai/MessageBubble.tsx

import type { ChatMessage } from "@/types/ai";

interface MessageBubbleProps {
  message: ChatMessage;
}

/**
 * Bulle d'affichage d'un message (user ou assistant).
 * Supporte l'animation de streaming (curseur clignotant).
 */
export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}
      role="article"
      aria-label={`Message de ${isUser ? "l'utilisateur" : "l'assistant"}`}
    >
      {/* Avatar assistant */}
      {!isUser && (
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mb-1">
          <svg
            className="w-3.5 h-3.5 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
        </div>
      )}

      {/* Bulle */}
      <div
        className={`
          max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${
            isUser
              ? "bg-blue-600 text-white rounded-br-sm"
              : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm"
          }
        `}
      >
        {/* Contenu du message — préservation des sauts de ligne */}
        <p className="whitespace-pre-wrap break-words">
          {message.content}
          {/* Curseur clignotant pendant le streaming */}
          {message.isStreaming && (
            <span
              className="inline-block w-0.5 h-4 bg-current ml-0.5 align-middle animate-pulse"
              aria-hidden="true"
            />
          )}
        </p>

        {/* Timestamp */}
        <time
          dateTime={message.timestamp.toISOString()}
          className={`
            block mt-1 text-xs
            ${isUser ? "text-blue-200 text-right" : "text-gray-400 dark:text-gray-500"}
          `}
        >
          {message.timestamp.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </time>
      </div>
    </div>
  );
}

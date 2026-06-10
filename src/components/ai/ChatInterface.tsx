/* eslint-disable react/no-unescaped-entities */
"use client";

// components/ai/ChatInterface.tsx

import { useEffect, useRef, useState } from "react";
import { useAIChat } from "@/hooks/AI/useAIChat";
import { MessageBubble } from "./MessageBubble";

interface ChatInterfaceProps {
  /** Session ID existante pour reprendre une conversation */
  initialSessionId?: string;
  /** Classe CSS additionnelle pour le conteneur */
  className?: string;
}

/**
 * Interface de chat complète avec streaming SSE.
 *
 * Fonctionnalités :
 *  - Envoi de messages avec streaming token par token
 *  - Scroll automatique vers le dernier message
 *  - Indicateur de chargement
 *  - Gestion des erreurs + retry
 *  - Raccourci clavier Entrée (Shift+Entrée pour saut de ligne)
 */
export function ChatInterface({
  initialSessionId,
  className = "",
}: ChatInterfaceProps) {
  const {
    messages,
    isLoading,
    error,
    sendUserMessage,
    clearConversation,
    retryLastMessage,
  } = useAIChat({ streaming: true, initialSessionId });

  const [input, setInput] = useState("");
  const [charCount, setCharCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const MAX_CHARS = 4000;

  // Auto-scroll au dernier message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus l'input au chargement
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setInput("");
    setCharCount(0);
    await sendUserMessage(trimmed);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Entrée seul = envoyer, Shift+Entrée = saut de ligne
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`flex flex-col h-full bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden ${className}`}
    >
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            {/* Bot icon */}
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.5l1.196 4.784M5 14.5L3.804 19.284M19 21l-7-7M5 21l7-7"
              />
            </svg>
          </div>
          <div>
            <h2 className="font-semibold text-white text-sm leading-tight">
              Assistant Communauté
            </h2>
            <p className="text-xs text-blue-100 leading-tight">
              Propulsé par DeepSeek IA
            </p>
          </div>
        </div>

        <button
          onClick={clearConversation}
          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          title="Nouvelle conversation"
          aria-label="Nouvelle conversation"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
        </button>
      </div>

      {/* ── Messages ──────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        role="log"
        aria-live="polite"
        aria-label="Historique de conversation"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 text-gray-400 dark:text-gray-600">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 opacity-50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                />
              </svg>
            </div>
            <p className="font-medium text-sm">Comment puis-je vous aider ?</p>
            <p className="text-xs mt-1 max-w-xs">
              Posez vos questions sur la communauté, demandez de l'aide pour
              rédiger un post…
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Erreur avec option retry */}
        {error && (
          <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
            <div className="flex-1">
              <p>{error}</p>
              <button
                onClick={retryLastMessage}
                className="mt-1 text-xs font-medium underline underline-offset-2 hover:no-underline"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Zone de saisie ────────────────────────── */}
      <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Écrivez votre message… (Entrée pour envoyer)"
              disabled={isLoading}
              maxLength={MAX_CHARS}
              rows={1}
              className="
                w-full resize-none px-4 py-3 pr-16
                border border-gray-200 dark:border-gray-700
                rounded-xl text-sm
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-colors
                max-h-32 overflow-y-auto
              "
              style={{ height: "auto", minHeight: "48px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 128) + "px";
              }}
              aria-label="Message"
            />
            {/* Compteur de caractères */}
            {charCount > MAX_CHARS * 0.8 && (
              <span
                className={`
                absolute bottom-2 right-3 text-xs
                ${charCount >= MAX_CHARS ? "text-red-500" : "text-gray-400"}
              `}
              >
                {charCount}/{MAX_CHARS}
              </span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isLoading || !input.trim()}
            aria-label="Envoyer le message"
            className="
              w-11 h-11 rounded-xl
              bg-blue-600 hover:bg-blue-700 active:bg-blue-800
              disabled:opacity-40 disabled:cursor-not-allowed
              text-white transition-colors
              flex items-center justify-center shrink-0
            "
          >
            {isLoading ? (
              /* Spinner */
              <svg
                className="w-4 h-4 animate-spin"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              /* Send icon */
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            )}
          </button>
        </div>

        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-600 text-center">
          Shift+Entrée pour un saut de ligne
        </p>
      </div>
    </div>
  );
}

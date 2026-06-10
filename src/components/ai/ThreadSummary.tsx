"use client";

// components/ai/ThreadSummary.tsx

import { useState } from "react";
import { summarizeThread, APIError } from "@/lib/ai-client";

interface ThreadMessage {
  author: string;
  content: string;
}

interface ThreadSummaryProps {
  messages: ThreadMessage[];
  /** Classe CSS additionnelle */
  className?: string;
}

/**
 * Bouton + affichage du résumé IA d'un fil de discussion.
 */
export function ThreadSummary({
  messages,
  className = "",
}: ThreadSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (messages.length < 2) return;

    if (isOpen && summary) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await summarizeThread(messages);
      setSummary(result);
      setIsOpen(true);
    } catch (err) {
      setError(
        err instanceof APIError ? err.message : "Erreur lors du résumé.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (messages.length < 2) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <button
        type="button"
        onClick={handleSummarize}
        disabled={isLoading}
        className="
          flex items-center gap-1.5 text-xs font-medium
          text-blue-600 dark:text-blue-400
          hover:text-blue-700 disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
        aria-expanded={isOpen}
      >
        {isLoading ? (
          <>
            <svg
              className="w-3.5 h-3.5 animate-spin"
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
            Génération du résumé…
          </>
        ) : (
          <>
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
            {isOpen ? "Masquer le résumé" : "Résumer cette discussion"}
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {isOpen && summary && (
        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <svg
              className="w-3.5 h-3.5 text-blue-500"
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
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">
              Résumé IA — {messages.length} messages
            </span>
          </div>
          <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}

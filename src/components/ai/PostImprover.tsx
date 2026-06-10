/* eslint-disable react/no-unescaped-entities */
"use client";

// components/ai/PostImprover.tsx

import { useState } from "react";
import { improvePost, APIError } from "@/lib/ai-client";

interface PostImproverProps {
  content: string;
  onAccept: (improved: string) => void;
}

/**
 * Propose une version améliorée du post et permet de l'accepter ou la refuser.
 */
export function PostImprover({ content, onAccept }: PostImproverProps) {
  const [improved, setImproved] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const handleImprove = async () => {
    if (content.trim().length < 10) return;
    setIsLoading(true);
    setError(null);
    setImproved(null);

    try {
      const result = await improvePost(content);
      setImproved(result.improved);
      setIsVisible(true);
    } catch (err) {
      setError(
        err instanceof APIError
          ? err.message
          : "Erreur lors de l'amélioration.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (improved) {
      onAccept(improved);
      setImproved(null);
      setIsVisible(false);
    }
  };

  const handleDiscard = () => {
    setImproved(null);
    setIsVisible(false);
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleImprove}
        disabled={isLoading || content.trim().length < 10}
        className="
          flex items-center gap-1.5 text-xs font-medium
          text-emerald-600 dark:text-emerald-400
          hover:text-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed
          transition-colors
        "
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
            Amélioration en cours…
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"
              />
            </svg>
            Améliorer avec l'IA
          </>
        )}
      </button>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {isVisible && improved && (
        <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20">
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
              Version améliorée
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Accepter
              </button>
              <button
                type="button"
                onClick={handleDiscard}
                className="text-xs px-2.5 py-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 transition-colors"
              >
                Ignorer
              </button>
            </div>
          </div>
          <div className="px-3 py-3 bg-white dark:bg-gray-900">
            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {improved}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

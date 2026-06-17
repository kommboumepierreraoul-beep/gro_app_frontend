/* eslint-disable react/no-unescaped-entities */
// components/ai/PostImprover.tsx
"use client";

import { useState } from "react";
import { aiService } from "@/services/Ai/ai.service";

interface PostImproverProps {
  content: string;
  onAccept: (improved: string) => void;
}

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
      const result = await aiService.improveText({ content });
      setImproved(result.improved);
      setIsVisible(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erreur lors de l'amélioration.",
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

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleImprove}
        disabled={isLoading || content.trim().length < 10}
        className="flex items-center gap-1.5 text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ color: "#1f6223" }}
        onMouseEnter={(e) => {
          if (!isLoading && content.trim().length >= 10) {
            (e.currentTarget as HTMLButtonElement).style.color = "#002203";
          }
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.color = "#1f6223";
        }}
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
                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487z"
              />
            </svg>
            Améliorer avec l'IA
          </>
        )}
      </button>

      {error && (
        <p className="text-xs" style={{ color: "#ba1a1a" }}>
          {error}
        </p>
      )}

      {isVisible && improved && (
        <div
          className="rounded-xl border overflow-hidden"
          style={{ borderColor: "#91d78a" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-3 py-2"
            style={{ background: "rgba(168,244,164,0.2)" }}
          >
            <span
              className="text-xs font-semibold"
              style={{ color: "#1f6223" }}
            >
              Version améliorée
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="text-xs px-2.5 py-1 rounded-lg font-medium text-white transition-all"
                style={{ background: "#1f6223" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#0d631b";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "#1f6223";
                }}
              >
                Accepter
              </button>
              <button
                type="button"
                onClick={() => {
                  setImproved(null);
                  setIsVisible(false);
                }}
                className="text-xs px-2.5 py-1 rounded-lg transition-all"
                style={{ color: "#707a6c" }}
              >
                Ignorer
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="px-3 py-3" style={{ background: "white" }}>
            <p
              className="text-sm leading-relaxed whitespace-pre-wrap"
              style={{ color: "#1a1c1c" }}
            >
              {improved}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// components/ai/ThreadSummary.tsx
"use client";

import { useState } from "react";
import { useAIChat } from "@/hooks/AI/useAIChat";
import toast from "react-hot-toast";

interface ThreadMessage {
  author: string;
  content: string;
}

interface ThreadSummaryProps {
  messages: ThreadMessage[];
  className?: string;
}

export function ThreadSummary({
  messages,
  className = "",
}: ThreadSummaryProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { summarize } = useAIChat();

  const handleSummarize = async () => {
    if (messages.length < 2) return;

    if (isOpen && summary) {
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = messages
        .map((m) => `${m.author}: ${m.content}`)
        .join("\n");
      const result = await summarize(content, "fr");
      setSummary(result);
      setIsOpen(true);
      toast.success("Résumé généré avec succès");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors du résumé.");
      toast.error("Impossible de générer le résumé");
    } finally {
      setIsLoading(false);
    }
  };

  if (messages.length < 2) return null;

  return (
    <div className={`space-y-sm ${className}`}>
      <button
        type="button"
        onClick={handleSummarize}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-sm font-medium text-[#2d5a27] hover:text-[#154212] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
          <>{isOpen ? "Masquer le résumé" : "Résumer cette discussion"}</>
        )}
      </button>

      {error && <p className="text-[12px] text-[#ba1a1a]">{error}</p>}

      {isOpen && summary && (
        <div className="px-4 py-3 bg-[rgba(45,90,39,0.05)] border border-[rgba(45,90,39,0.15)] rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#2d5a27] text-sm">🤖</span>
            <span className="text-sm font-semibold text-[#2d5a27]">
              Résumé IA — {messages.length} messages
            </span>
          </div>
          <p className="text-sm text-[#191c18] leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
}

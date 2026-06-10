// hooks/useTagSuggester.ts
"use client";

import { useCallback, useState } from "react";
import { generateTags, APIError } from "@/lib/ai-client";

interface UseTagSuggesterReturn {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: (content: string, maxTags?: number) => Promise<void>;
  clearSuggestions: () => void;
}

/**
 * Hook pour la génération automatique de tags via IA.
 */
export function useTagSuggester(): UseTagSuggesterReturn {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (content: string, maxTags = 5) => {
    if (content.trim().length < 20) return;

    setIsLoading(true);
    setError(null);

    try {
      const tags = await generateTags(content, maxTags);
      setSuggestions(tags);
    } catch (err) {
      setError(
        err instanceof APIError
          ? err.message
          : "Impossible de générer des tags pour le moment.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return { suggestions, isLoading, error, getSuggestions, clearSuggestions };
}

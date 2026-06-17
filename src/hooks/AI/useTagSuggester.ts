// hooks/AI/useTagSuggester.ts
"use client";

/**
 * Hook pour la suggestion automatique de tags via IA.
 *
 * Correction : appelle aiService.generateTags (route /ai/suggestions/tags)
 * au lieu de l'ancien ai-client.ts qui pointait vers /ai/tags (inexistant).
 */

import { useCallback, useState } from "react";
import { aiService } from "@/services/Ai/ai.service";

interface UseTagSuggesterReturn {
  suggestions: string[];
  isLoading: boolean;
  error: string | null;
  getSuggestions: (content: string, maxTags?: number) => Promise<void>;
  clearSuggestions: () => void;
}

export function useTagSuggester(): UseTagSuggesterReturn {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSuggestions = useCallback(async (content: string, maxTags = 5) => {
    if (content.trim().length < 20) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await aiService.generateTags(content, maxTags);
      setSuggestions(result.tags);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Impossible de générer des tags pour le moment.";
      setError(message);
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

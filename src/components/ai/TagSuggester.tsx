/* eslint-disable react/no-unescaped-entities */
// components/ai/TagSuggester.tsx
"use client";

import { useTagSuggester } from "@/hooks/AI/useTagSuggester";

interface TagSuggesterProps {
  content: string;
  selectedTags: string[];
  onTagAdd: (tag: string) => void;
}

export function TagSuggester({
  content,
  selectedTags,
  onTagAdd,
}: TagSuggesterProps) {
  const { suggestions, isLoading, error, getSuggestions, clearSuggestions } =
    useTagSuggester();

  const available = suggestions.filter((t) => !selectedTags.includes(t));
  const isDisabled = content.trim().length < 20 || isLoading;

  const handleSuggest = async () => {
    clearSuggestions();
    await getSuggestions(content, 6);
  };

  return (
    <div className="space-y-sm">
      <button
        type="button"
        onClick={handleSuggest}
        disabled={isDisabled}
        className="flex items-center gap-1.5 font-body-sm text-body-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed text-secondary hover:text-on-secondary-fixed"
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
            Génération…
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]">sell</span>
            Suggérer des tags avec l'IA
          </>
        )}
      </button>

      {!isLoading && content.trim().length < 20 && (
        <p className="text-[12px] text-on-surface-variant">
          20 caractères minimum pour obtenir des suggestions.
        </p>
      )}

      {error && <p className="text-[12px] text-error">{error}</p>}

      {available.length > 0 && (
        <div
          className="flex flex-wrap gap-sm"
          role="list"
          aria-label="Tags suggérés"
        >
          {available.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagAdd(tag)}
              role="listitem"
              className="px-md py-xs text-[12px] font-bold rounded-full border transition-all bg-secondary-fixed/30 border-secondary-fixed text-on-secondary-fixed-variant hover:bg-secondary-fixed/60"
              aria-label={`Ajouter le tag ${tag}`}
            >
              + {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

// components/ai/TagSuggester.tsx

import { useTagSuggester } from "@/hooks/AI/useTagSuggester";

interface TagSuggesterProps {
  /** Contenu du post en cours de rédaction */
  content: string;
  /** Tags déjà sélectionnés */
  selectedTags: string[];
  /** Callback quand un tag est ajouté */
  onTagAdd: (tag: string) => void;
}

/**
 * Composant de suggestion automatique de tags via IA.
 * Affiche un bouton pour déclencher la suggestion et les tags proposés.
 */
export function TagSuggester({
  content,
  selectedTags,
  onTagAdd,
}: TagSuggesterProps) {
  const { suggestions, isLoading, error, getSuggestions, clearSuggestions } =
    useTagSuggester();

  const handleSuggest = async () => {
    clearSuggestions();
    await getSuggestions(content, 6);
  };

  // Filtre les tags déjà sélectionnés
  const available = suggestions.filter((t) => !selectedTags.includes(t));

  const isDisabled = content.trim().length < 20 || isLoading;

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleSuggest}
        disabled={isDisabled}
        className="
          flex items-center gap-1.5 text-xs font-medium
          text-purple-600 dark:text-purple-400
          hover:text-purple-700 dark:hover:text-purple-300
          disabled:opacity-40 disabled:cursor-not-allowed
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
            Génération en cours…
          </>
        ) : (
          <>
            {/* Sparkles icon */}
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
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              />
            </svg>
            Suggérer des tags avec l'IA
          </>
        )}
      </button>

      {!isLoading && content.trim().length < 20 && (
        <p className="text-xs text-gray-400">
          Écrivez au moins 20 caractères pour obtenir des suggestions.
        </p>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      {available.length > 0 && (
        <div
          className="flex flex-wrap gap-1.5"
          role="list"
          aria-label="Tags suggérés"
        >
          {available.map((tag: any) => (
            <button
              key={tag}
              type="button"
              onClick={() => onTagAdd(tag)}
              role="listitem"
              className="
                px-3 py-1 text-xs font-medium
                bg-purple-50 dark:bg-purple-900/30
                text-purple-700 dark:text-purple-300
                border border-purple-200 dark:border-purple-700
                rounded-full
                hover:bg-purple-100 dark:hover:bg-purple-900/50
                transition-colors
              "
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

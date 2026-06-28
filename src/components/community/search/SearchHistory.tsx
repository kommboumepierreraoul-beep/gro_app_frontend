/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect } from "react";
import {
  Search as SearchIcon,
  X,
  Clock,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchHistoryProps {
  onSearch: (query: string) => void;
  currentQuery?: string;
}

export function SearchHistory({ onSearch, currentQuery }: SearchHistoryProps) {
  const router = useRouter();
  const [history, setHistory] = useState<string[]>([]);
  const [trending, setTrending] = useState<string[]>([
    "agriculture",
    "fermier",
    "élevage",
    "récolte",
    "jardin",
    "maraîchage",
    "permaculture",
    "bio",
  ]);

  // Charger l'historique depuis le localStorage
  useEffect(() => {
    const saved = localStorage.getItem("searchHistory");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed.slice(0, 10));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  // Sauvegarder l'historique dans le localStorage
  const saveHistory = (newHistory: string[]) => {
    localStorage.setItem("searchHistory", JSON.stringify(newHistory));
  };

  // Ajouter une recherche à l'historique
  const addToHistory = (query: string) => {
    if (!query || query.trim().length < 2) return;
    const cleanQuery = query.trim();
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== cleanQuery);
      const newHistory = [cleanQuery, ...filtered].slice(0, 10);
      saveHistory(newHistory);
      return newHistory;
    });
  };

  // Supprimer un élément de l'historique
  const removeFromHistory = (query: string) => {
    setHistory((prev) => {
      const newHistory = prev.filter((item) => item !== query);
      saveHistory(newHistory);
      return newHistory;
    });
  };

  // Effacer tout l'historique
  const clearHistory = () => {
    setHistory([]);
    saveHistory([]);
  };

  const handleSearch = (query: string) => {
    addToHistory(query);
    onSearch(query);
  };

  return (
    <div className="sticky top-24 space-y-6">
      {/* Historique des recherches */}
      {history.length > 0 && (
        <div
          className="rounded-2xl p-4"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(194,201,187,0.3)",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#72796e]" strokeWidth={1.5} />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#72796e]">
                Historique
              </h3>
            </div>
            <button
              onClick={clearHistory}
              className="text-[10px] text-[#72796e] hover:text-[#ba1a1a] transition-colors"
            >
              Tout effacer
            </button>
          </div>

          <div className="space-y-1">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-[#f3f4ed] transition cursor-pointer"
                onClick={() => handleSearch(item)}
              >
                <SearchIcon
                  className="w-3.5 h-3.5 text-[#72796e] flex-shrink-0"
                  strokeWidth={1.5}
                />
                <span className="text-sm text-[#191c18] flex-1 truncate">
                  {item}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(item);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:bg-[#e7e9e1]"
                >
                  <X className="w-3 h-3 text-[#72796e]" strokeWidth={1.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tendances / Suggestions populaires */}
      <div
        className="rounded-2xl p-4"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(194,201,187,0.3)",
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4 text-[#805533]" strokeWidth={1.5} />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#72796e]">
            Tendances
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {trending.map((item) => (
            <button
              key={item}
              onClick={() => handleSearch(item)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                currentQuery === item
                  ? "bg-[#154212] text-[#bcf0ae]"
                  : "bg-[#f3f4ed] text-[#42493e] hover:bg-[#eaf3de]"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Astuce */}
      <div
        className="rounded-2xl p-4"
        style={{
          background:
            "linear-gradient(135deg, rgba(188,240,174,0.15) 0%, rgba(244,187,146,0.1) 100%)",
          border: "1px solid rgba(188,240,174,0.2)",
        }}
      >
        <p className="text-xs text-[#72796e] leading-relaxed">
          💡 Essayez des mots-clés comme{" "}
          <span className="font-medium text-[#154212]">"agriculture"</span>,{" "}
          <span className="font-medium text-[#154212]">"fermier"</span> ou{" "}
          <span className="font-medium text-[#154212]">"formation"</span>
        </p>
      </div>
    </div>
  );
}

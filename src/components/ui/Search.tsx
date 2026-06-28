/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search as SearchIcon,
  User,
  FileText,
  Loader2,
  AtSign,
} from "lucide-react";
import { Avatar } from "@/components/community/shared/Avatar";
import { profileService } from "@/services/community/profile.service";

interface SearchResult {
  id: string;
  type: "user" | "post";
  data: any;
}

interface SearchProps {
  onClose?: () => void;
  className?: string;
  placeholder?: string;
}

export function Search({
  onClose,
  className = "",
  placeholder = "Rechercher des utilisateurs...",
}: SearchProps) {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Recherche utilisateurs
  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setIsLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await profileService.search(query);
        setUsers(results || []);
        setShowResults(true);
      } catch (error) {
        console.error("Erreur recherche utilisateurs:", error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [query]);

  // Fermer les résultats si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const handleResultClick = () => {
    setShowResults(false);
    setQuery("");
    onClose?.();
  };

  // Fonction pour mettre en évidence le texte recherché
  const highlightText = (text: string, searchQuery: string) => {
    if (!searchQuery || !text) return text;

    const regex = new RegExp(
      `(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi",
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 text-gray-900 rounded px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      ),
    );
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() =>
            query.length >= 2 && users.length > 0 && setShowResults(true)
          }
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-300 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-green-200 focus:border-green-300 transition"
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
      </div>

      {/* Résultats de recherche */}
      {showResults && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[500px] overflow-y-auto">
          {/* Header résultats */}
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
            <p className="text-xs font-medium text-gray-500">
              Résultats pour "{query}"
            </p>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="divide-y divide-gray-100">
              {[1, 2, 3].map((i) => (
                <div key={i} className="px-4 py-3 animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-48"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Aucun résultat */}
          {!isLoading && users.length === 0 && (
            <div className="px-4 py-8 text-center">
              <SearchIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">
                Aucun utilisateur trouvé pour "{query}"
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )}

          {/* Résultats utilisateurs */}
          {!isLoading && users.length > 0 && (
            <div>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 sticky top-0">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Utilisateurs ({users.length})
                  </p>
                </div>
              </div>
              {users.map((user) => (
                <Link
                  key={user.id}
                  href={`/profile/${user.id}`}
                  onClick={handleResultClick}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition group"
                >
                  <Avatar
                    src={user.avatar}
                    firstname={user.firstname}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition">
                      {user.firstname} {user.lastname}
                    </p>
                    {user.headline && (
                      <p className="text-xs text-gray-500 truncate">
                        {highlightText(user.headline, query)}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Footer voir tous les résultats */}
          {!isLoading && users.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              onClick={handleResultClick}
              className="block px-4 py-3 text-center text-sm text-green-600 hover:bg-green-50 transition font-medium border-t border-gray-100 sticky bottom-0 bg-white"
            >
              Voir tous les résultats ({users.length})
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

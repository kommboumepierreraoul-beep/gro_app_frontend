"use client";

import { useState, useEffect } from "react";
import MissionMap from "@/components/missions/Map/MissionMap";
import { Map, Loader2 } from "lucide-react";

export default function MissionsMapPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simuler le chargement de la carte
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200  backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center">
            <Map size={18} className="sm:w-[22px] sm:h-[22px] text-green-950" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Carte des missions
            </h1>

            <span className="text-xs sm:text-sm text-gray-500">
              Découvrez les missions disponibles autour de vous.
            </span>
          </div>
        </div>
      </div>

      {/* Carte - prend tout l'espace restant sans déborder */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0 border border-gray-200 shadow-sm rounded-t-xl sm:rounded-none overflow-hidden">
          {isLoading ? (
            <MapSkeleton />
          ) : error ? (
            <MapError error={error} onRetry={() => window.location.reload()} />
          ) : (
            <MissionMap />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Skeleton de la carte ──────────────────────────────────────────────

function MapSkeleton() {
  return (
    <div className="w-full h-full relative">
      {/* Overlay de chargement */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
        <div className="relative">
          {/* Spinner */}
          <div className="w-16 h-16 rounded-full border-4 border-gray-200 border-t-green-950 animate-spin" />

          {/* Icône Map */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Map className="w-6 h-6 text-green-950 animate-pulse" />
          </div>
        </div>

        <p className="mt-4 text-sm font-medium text-gray-600 animate-pulse">
          Chargement de la carte...
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Les missions se chargent dans un instant
        </p>
      </div>

      {/* Skeleton de la carte */}
      <div className="w-full h-full p-4">
        {/* Barre de recherche skeleton */}
        <div className="absolute top-4 right-4 z-[1000] w-[380px] max-w-[90vw]">
          <div className=" rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-2 p-2">
              <div className="w-4 h-4 bg-gray-200 rounded ml-2 animate-pulse" />
              <div className="flex-1 h-8 bg-gray-200 rounded animate-pulse" />
              <div className="w-px h-6 bg-gray-200" />
              <div className="w-20 h-8 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-24 h-8 bg-gray-200 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Points de mission skeletons */}
        <div className="absolute inset-0">
          {/* Cercle de rayon skeleton */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-64 h-64 rounded-full border-2 border-dashed border-gray-300 animate-pulse" />
          </div>

          {/* Marqueurs skeletons */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="absolute bottom-1/3 left-1/3 w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
          <div className="absolute top-1/2 left-1/2 w-8 h-8 bg-gray-300 rounded-full animate-pulse" />

          {/* Marqueur utilisateur skeleton */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-blue-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
        </div>

        {/* Grille de la carte skeleton */}
        <div className="w-full h-full opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 gap-2 w-full h-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="border border-gray-300/50 rounded" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Message d'erreur ──────────────────────────────────────────────────

function MapError({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Erreur de chargement
      </h3>
      <p className="text-sm text-gray-500 max-w-sm text-center mb-4">
        {error || "Impossible de charger la carte des missions."}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-950 hover:bg-green-900 text-white font-semibold text-sm rounded-xl transition"
      >
        <Loader2 className="w-4 h-4" />
        Réessayer
      </button>
    </div>
  );
}

/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Circle,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MissionMapPoint } from "@/lib/missions/types";
import { useMissionStore } from "@/stores/useMissionStore";
import { Search, Loader2, X, MapPin, Navigation } from "lucide-react";

interface Props {
  center: { lat: number; lng: number };
  radiusKm: number;
  points: MissionMapPoint[];
  onSelectMission?: (point: MissionMapPoint) => void;
  onMapClick?: (lat: number, lng: number) => void;
  onLocate?: () => void;
  isLocating?: boolean;
  onSearchLocation?: (
    query: string,
  ) => Promise<{ lat: number; lng: number; display_name?: string } | null>;
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick?: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!onMapClick) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, onMapClick]);

  return null;
}

function RecenterMap({ center }: { center: { lat: number; lng: number } }) {
  const map = useMap();

  useEffect(() => {
    if (center && map) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);

  return null;
}

function buildCategoryIcon(point: MissionMapPoint): L.DivIcon {
  const color = point.category_color ?? "#154212";
  const initial = (point.category_slug ?? point.title)[0].toUpperCase();

  const html = `
    <div style="
      width: 34px; height: 34px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      display: flex; align-items: center; justify-content: center;
    ">
      <span style="
        transform: rotate(45deg);
        color: white; font-weight: 700; font-size: 13px;
        font-family: 'Plus Jakarta Sans', sans-serif;
      ">${initial}</span>
    </div>
  `;

  return L.divIcon({
    html,
    className: "gro-mission-marker",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -34],
  });
}

function buildUserIcon(): L.DivIcon {
  return L.divIcon({
    html: `
      <div style="
        width: 18px; height: 18px;
        background: #185fa5;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 6px rgba(24,95,165,0.2);
      "></div>
    `,
    className: "gro-user-marker",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

// ── Composant de recherche avec suggestions Nominatim ──────────────────
function SearchControl({
  onSearch,
  onLocate,
  isLocating,
}: {
  onSearch: (query: string) => Promise<void>;
  onLocate?: () => void;
  isLocating?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Détecter si on est sur mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        if (isMobile) {
          setIsExpanded(false);
        }
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile]);

  // Focus sur l'input quand la recherche s'ouvre
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  // Recherche de suggestions via Nominatim
  const fetchSuggestions = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5&addressdetails=1&countrycodes=fr`,
      );
      const data = await response.json();

      if (data && data.length > 0) {
        setSuggestions(data);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Erreur suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Debounce pour éviter trop d'appels API
  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (query.length >= 2) {
      debounceTimeout.current = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [query]);

  const handleSearch = async (searchQuery?: string) => {
    const queryToSearch = searchQuery || query;
    if (!queryToSearch.trim()) {
      setError("Veuillez saisir un lieu");
      return;
    }

    setError(null);
    setIsSearching(true);

    try {
      await onSearch(queryToSearch.trim());
      setShowSuggestions(false);
      if (isMobile) {
        setIsExpanded(false);
      }
    } catch (err) {
      setError("Lieu introuvable. Veuillez réessayer.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = (suggestion: any) => {
    const displayName =
      suggestion.display_name || suggestion.name || suggestion.place;
    setQuery(displayName);
    setShowSuggestions(false);
    handleSearch(displayName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions.length > 0) {
        handleSelectSuggestion(suggestions[0]);
      } else {
        handleSearch();
      }
    }
    if (e.key === "Escape") {
      setIsExpanded(false);
      setShowSuggestions(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    setError(null);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setShowSuggestions(false);
    setError(null);
  };

  // ── Version mobile ──────────────────────────────────────────────────
  if (isMobile) {
    return (
      <div ref={containerRef} className="absolute top-4 right-4 z-[1000]">
        {!isExpanded ? (
          <button
            onClick={handleToggle}
            className="w-12 h-12 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition active:scale-95"
          >
            <Search className="w-5 h-5 text-green-950" />
          </button>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 w-[calc(100vw-2rem)] max-w-md">
            <div className="flex items-center gap-2 p-2">
              <button
                onClick={handleClose}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 shrink-0"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Rechercher un lieu..."
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950 transition"
                />
              </div>

              {query && (
                <button
                  onClick={handleClear}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}

              <div className="w-px h-6 bg-gray-200 shrink-0" />

              <button
                onClick={onLocate}
                disabled={isLocating}
                className="p-2 rounded-lg bg-green-950 hover:bg-green-900 text-white transition disabled:opacity-50 shrink-0"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Navigation className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={() => handleSearch()}
                disabled={isSearching || !query.trim()}
                className="px-4 py-2 rounded-lg bg-green-950 hover:bg-green-900 text-white text-sm font-medium transition disabled:opacity-50 shrink-0"
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "OK"
                )}
              </button>
            </div>

            {/* Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="border-t border-gray-100 max-h-60 overflow-y-auto"
              >
                {isLoadingSuggestions ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-green-950" />
                    <span className="text-sm text-gray-500 ml-2">
                      Recherche...
                    </span>
                  </div>
                ) : (
                  suggestions.map((suggestion, index) => {
                    const displayName =
                      suggestion.display_name ||
                      suggestion.name ||
                      suggestion.place;
                    const parts = displayName.split(",");
                    const main = parts[0] || displayName;
                    const detail = parts.slice(1).join(",").trim();

                    return (
                      <button
                        key={index}
                        onClick={() => handleSelectSuggestion(suggestion)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                      >
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 font-medium truncate">
                            {main}
                          </p>
                          {detail && (
                            <p className="text-xs text-gray-400 truncate">
                              {detail}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {/* Message d'erreur */}
            {error && (
              <div className="px-4 py-2 bg-red-50 border-t border-red-100">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ── Version desktop ──────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="absolute top-4 right-4 z-[1000] w-[380px] max-w-[90vw]"
    >
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 p-2">
          <Search className="w-4 h-4 text-gray-400 ml-2 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError(null);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher une ville, un lieu..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-gray-900 placeholder:text-gray-400 py-2 min-w-[120px]"
          />

          {isLoadingSuggestions && (
            <Loader2 className="w-4 h-4 animate-spin text-green-950 shrink-0" />
          )}

          {query && (
            <button
              onClick={handleClear}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition text-gray-400 hover:text-gray-600 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          <button
            onClick={() => handleSearch()}
            disabled={isSearching || !query.trim()}
            className="px-4 py-1.5 rounded-lg bg-green-950 hover:bg-green-900 text-white text-sm font-medium transition disabled:opacity-50 shrink-0"
          >
            {isSearching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search />
            )}
          </button>
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="border-t border-gray-100 max-h-60 overflow-y-auto"
          >
            {suggestions.map((suggestion, index) => {
              const displayName =
                suggestion.display_name || suggestion.name || suggestion.place;
              const parts = displayName.split(",");
              const main = parts[0] || displayName;
              const detail = parts.slice(1).join(",").trim();

              return (
                <button
                  key={index}
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition text-left"
                >
                  <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {main}
                    </p>
                    {detail && (
                      <p className="text-xs text-gray-400 truncate">{detail}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Message d'erreur */}
        {error && (
          <div className="px-4 py-2 bg-red-50 border-t border-red-100">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Composant principal ─────────────────────────────────────────────────
export default function LeafletMissionMap({
  center,
  radiusKm,
  points,
  onSelectMission,
  onMapClick,
  onLocate,
  isLocating,
  onSearchLocation,
}: Props) {
  const openApplyModal = useMissionStore((s) => s.openApplyModal);
  const userIcon = buildUserIcon();
  const [searching, setSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!onSearchLocation) {
      // Utiliser Nominatim pour la géocodification
      setSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&addressdetails=1&countrycodes=fr`,
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const result = data[0];
          const lat = parseFloat(result.lat);
          const lng = parseFloat(result.lon);

          if (onMapClick) {
            onMapClick(lat, lng);
          }
        } else {
          throw new Error("Lieu non trouvé");
        }
      } catch (error) {
        throw new Error("Impossible de trouver ce lieu");
      } finally {
        setSearching(false);
      }
      return;
    }

    try {
      const result = await onSearchLocation(query);
      if (result && onMapClick) {
        onMapClick(result.lat, result.lng);
      } else {
        throw new Error("Lieu non trouvé");
      }
    } catch (error) {
      throw new Error("Impossible de trouver ce lieu");
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Contrôle de recherche */}
      <SearchControl
        onSearch={handleSearch}
        onLocate={onLocate}
        isLocating={isLocating || searching}
      />

      {/* Carte */}
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={11}
        style={{ width: "100%", height: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onMapClick={onMapClick} />
        <RecenterMap center={center} />

        <Marker position={[center.lat, center.lng]} icon={userIcon}>
          <Popup>Votre position</Popup>
        </Marker>

        <Circle
          center={[center.lat, center.lng]}
          radius={radiusKm * 1000}
          pathOptions={{
            color: "#154212",
            fillColor: "#2d5a27",
            fillOpacity: 0.06,
            weight: 1.5,
            dashArray: "6 6",
          }}
        />

        {points &&
          points.map((point) => (
            <Marker
              key={point.id}
              position={[point.lat, point.lng]}
              icon={buildCategoryIcon(point)}
              eventHandlers={{
                click: () => onSelectMission?.(point),
              }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "Inter, sans-serif" }}>
                  {point.category_slug && (
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 9,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        padding: "2px 8px",
                        borderRadius: 999,
                        backgroundColor: `${point.category_color}20`,
                        color: point.category_color ?? "#154212",
                        marginBottom: 6,
                      }}
                    >
                      {point.category_slug.replace(/-/g, " ")}
                    </span>
                  )}

                  <p
                    style={{
                      fontWeight: 600,
                      fontSize: 13,
                      color: "#191c18",
                      margin: "4px 0",
                    }}
                  >
                    {point.title}
                  </p>

                  <p
                    style={{ fontSize: 11, color: "#72796e", margin: "2px 0" }}
                  >
                    📍 {point.distance_km} km · {point.applications_count}{" "}
                    candidature
                    {point.applications_count !== 1 ? "s" : ""}
                  </p>

                  <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                    <a
                      href={`/missions/${point.ulid}`}
                      style={{
                        flex: 1,
                        textAlign: "center",
                        fontSize: 11,
                        fontWeight: 600,
                        border: "1px solid #154212",
                        color: "#154212",
                        borderRadius: 8,
                        padding: "6px 0",
                        textDecoration: "none",
                      }}
                    >
                      Détails
                    </a>

                    <button
                      onClick={() => openApplyModal(point.ulid)}
                      style={{
                        flex: 1,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "#154212",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 0",
                        cursor: "pointer",
                      }}
                    >
                      Postuler
                    </button>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}

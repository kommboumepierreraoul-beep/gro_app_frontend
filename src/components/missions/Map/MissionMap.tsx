"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  MapPin,
  Locate,
  Loader2,
  SlidersHorizontal,
  X,
  Tags,
} from "lucide-react";
import { useMissionMapPoints } from "@/hooks/missions/useMissions";
import { MissionMapPoint } from "@/lib/missions/types";

const LeafletMap = dynamic(() => import("./LeafletMissionMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#edefe7]">
      <Loader2 className="animate-spin text-[#154212]" size={28} />
    </div>
  ),
});

interface Props {
  onSelectMission?: (point: MissionMapPoint) => void;
}

export default function MissionMap({ onSelectMission }: Props) {
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [radiusKm, setRadiusKm] = useState(25);
  const [locating, setLocating] = useState(false);
  const [showRadiusPanel, setShowRadiusPanel] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  // GEOLOCATION
  useEffect(() => {
    if (!navigator.geolocation) {
      setCenter({ lat: 3.848, lng: 11.502 });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) =>
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => setCenter({ lat: 3.848, lng: 11.502 }),
      { timeout: 5000 },
    );
  }, []);

  const { data: points, isLoading } = useMissionMapPoints(
    center?.lat,
    center?.lng,
    radiusKm,
  );

  const handleMapClick = (lat: number, lng: number) => {
    setCenter({ lat, lng });
  };

  // Fonction de localisation
  const handleLocate = () => {
    if (!navigator.geolocation) {
      console.error("Géolocalisation non supportée");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log(
          "Position obtenue:",
          pos.coords.latitude,
          pos.coords.longitude,
        );
        setCenter({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        setLocating(false);
      },
      { timeout: 5000, enableHighAccuracy: true },
    );
  };

  // Générer la légende des catégories
  const categoryLegend = useMemo(() => {
    if (!points) return [];

    const map = new Map<
      string,
      { label: string; color: string; count: number }
    >();

    points.forEach((p) => {
      const key = p.category_slug ?? "other";

      if (!map.has(key)) {
        map.set(key, {
          label: p.category_slug ?? "Autre",
          color: p.category_color ?? "#154212",
          count: 0,
        });
      }

      map.get(key)!.count++;
    });

    return Array.from(map.values());
  }, [points]);

  if (!center) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#edefe7]">
        <Loader2 className="animate-spin text-[#154212]" size={28} />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#edefe7]">
      {/* MAP EN ARRIÈRE-PLAN */}
      <div className="absolute inset-0 z-0">
        <LeafletMap
          center={center}
          radiusKm={radiusKm}
          points={points ?? []}
          onSelectMission={onSelectMission}
          onMapClick={handleMapClick}
        />
      </div>

      {/* CONTROLES EN PREMIER PLAN */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* Contrôle rayon - Desktop seulement */}
        <div className="hidden md:block absolute top-4 left-4 right-auto md:w-72 pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-xl border border-[#c2c9bb]/30 rounded-2xl p-3 sm:p-4 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[8px] sm:text-[10px] font-semibold text-[#72796e] uppercase tracking-widest flex items-center gap-1 sm:gap-1.5">
                <MapPin
                  size={9}
                  className="sm:w-[11px] sm:h-[11px] text-[#154212]"
                />
                <span className="hidden sm:inline">Rayon de recherche</span>
                <span className="sm:hidden">Rayon</span>
              </label>
              <span className="text-[10px] sm:text-sm font-bold text-[#154212]">
                {radiusKm} km
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="200"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(Number(e.target.value))}
              className="w-full accent-[#154212] h-1 sm:h-1.5"
            />

            <div className="flex justify-between text-[8px] sm:text-[9px] text-[#72796e] mt-1">
              <span>5 km</span>
              <span>100 km</span>
              <span>200 km</span>
            </div>

            {isLoading ? (
              <p className="text-[10px] sm:text-xs text-[#72796e] mt-2 sm:mt-3 flex items-center gap-1.5">
                <Loader2 size={10} className="sm:w-3 sm:h-3 animate-spin" />{" "}
                Recherche...
              </p>
            ) : (
              <p className="text-[10px] sm:text-xs text-[#3b6934] font-medium mt-2 sm:mt-3">
                {points?.length ?? 0} mission
                {(points?.length ?? 0) !== 1 ? "s" : ""} trouvée
              </p>
            )}
          </div>
        </div>

        {/* Bouton pour afficher le panneau rayon sur mobile */}
        <div className="absolute top-4 right-4 pointer-events-auto md:hidden">
          <button
            onClick={() => setShowRadiusPanel(!showRadiusPanel)}
            className="w-10 h-10 bg-white rounded-full shadow-lg border border-[#c2c9bb]/30 flex items-center justify-center hover:bg-[#f3f4ed] transition-colors"
            title="Ajuster le rayon"
          >
            <SlidersHorizontal size={18} className="text-[#154212]" />
          </button>
        </div>

        {/* Panneau rayon mobile (popup) */}
        <div
          className={`
            absolute top-0 right-0 h-full pointer-events-auto
            transition-all duration-300 transform
            md:hidden
            ${showRadiusPanel ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="bg-white/95 backdrop-blur-xl border-l border-[#c2c9bb]/30 h-full w-64 p-4 shadow-lg overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#c2c9bb]/20">
              <h3 className="text-sm font-semibold text-[#191c18] flex items-center gap-2">
                <MapPin size={16} className="text-[#154212]" />
                Rayon de recherche
              </h3>
              <button
                onClick={() => setShowRadiusPanel(false)}
                className="text-[#72796e] hover:text-[#154212] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-[#72796e]">Distance</span>
                <span className="text-lg font-bold text-[#154212]">
                  {radiusKm} km
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(Number(e.target.value))}
                className="w-full accent-[#154212] h-1.5"
              />

              <div className="flex justify-between text-[9px] text-[#72796e] mt-2">
                <span>5 km</span>
                <span>100 km</span>
                <span>200 km</span>
              </div>
            </div>

            {isLoading ? (
              <p className="text-xs text-[#72796e] mt-3 flex items-center gap-1.5">
                <Loader2 size={12} className="animate-spin" /> Recherche...
              </p>
            ) : (
              <p className="text-xs text-[#3b6934] font-medium mt-3">
                {points?.length ?? 0} mission
                {(points?.length ?? 0) !== 1 ? "s" : ""} trouvée
              </p>
            )}
          </div>
        </div>

        {/* Bouton localisation - EN HAUT AU CENTRE */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 pointer-events-auto z-20">
          <button
            onClick={handleLocate}
            disabled={locating}
            className="w-11 h-11 bg-white rounded-full shadow-lg border border-[#c2c9bb]/30 flex items-center justify-center hover:bg-[#f3f4ed] transition-colors"
            title="Me localiser"
          >
            {locating ? (
              <Loader2 size={18} className="animate-spin text-[#154212]" />
            ) : (
              <Locate size={18} className="text-[#154212]" />
            )}
          </button>
        </div>

        {/* LÉGENDE - Mobile: centre droit, Desktop: bas gauche */}
        {categoryLegend.length > 0 && (
          <>
            {/* Bouton pour ouvrir/fermer la légende sur mobile */}
            <div className="absolute top-1/2 -translate-y-1/2 right-4 pointer-events-auto md:hidden">
              <button
                onClick={() => setShowLegend(!showLegend)}
                className="w-10 h-10 bg-white rounded-full shadow-lg border border-[#c2c9bb]/30 flex items-center justify-center hover:bg-[#f3f4ed] transition-colors"
                title="Catégories"
              >
                <Tags size={18} className="text-[#154212]" />
              </button>
            </div>

            {/* Légende - Version mobile (popup qui glisse depuis la droite) */}
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 right-0 pointer-events-auto
                transition-all duration-300 transform
                md:hidden
                ${showLegend ? "translate-x-0" : "translate-x-full"}
              `}
            >
              <div className="bg-white/95 backdrop-blur-xl border-l border-[#c2c9bb]/30 rounded-l-xl p-4 shadow-lg w-64">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#c2c9bb]/20">
                  <h3 className="text-sm font-semibold text-[#191c18] flex items-center gap-2">
                    <Tags size={16} className="text-[#154212]" />
                    Catégories
                  </h3>
                  <button
                    onClick={() => setShowLegend(false)}
                    className="text-[#72796e] hover:text-[#154212] transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-2">
                  {categoryLegend.map((cat) => (
                    <div key={cat.label} className="flex items-center gap-3">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs text-[#42493e] capitalize flex-1">
                        {cat.label.replace(/-/g, " ")}
                      </span>
                      <span className="text-xs font-bold text-[#72796e]">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Légende - Version desktop (toujours visible en bas à gauche) */}
            <div className="hidden md:block absolute bottom-4 left-4 pointer-events-auto">
              <div className="bg-white/95 backdrop-blur-xl border border-[#c2c9bb]/30 rounded-xl p-3 shadow-lg min-w-[160px] max-w-[200px]">
                <p className="text-[9px] font-semibold text-[#72796e] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Tags size={11} className="text-[#154212]" />
                  Catégories
                </p>

                <div className="space-y-1.5">
                  {categoryLegend.map((cat) => (
                    <div key={cat.label} className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-xs text-[#42493e] capitalize flex-1 truncate">
                        {cat.label.replace(/-/g, " ")}
                      </span>
                      <span className="text-[10px] font-bold text-[#72796e]">
                        {cat.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

"use client";

import MissionMap from "@/components/missions/Map/MissionMap";
import { Map } from "lucide-react";

export default function MissionsMapPage() {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#d9ddd2] bg-white/50 backdrop-blur-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-[#154212]/10 flex items-center justify-center">
            <Map size={18} className="sm:w-[22px] sm:h-[22px] text-[#154212]" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#191c18]">
              Carte des missions
            </h1>

            <p className="text-xs sm:text-sm text-[#72796e]">
              Découvrez les missions disponibles autour de vous.
            </p>
          </div>
        </div>
      </div>

      {/* Carte - prend tout l'espace restant sans déborder */}
      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0 bg-white border border-[#d9ddd2] shadow-sm rounded-t-xl sm:rounded-none overflow-hidden">
          <MissionMap />
        </div>
      </div>
    </div>
  );
}

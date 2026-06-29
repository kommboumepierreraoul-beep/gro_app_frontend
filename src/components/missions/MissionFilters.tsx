/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { MissionFilters as FiltersType } from "@/lib/missions/types";
import { MapPin, DollarSign, Tag } from "lucide-react";

interface Props {
  filters: FiltersType;
  onChange: (f: Partial<FiltersType>) => void;
}

const REMUNERATION_OPTIONS = [
  { value: "", label: "Tous" },
  { value: "fixed", label: "Montant fixe" },
  { value: "daily_rate", label: "Journalier" },
  { value: "negotiable", label: "À négocier" },
  { value: "in_kind", label: "En nature" },
  { value: "volunteer", label: "Bénévolat" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "distance", label: "Plus proches" },
  { value: "popular", label: "Plus populaires" },
];

export default function MissionFilters({ filters, onChange }: Props) {
  return (
    <div className="bg-white/70 backdrop-blur-xl border border-[#c2c9bb]/30 rounded-2xl p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Localisation */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest flex items-center gap-1.5">
            <MapPin size={10} /> Localisation
          </label>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Latitude"
                value={filters.lat ?? ""}
                onChange={(e) =>
                  onChange({
                    lat: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="px-3 py-2.5 bg-[#f3f4ed] border border-[#c2c9bb]/30 rounded-xl text-xs focus:outline-none focus:border-[#154212] text-[#191c18]"
              />
              <input
                type="number"
                placeholder="Longitude"
                value={filters.lng ?? ""}
                onChange={(e) =>
                  onChange({
                    lng: e.target.value ? Number(e.target.value) : undefined,
                  })
                }
                className="px-3 py-2.5 bg-[#f3f4ed] border border-[#c2c9bb]/30 rounded-xl text-xs focus:outline-none focus:border-[#154212] text-[#191c18]"
              />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-[10px] text-[#72796e]">
                <span>Rayon</span>
                <span className="font-semibold text-[#154212]">
                  {filters.radius_km ?? 25} km
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="200"
                step="5"
                value={filters.radius_km ?? 25}
                onChange={(e) =>
                  onChange({ radius_km: Number(e.target.value) })
                }
                className="w-full accent-[#154212]"
              />
            </div>
          </div>
        </div>

        {/* Rémunération */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest flex items-center gap-1.5">
            <DollarSign size={10} /> Rémunération
          </label>
          <div className="flex flex-wrap gap-1.5">
            {REMUNERATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  onChange({ remuneration_type: opt.value as any })
                }
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  (filters.remuneration_type ?? "") === opt.value
                    ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                    : "border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212]/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tri */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-semibold text-[#72796e] uppercase tracking-widest flex items-center gap-1.5">
            <Tag size={10} /> Trier par
          </label>
          <div className="flex flex-col gap-1.5">
            {SORT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onChange({ sort: opt.value as any })}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                  (filters.sort ?? "recent") === opt.value
                    ? "border-[#154212] bg-[#154212]/5 text-[#154212]"
                    : "border-[#c2c9bb]/30 text-[#42493e] hover:border-[#154212]/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

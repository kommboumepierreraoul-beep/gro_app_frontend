/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMissionStore } from "@/stores/useMissionStore";
import { Plus, Map, LayoutGrid, Filter } from "lucide-react";
import Link from "next/link";

export default function MissionDashboardNavbar() {
  const { viewMode, setViewMode, filters, setFilters } = useMissionStore();

  return (
    <div className="w-full flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 border-b bg-white">
      {/* LEFT ACTIONS */}
      <div className="flex items-center gap-2">
        <h1 className="text-lg font-semibold">Mes missions</h1>

        <Link
          href="/community/missions/create"
          className="ml-3 flex items-center gap-2 px-3 py-2 bg-black text-white rounded-md"
        >
          <Plus size={16} />
          Créer
        </Link>
      </div>

      {/* CENTER FILTERS */}
      <div className="flex items-center gap-2">
        <select
          value={filters.sort}
          onChange={(e) => setFilters({ sort: e.target.value as any })}
          className="border px-2 py-1 rounded-md"
        >
          <option value="recent">Récent</option>
          <option value="distance">Distance</option>
          <option value="popular">Populaire</option>
        </select>

        <select
          value={filters.radius_km}
          onChange={(e) => setFilters({ radius_km: Number(e.target.value) })}
          className="border px-2 py-1 rounded-md"
        >
          <option value={5}>5 km</option>
          <option value={25}>25 km</option>
          <option value={50}>50 km</option>
          <option value={100}>100 km</option>
        </select>
      </div>

      {/* RIGHT VIEW TOGGLE */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded ${viewMode === "list" ? "bg-black text-white" : "border"}`}
        >
          <LayoutGrid size={18} />
        </button>

        <button
          onClick={() => setViewMode("map")}
          className={`p-2 rounded ${viewMode === "map" ? "bg-black text-white" : "border"}`}
        >
          <Map size={18} />
        </button>
      </div>
    </div>
  );
}

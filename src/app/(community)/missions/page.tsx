/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import {
  MapPin,
  Search,
  SlidersHorizontal,
  Plus,
  Users,
  Brain,
  Settings2,
  ChevronRight,
  Clock,
  Banknote,
  Star,
  Filter,
  Bell,
  Grid3X3,
  List,
  Map,
} from "lucide-react";
import { useMissions } from "@/hooks/missions/useMissions";
import { useMissionStore } from "@/stores/useMissionStore";
import { useCategories } from "@/hooks/missions/useMissions";
import MissionCard from "@/components/missions/Card/MissionCard";
import ApplicationModal from "@/components/missions/Form/ApplicationModal";
import CreateMissionModal from "@/components/missions/Form/CreateMissionModal";
import MissionDetailModal from "@/components/missions/Card/MissionDetailCard";
import MissionFilters from "@/components/missions/MissionFilters";
import EmptyMissions from "@/components/missions/EmptyMission";
import { Mission } from "@/lib/missions/types";

// Map catégorie slug → icône + couleur GRO
const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; bgClass: string; textClass: string }
> = {
  "service-proximite": {
    icon: <Users size={20} />,
    bgClass: "bg-[#2d5a27]/10",
    textClass: "text-[#154212]",
  },
  "agricole-terrain": {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 2C6 2 2 8 2 12s4 8 10 8 10-4 10-8-4-10-10-10z" />
        <path d="M2 12h20M12 2v20" />
      </svg>
    ),
    bgClass: "bg-[#2d5a27]/10",
    textClass: "text-[#2d5a27]",
  },
  "scolaire-formation": {
    icon: <Brain size={20} />,
    bgClass: "bg-[#805533]/10",
    textClass: "text-[#805533]",
  },
  evenementiel: {
    icon: <Settings2 size={20} />,
    bgClass: "bg-[#3d5738]/10",
    textClass: "text-[#264023]",
  },
  "mission-strategique": {
    icon: <Star size={20} />,
    bgClass: "bg-[#854f0b]/10",
    textClass: "text-[#854f0b]",
  },
};

export default function MissionsPage() {
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailMission, setDetailMission] = useState<Mission | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { filters, setFilters, applyModalMissionUlid, closeApplyModal } =
    useMissionStore();
  const { data: categories } = useCategories();

  // Missions par catégorie
  const { data: allMissions, isLoading } = useMissions({
    ...filters,
    search,
    per_page: 50,
  });
  const missions = allMissions?.data ?? [];

  // Grouper les missions par catégorie
  const grouped = (categories?.data ?? [])
    .map((cat: any) => ({
      category: cat,
      missions: missions.filter((m: any) => m.category?.id === cat.id),
    }))
    .filter((g: any) => g.missions.length > 0);

  // Missions sans catégorie
  const uncategorized = missions.filter((m: any) => !m.category);

  return (
    <div className="w-full min-h-screen mx-auto p-4 sm:p-6 md:p-8 lg:p-12 pb-24 md:pb-6 max-w-[1440px]">
      {/* ── Header Responsive ─────────────────────────────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 md:mb-12">
        <div className="flex-1">
          <p className="text-[#3b6934] text-[10px] sm:text-xs tracking-widest uppercase mb-1">
            HUB COMMUNAUTAIRE
          </p>
          <h1 className="text-3xl sm:text-[40px] font-bold leading-tight tracking-tight text-[#191c18]">
            Missions
          </h1>
          <p className="text-xs sm:text-sm text-[#42493e] mt-1">
            {missions.length} mission{missions.length !== 1 ? "s" : ""}{" "}
            disponible{missions.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Barre recherche + filtres - Version mobile améliorée */}
          <div className="flex items-center gap-3 px-3 sm:px-4 py-2 bg-white/70 backdrop-blur-xl border border-[#c2c9bb]/40 rounded-xl flex-1 sm:flex-initial">
            <Search
              size={14}
              className="sm:h-4 sm:w-4 text-[#42493e] shrink-0"
            />
            <input
              type="text"
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-xs sm:text-sm w-full sm:w-52 text-[#191c18] placeholder:text-[#72796e]"
            />
            <div className="h-4 w-px bg-[#c2c9bb]/40 hidden sm:block" />
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 text-[#42493e] hover:text-[#154212] transition-colors shrink-0 ${
                showFilters ? "text-[#154212]" : ""
              }`}
            >
              <SlidersHorizontal size={14} className="sm:h-4 sm:w-4" />
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-widest uppercase hidden sm:inline">
                Filtres
              </span>
            </button>
          </div>

          {/* Toggle vue - Mobile en bas à droite */}
          <div className="flex gap-2 sm:gap-3">
            <div className="flex md:hidden items-center gap-1 p-1 bg-[#edefe7] rounded-lg">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-[#154212]"
                    : "text-[#72796e]"
                }`}
              >
                <Grid3X3 size={14} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-sm text-[#154212]"
                    : "text-[#72796e]"
                }`}
              >
                <List size={14} />
              </button>
            </div>

            {/* Bouton publier */}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[#154212] text-white font-semibold text-[10px] sm:text-xs tracking-widest uppercase py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg hover:bg-[#2d5a27] hover:shadow-xl transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={14} className="sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Publier une mission</span>
              <span className="sm:hidden">Publier</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Filtres expandables ─────────────────────────────────────── */}
      {showFilters && (
        <div className="mb-6 md:mb-10">
          <MissionFilters filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* ── Stats rapides - Grille responsive ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8 md:mb-12">
        {[
          {
            label: "Missions actives",
            value: missions.filter((m) => m.status === "published").length,
            icon: <Clock size={14} className="sm:h-4 sm:w-4" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white/70 backdrop-blur-sm border border-[#c2c9bb]/30 rounded-xl sm:rounded-2xl p-3 sm:p-4 flex items-center gap-2 sm:gap-3"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-[#2d5a27]/10 text-[#154212] rounded-lg sm:rounded-xl flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div className="min-w-0">
              <p className="text-lg sm:text-[22px] font-bold leading-none text-[#191c18]">
                {stat.value}
              </p>
              <p className="text-[8px] sm:text-[10px] text-[#72796e] font-medium mt-0.5 truncate">
                {stat.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Contenu principal ────────────────────────────────────────── */}
      {isLoading ? (
        <MissionsSkeleton viewMode={viewMode} />
      ) : missions.length === 0 ? (
        <EmptyMissions onCreateClick={() => setCreateOpen(true)} />
      ) : (
        <div className="space-y-12 sm:space-y-16">
          {/* Missions groupées par catégorie */}
          {grouped.map(
            ({
              category,
              missions: catMissions,
            }: {
              category: any;
              missions: Mission[];
            }) => {
              const meta = CATEGORY_META[category.slug] ?? {
                icon: <Star size={18} className="sm:h-5 sm:w-5" />,
                bgClass: "bg-[#2d5a27]/10",
                textClass: "text-[#154212]",
              };

              return (
                <section key={category.id} className="space-y-4 sm:space-y-5">
                  {/* En-tête section responsive */}
                  <div className="flex items-center justify-between border-b border-[#c2c9bb]/20 pb-2 sm:pb-3">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 ${meta.bgClass} ${meta.textClass} flex items-center justify-center rounded-lg sm:rounded-xl shrink-0`}
                      >
                        {meta.icon}
                      </div>
                      <h2 className="text-base sm:text-xl font-semibold text-[#191c18] truncate">
                        {category.name}
                      </h2>
                      <span className="bg-[#e2e3dc] text-[#42493e] px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold whitespace-nowrap">
                        {catMissions.length}
                      </span>
                    </div>
                    <button className="text-[#154212] text-[10px] sm:text-xs font-semibold tracking-wider uppercase hover:underline flex items-center gap-1 shrink-0">
                      Voir tout{" "}
                      <ChevronRight size={12} className="sm:h-3.5 sm:w-3.5" />
                    </button>
                  </div>

                  {/* Grille ou liste responsive */}
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                        : "flex flex-col gap-2 sm:gap-3"
                    }
                  >
                    {catMissions.map((mission: any) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        viewMode={viewMode}
                        onViewDetails={() => setDetailMission(mission)}
                      />
                    ))}
                  </div>
                </section>
              );
            },
          )}

          {/* Missions sans catégorie */}
          {uncategorized.length > 0 && (
            <section className="space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2 sm:gap-3 border-b border-[#c2c9bb]/20 pb-2 sm:pb-3">
                <h2 className="text-base sm:text-xl font-semibold text-[#191c18]">
                  Autres missions
                </h2>
                <span className="bg-[#e2e3dc] text-[#42493e] px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold">
                  {uncategorized.length}
                </span>
              </div>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                    : "flex flex-col gap-2 sm:gap-3"
                }
              >
                {uncategorized.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    viewMode={viewMode}
                    onViewDetails={() => setDetailMission(mission)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────────────── */}
      {createOpen && (
        <CreateMissionModal onClose={() => setCreateOpen(false)} />
      )}
      {detailMission && (
        <MissionDetailModal
          mission={detailMission}
          onClose={() => setDetailMission(null)}
        />
      )}
      {applyModalMissionUlid && <ApplicationModal onClose={closeApplyModal} />}
    </div>
  );
}

// Skeleton chargement responsive
function MissionsSkeleton({ viewMode }: { viewMode: "grid" | "list" }) {
  return (
    <div className="space-y-12 sm:space-y-16">
      {[1, 2].map((i) => (
        <section key={i} className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-[#c2c9bb]/20">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#e7e9e1] rounded-lg sm:rounded-xl animate-pulse" />
            <div className="h-4 sm:h-5 w-32 sm:w-48 bg-[#e7e9e1] rounded animate-pulse" />
            <div className="h-3 sm:h-4 w-12 sm:w-16 bg-[#e7e9e1] rounded-full animate-pulse" />
          </div>
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
                : "flex flex-col gap-2 sm:gap-3"
            }
          >
            {[1, 2, 3].map((j) => (
              <div
                key={j}
                className="bg-white/70 border border-[#c2c9bb]/30 rounded-xl sm:rounded-2xl p-4 sm:p-6 space-y-3 animate-pulse"
              >
                <div className="flex justify-between">
                  <div className="h-4 sm:h-5 w-16 sm:w-20 bg-[#e7e9e1] rounded-full" />
                  <div className="h-4 sm:h-5 w-12 sm:w-16 bg-[#e7e9e1] rounded" />
                </div>
                <div className="h-5 sm:h-6 w-3/4 bg-[#e7e9e1] rounded" />
                <div className="space-y-1 sm:space-y-1.5">
                  <div className="h-2 sm:h-3 w-full bg-[#e7e9e1] rounded" />
                  <div className="h-2 sm:h-3 w-2/3 bg-[#e7e9e1] rounded" />
                </div>
                <div className="pt-2 sm:pt-3 border-t border-[#e2e3dc]">
                  <div className="h-8 sm:h-10 w-full bg-[#e7e9e1] rounded-lg sm:rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

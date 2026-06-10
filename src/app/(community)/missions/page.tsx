/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { MapPin, Search, SlidersHorizontal, Plus, Users, Brain, Settings2, ChevronRight, Clock, Banknote, Star, Filter, Bell, Grid3X3, List, Map } from 'lucide-react';
import { useMissions } from '@/hooks/missions/useMissions';
import { useMissionStore } from '@/stores/useMissionStore';
import { useCategories } from '@/hooks/missions/useMissions';
import MissionCard from '@/components/missions/MissionCard';
import ApplicationModal from '@/components/missions/ApplicationModal';
import CreateMissionModal from '@/components/missions/CreateMissionModal';
import MissionDetailModal from '@/components/missions/MissionDetailCard';
import MissionFilters from '@/components/missions/MissionFilters';
import EmptyMissions from '@/components/missions/EmptyMission';
import { Mission } from '@/lib/missions/types';

// Map catégorie slug → icône + couleur GRO
const CATEGORY_META: Record<string, { icon: React.ReactNode; bgClass: string; textClass: string }> = {
  'service-proximite': {
    icon: <Users size={20} />,
    bgClass: 'bg-[#2d5a27]/10',
    textClass: 'text-[#154212]',
  },
  'agricole-terrain': {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2C6 2 2 8 2 12s4 8 10 8 10-4 10-8-4-10-10-10z"/><path d="M2 12h20M12 2v20"/></svg>,
    bgClass: 'bg-[#2d5a27]/10',
    textClass: 'text-[#2d5a27]',
  },
  'scolaire-formation': {
    icon: <Brain size={20} />,
    bgClass: 'bg-[#805533]/10',
    textClass: 'text-[#805533]',
  },
  'evenementiel': {
    icon: <Settings2 size={20} />,
    bgClass: 'bg-[#3d5738]/10',
    textClass: 'text-[#264023]',
  },
  'mission-strategique': {
    icon: <Star size={20} />,
    bgClass: 'bg-[#854f0b]/10',
    textClass: 'text-[#854f0b]',
  },
};

export default function MissionsPage() {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailMission, setDetailMission] = useState<Mission | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const { filters, setFilters, applyModalMissionUlid, closeApplyModal } = useMissionStore();
  const { data: categories } = useCategories();

  // Missions par catégorie
  const { data: allMissions, isLoading } = useMissions({ ...filters, search, per_page: 50 });
  const missions = allMissions?.data ?? [];

  // Grouper les missions par catégorie
  const grouped = (categories?.data ?? []).map((cat: any) => ({
    category: cat,
    missions: missions.filter((m: any) => m.category?.id === cat.id),
  })).filter((g: any) => g.missions.length > 0);

  // Missions sans catégorie
  const uncategorized = missions.filter((m: any) => !m.category);

  return (
    <div className="md:ml-64 p-6 md:p-12 max-w-[1440px] mx-auto pb-32 md:pb-6">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-[#3b6934] font-semibold text-xs tracking-widest uppercase mb-1">
            HUB COMMUNAUTAIRE
          </p>
          <h1 className="font-[Plus_Jakarta_Sans] text-[40px] font-bold leading-tight tracking-tight text-[#191c18]">
            Missions
          </h1>
          <p className="text-[#42493e] text-sm mt-1">
            {missions.length} mission{missions.length !== 1 ? 's' : ''} disponible{missions.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          {/* Barre recherche + filtres */}
          <div className="flex items-center gap-3 px-4 py-2.5 bg-white/70 backdrop-blur-xl border border-[#c2c9bb]/40 rounded-xl">
            <Search size={16} className="text-[#42493e] shrink-0" />
            <input
              type="text"
              placeholder="Rechercher une mission..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-sm w-full md:w-52 text-[#191c18] placeholder:text-[#72796e]"
            />
            <div className="h-5 w-px bg-[#c2c9bb]/40" />
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-1.5 text-[#42493e] hover:text-[#154212] transition-colors ${showFilters ? 'text-[#154212]' : ''}`}
            >
              <SlidersHorizontal size={16} />
              <span className="text-[10px] font-semibold tracking-widest uppercase">Filtres</span>
            </button>
          </div>

          {/* Toggle vue */}
          <div className="hidden md:flex items-center gap-1 p-1 bg-[#edefe7] rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-[#154212]' : 'text-[#72796e]'}`}
            >
              <Grid3X3 size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-[#154212]' : 'text-[#72796e]'}`}
            >
              <List size={16} />
            </button>
          </div>

          {/* Bouton publier */}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center justify-center gap-2 bg-[#154212] text-white font-semibold text-xs tracking-widest uppercase py-3 px-6 rounded-xl shadow-lg hover:bg-[#2d5a27] hover:shadow-xl transition-all active:scale-95"
          >
            <Plus size={18} />
            Publier une mission
          </button>
        </div>
      </header>

      {/* ── Filtres expandables ─────────────────────────────────────── */}
      {showFilters && (
        <div className="mb-10">
          <MissionFilters filters={filters} onChange={setFilters} />
        </div>
      )}

      {/* ── Stats rapides ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'Missions actives', value: missions.filter(m => m.status === 'published').length, icon: <Clock size={16} /> },
          { label: 'Candidatures ouvertes', value: missions.reduce((acc, m) => acc + m.applications_count, 0), icon: <Users size={16} /> },
          { label: 'Bénévolat', value: missions.filter(m => m.remuneration_type === 'volunteer').length, icon: <Star size={16} /> },
          { label: 'Catégories', value: categories?.data?.length ?? 5, icon: <Filter size={16} /> },
        ].map(stat => (
          <div key={stat.label} className="bg-white/70 backdrop-blur-sm border border-[#c2c9bb]/30 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#2d5a27]/10 text-[#154212] rounded-xl flex items-center justify-center shrink-0">
              {stat.icon}
            </div>
            <div>
              <p className="text-[22px] font-bold leading-none text-[#191c18] font-[Inter]">{stat.value}</p>
              <p className="text-[10px] text-[#72796e] font-medium mt-0.5">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Contenu principal ────────────────────────────────────────── */}
      {isLoading ? (
        <MissionsSkeleton />
      ) : missions.length === 0 ? (
        <EmptyMissions onCreateClick={() => setCreateOpen(true)} />
      ) : (
        <div className="space-y-16">
          {/* Missions groupées par catégorie */}
          {grouped.map(({ category, missions: catMissions }: { category: any; missions: Mission[] }) => {
            const meta = CATEGORY_META[category.slug] ?? {
              icon: <Star size={20} />,
              bgClass: 'bg-[#2d5a27]/10',
              textClass: 'text-[#154212]',
            };

            return (
              <section key={category.id} className="space-y-5">
                {/* En-tête section */}
                <div className="flex items-center justify-between border-b border-[#c2c9bb]/20 pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${meta.bgClass} ${meta.textClass} flex items-center justify-center rounded-xl`}>
                      {meta.icon}
                    </div>
                    <h2 className="font-[Plus_Jakarta_Sans] text-xl font-semibold text-[#191c18]">
                      {category.name}
                    </h2>
                    <span className="bg-[#e2e3dc] text-[#42493e] px-2 py-0.5 rounded-full text-[10px] font-bold">
                      {catMissions.length} mission{catMissions.length > 1 ? 's' : ''}
                    </span>
                  </div>
                  <button className="text-[#154212] text-xs font-semibold tracking-wider uppercase hover:underline flex items-center gap-1">
                    Voir tout <ChevronRight size={14} />
                  </button>
                </div>

                {/* Grille ou liste */}
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'flex flex-col gap-3'
                }>
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
          })}

          {/* Missions sans catégorie */}
          {uncategorized.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-3 border-b border-[#c2c9bb]/20 pb-3">
                <h2 className="font-[Plus_Jakarta_Sans] text-xl font-semibold text-[#191c18]">Autres missions</h2>
                <span className="bg-[#e2e3dc] text-[#42493e] px-2 py-0.5 rounded-full text-[10px] font-bold">
                  {uncategorized.length}
                </span>
              </div>
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'flex flex-col gap-3'
              }>
                {uncategorized.map(mission => (
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
      {createOpen && <CreateMissionModal onClose={() => setCreateOpen(false)} />}
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

// Skeleton chargement
function MissionsSkeleton() {
  return (
    <div className="space-y-16">
      {[1, 2].map(i => (
        <section key={i} className="space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-[#c2c9bb]/20">
            <div className="w-10 h-10 bg-[#e7e9e1] rounded-xl animate-pulse" />
            <div className="h-5 w-48 bg-[#e7e9e1] rounded animate-pulse" />
            <div className="h-4 w-16 bg-[#e7e9e1] rounded-full animate-pulse" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map(j => (
              <div key={j} className="bg-white/70 border border-[#c2c9bb]/30 rounded-2xl p-6 space-y-3 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-[#e7e9e1] rounded-full" />
                  <div className="h-5 w-16 bg-[#e7e9e1] rounded" />
                </div>
                <div className="h-6 w-3/4 bg-[#e7e9e1] rounded" />
                <div className="space-y-1">
                  <div className="h-3 w-full bg-[#e7e9e1] rounded" />
                  <div className="h-3 w-2/3 bg-[#e7e9e1] rounded" />
                </div>
                <div className="pt-3 border-t border-[#e2e3dc]">
                  <div className="h-10 w-full bg-[#e7e9e1] rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
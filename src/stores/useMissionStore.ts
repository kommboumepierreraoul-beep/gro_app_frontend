// ============================================================
// stores/useMissionStore.ts — Zustand store pour le module Missions
// ============================================================

import { create } from "zustand";
import { MissionFilters } from "@/lib/missions/types";

interface MissionStore {
  // Filtres actifs (liste, carte)
  filters: MissionFilters;
  setFilters: (f: Partial<MissionFilters>) => void;
  resetFilters: () => void;

  // Vue active
  viewMode: "list" | "map";
  setViewMode: (m: "list" | "map") => void;

  // Modal candidature
  applyModalMissionUlid: string | null;
  openApplyModal: (ulid: string) => void;
  closeApplyModal: () => void;

  // Modal évaluation
  reviewModalMission: {
    ulid: string;
    revieweeId?: number;
    direction: "author_to_applicant" | "applicant_to_author";
  } | null;
  openReviewModal: (payload: MissionStore["reviewModalMission"]) => void;
  closeReviewModal: () => void;
}

const DEFAULT_FILTERS: MissionFilters = { radius_km: 25, sort: "recent" };

export const useMissionStore = create<MissionStore>((set) => ({
  filters: DEFAULT_FILTERS,
  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  viewMode: "list",
  setViewMode: (m) => set({ viewMode: m }),

  applyModalMissionUlid: null,
  openApplyModal: (ulid) => set({ applyModalMissionUlid: ulid }),
  closeApplyModal: () => set({ applyModalMissionUlid: null }),

  reviewModalMission: null,
  openReviewModal: (payload) => set({ reviewModalMission: payload }),
  closeReviewModal: () => set({ reviewModalMission: null }),
}));

// ============================================================
// hooks/missions/useMissions.ts
// Hooks TanStack Query (lecture) — s'appuient sur missionService
// ============================================================

import { useQuery } from "@tanstack/react-query";
import { missionService } from "@/services/mission/mission.service";
import { applicationService } from "@/services/mission/application.service";
import { MissionFilters } from "@/lib/missions/types";

export function useMissions(filters: MissionFilters) {
  return useQuery({
    queryKey: ["missions", filters],
    queryFn: () => missionService.list(filters),
    staleTime: 1000 * 60 * 2, // 2 min
  });
}

export function useMission(ulid: string) {
  return useQuery({
    queryKey: ["mission", ulid],
    queryFn: () => missionService.getByUlid(ulid),
    enabled: !!ulid,
    staleTime: 1000 * 60,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["mission-categories"],
    queryFn: async () => ({ data: await missionService.categories() }),
    staleTime: 1000 * 60 * 60, // 1h (catégories stables)
  });
}

export function useMissionMapPoints(lat?: number, lng?: number, radiusKm = 50) {
  return useQuery({
    queryKey: ["mission-map", lat, lng, radiusKm],
    queryFn: () =>
      missionService.mapPoints(lat as number, lng as number, radiusKm),
    enabled: lat !== undefined && lng !== undefined,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMyMissions(params?: { status?: string; per_page?: number }) {
  return useQuery({
    queryKey: ["my-missions", params],
    queryFn: () => missionService.myMissions(params),
  });
}

export function useMyApplications(params?: {
  status?: string;
  per_page?: number;
}) {
  return useQuery({
    queryKey: ["my-applications", params],
    queryFn: () => applicationService.myApplications(params),
  });
}

export function useMissionApplications(
  ulid: string,
  params?: { status?: string; per_page?: number },
) {
  return useQuery({
    queryKey: ["mission-applications", ulid, params],
    queryFn: () => applicationService.listForMission(ulid, params),
    enabled: !!ulid,
  });
}

export function useMissionReviews(ulid: string) {
  return useQuery({
    queryKey: ["mission-reviews", ulid],
    queryFn: () => applicationService.listReviews(ulid),
    enabled: !!ulid,
  });
}

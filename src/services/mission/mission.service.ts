// ============================================================
// services/mission.service.ts
// Couche d'accès API pure (sans React/TanStack) pour les missions.
// Les hooks (hooks/missions/*) consomment ce service.
// ============================================================

import api from "@/lib/axios";
import {
  Mission,
  MissionCategory,
  MissionFilters,
  MissionMapPoint,
  PaginatedResponse,
} from "@/lib/missions/types";

export const missionService = {
  /**
   * GET /missions — liste paginée avec filtres
   */
  async list(filters: MissionFilters): Promise<PaginatedResponse<Mission>> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== ""),
    );
    const { data } = await api.get<PaginatedResponse<Mission>>("/missions", {
      params,
    });
    return data;
  },

  /**
   * GET /missions/{ulid} — détail complet
   */
  async getByUlid(ulid: string): Promise<Mission> {
    const { data } = await api.get<{ data: Mission }>(`/missions/${ulid}`);
    return data.data;
  },

  /**
   * POST /missions — créer (FormData : champs + JSON arrays sérialisés)
   */
  async create(payload: FormData): Promise<Mission> {
    const { data } = await api.post<{ data: Mission }>("/missions", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data.data;
  },

  /**
   * PUT /missions/{ulid} — mettre à jour
   */
  async update(ulid: string, payload: FormData): Promise<Mission> {
    const { data } = await api.put<{ data: Mission }>(
      `/missions/${ulid}`,
      payload,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data.data;
  },

  /**
   * PATCH /missions/{ulid}/status — changer le statut
   */
  async updateStatus(ulid: string, status: string): Promise<Mission> {
    const { data } = await api.patch<{ data: Mission }>(
      `/missions/${ulid}/status`,
      { status },
    );
    return data.data;
  },

  /**
   * DELETE /missions/{ulid}
   */
  async remove(ulid: string): Promise<void> {
    await api.delete(`/missions/${ulid}`);
  },

  /**
   * GET /missions/map — points pour la carte interactive
   */
  async mapPoints(
    lat: number,
    lng: number,
    radiusKm = 50,
  ): Promise<MissionMapPoint[]> {
    const { data } = await api.get<{ data: MissionMapPoint[] }>(
      "/missions/map",
      {
        params: { lat, lng, radius_km: radiusKm },
      },
    );
    return data.data;
  },

  /**
   * GET /missions/categories
   */
  async categories(): Promise<MissionCategory[]> {
    const { data } = await api.get<{ data: MissionCategory[] }>(
      "/missions/categories",
    );
    return data.data;
  },

  /**
   * GET /missions/my — mes missions publiées (auteur)
   */
  async myMissions(params?: {
    status?: string;
    per_page?: number;
  }): Promise<PaginatedResponse<Mission>> {
    const { data } = await api.get<PaginatedResponse<Mission>>("/missions/my", {
      params,
    });
    return data;
  },

  /**
   * POST /missions/{ulid}/view — enregistrer une vue (fire-and-forget)
   */
  async recordView(ulid: string): Promise<void> {
    await api.post(`/missions/${ulid}/view`);
  },
};

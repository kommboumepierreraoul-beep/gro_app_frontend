// ============================================================
// services/application.service.ts
// Couche d'accès API pure pour les candidatures et évaluations.
// ============================================================

import api from "@/lib/axios";
import {
  MissionApplication,
  MissionApplicationsResponse,
  MissionReview,
  PaginatedResponse,
} from "@/lib/missions/types";

export const applicationService = {
  /**
   * POST /applications — postuler à une mission
   * payload : FormData { mission_ulid, method, form_responses (JSON), motivation, attachments[] }
   */
  async apply(
    payload: FormData,
  ): Promise<{ message: string; data: MissionApplication }> {
    const { data } = await api.post("/applications", payload, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  /**
   * GET /applications/my — mes candidatures (côté candidat)
   */
  async myApplications(params?: {
    status?: string;
    per_page?: number;
  }): Promise<PaginatedResponse<MissionApplication>> {
    const { data } = await api.get<PaginatedResponse<MissionApplication>>(
      "/applications/my",
      { params },
    );
    return data;
  },

  /**
   * DELETE /applications/{id} — retirer sa candidature
   */
  async withdraw(id: number): Promise<void> {
    await api.delete(`/applications/${id}`);
  },

  /**
   * GET /missions/{ulid}/applications — liste des candidats (côté auteur)
   */
  async listForMission(
    ulid: string,
    params?: { status?: string; per_page?: number },
  ): Promise<MissionApplicationsResponse> {
    const { data } = await api.get<MissionApplicationsResponse>(
      `/missions/${ulid}/applications`,
      { params },
    );
    return data;
  },

  /**
   * PATCH /missions/{ulid}/applications/{appId}/accept
   */
  async accept(ulid: string, appId: number): Promise<MissionApplication> {
    const { data } = await api.patch(
      `/missions/${ulid}/applications/${appId}/accept`,
    );
    return data.data;
  },

  /**
   * PATCH /missions/{ulid}/applications/{appId}/reject
   */
  async reject(
    ulid: string,
    appId: number,
    reason?: string,
  ): Promise<MissionApplication> {
    const { data } = await api.patch(
      `/missions/${ulid}/applications/${appId}/reject`,
      { reason },
    );
    return data.data;
  },

  /**
   * PATCH /missions/{ulid}/applications/{appId}/note — note interne auteur
   */
  async addNote(ulid: string, appId: number, note: string): Promise<void> {
    await api.patch(`/missions/${ulid}/applications/${appId}/note`, { note });
  },

  /**
   * GET /missions/{ulid}/reviews
   */
  async listReviews(ulid: string): Promise<MissionReview[]> {
    const { data } = await api.get<{ data: MissionReview[] }>(
      `/missions/${ulid}/reviews`,
    );
    return data.data;
  },

  /**
   * POST /missions/{ulid}/reviews — soumettre une évaluation
   */
  async submitReview(
    ulid: string,
    payload: {
      rating: number;
      comment?: string;
      direction: "author_to_applicant" | "applicant_to_author";
      reviewee_id?: number;
    },
  ): Promise<MissionReview> {
    const { data } = await api.post(`/missions/${ulid}/reviews`, payload);
    return data.data;
  },
};

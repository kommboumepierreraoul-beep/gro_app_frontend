/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// hooks/missions/useMissionMutations.ts
// Hooks TanStack Query (écriture) — s'appuient sur les services
// ============================================================

import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { missionService } from "@/services/mission/mission.service";
import { applicationService } from "@/services/mission/application.service";

// ── Missions ──────────────────────────────────────────────────────────────

export function useCreateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => missionService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
      toast.success("Mission publiée avec succès !");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Erreur lors de la création.",
      );
    },
  });
}

export function useUpdateMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ulid, payload }: { ulid: string; payload: FormData }) =>
      missionService.update(ulid, payload),
    onSuccess: (mission) => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["mission", mission.ulid] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
      toast.success("Mission mise à jour.");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Erreur lors de la mise à jour.",
      );
    },
  });
}

export function useUpdateMissionStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ulid, status }: { ulid: string; status: string }) =>
      missionService.updateStatus(ulid, status),
    onSuccess: (mission) => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["mission", mission.ulid] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
      toast.success("Statut mis à jour.");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Transition de statut impossible.",
      );
    },
  });
}

export function useDeleteMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ulid: string) => missionService.remove(ulid),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
      toast.success("Mission supprimée.");
    },
  });
}

// ── Candidatures ──────────────────────────────────────────────────────────

export function useApplyToMission() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => applicationService.apply(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Erreur lors de la candidature.",
      );
    },
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => applicationService.withdraw(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["missions"] });
      toast.success("Candidature retirée.");
    },
  });
}

export function useAcceptApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ulid, appId }: { ulid: string; appId: number }) =>
      applicationService.accept(ulid, appId),
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: ["mission-applications", ulid] });
      qc.invalidateQueries({ queryKey: ["mission", ulid] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
      toast.success("Candidature acceptée !");
    },
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ulid,
      appId,
      reason,
    }: {
      ulid: string;
      appId: number;
      reason?: string;
    }) => applicationService.reject(ulid, appId, reason),
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: ["mission-applications", ulid] });
      toast.success("Candidature refusée.");
    },
  });
}

export function useAddApplicationNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ulid,
      appId,
      note,
    }: {
      ulid: string;
      appId: number;
      note: string;
    }) => applicationService.addNote(ulid, appId, note),
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: ["mission-applications", ulid] });
      toast.success("Note enregistrée.");
    },
  });
}

// ── Évaluations ───────────────────────────────────────────────────────────

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      ulid,
      ...payload
    }: {
      ulid: string;
      rating: number;
      comment?: string;
      direction: "author_to_applicant" | "applicant_to_author";
      reviewee_id?: number;
    }) => applicationService.submitReview(ulid, payload),
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: ["mission", ulid] });
      qc.invalidateQueries({ queryKey: ["mission-reviews", ulid] });
      toast.success("Évaluation soumise, merci !");
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message ?? "Erreur lors de l'évaluation.",
      );
    },
  });
}

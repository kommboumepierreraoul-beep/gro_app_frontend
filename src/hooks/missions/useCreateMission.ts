/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { Mission, MissionApplication } from "@/lib/missions/types";
import toast from "react-hot-toast";

export function useCreateMission() {
  const qc = useQueryClient();
  return useMutation<Mission, Error, FormData>({
    mutationFn: async (payload: FormData) => {
      const { data } = await api.post<{ data: Mission }>("/missions", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.data;
    },
    onSuccess: (mission) => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
      toast.success("Mission publiée avec succès !");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message ?? "Erreur lors de la création.";
      toast.error(msg);
    },
  });
}

export function useUpdateMission() {
  const qc = useQueryClient();
  return useMutation<Mission, Error, { ulid: string; payload: FormData }>({
    mutationFn: async ({
      ulid,
      payload,
    }: {
      ulid: string;
      payload: FormData;
    }) => {
      const { data } = await api.put<{ data: Mission }>(
        `/missions/${ulid}`,
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return data.data;
    },
    onSuccess: (mission) => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["mission", mission.ulid] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
      toast.success("Mission mise à jour.");
    },
  });
}

export function useUpdateMissionStatus() {
  const qc = useQueryClient();
  return useMutation<Mission, Error, { ulid: string; status: string }>({
    mutationFn: async ({ ulid, status }: { ulid: string; status: string }) => {
      const { data } = await api.patch<{ data: Mission }>(
        `/missions/${ulid}/status`,
        { status },
      );
      return data.data;
    },
    onSuccess: (mission) => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["mission", mission.ulid] });
      qc.invalidateQueries({ queryKey: ["my-missions"] });
    },
  });
}

export function useApplyToMission() {
  const qc = useQueryClient();
  return useMutation<any, Error, FormData>({
    mutationFn: async (payload: FormData) => {
      const { data } = await api.post("/applications", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["missions"] });
      qc.invalidateQueries({ queryKey: ["my-applications"] });
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ?? "Erreur lors de la candidature.";
      toast.error(msg);
    },
  });
}

export function useWithdrawApplication() {
  const qc = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: async (id: number) => {
      await api.delete(`/applications/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-applications"] });
      qc.invalidateQueries({ queryKey: ["missions"] });
      toast.success("Candidature retirée.");
    },
  });
}

export function useAcceptApplication() {
  const qc = useQueryClient();
  return useMutation<any, Error, { ulid: string; appId: number }>({
    mutationFn: async ({ ulid, appId }: { ulid: string; appId: number }) => {
      const { data } = await api.patch(
        `/missions/${ulid}/applications/${appId}/accept`,
      );
      return data;
    },
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: ["mission-applications", ulid] });
      qc.invalidateQueries({ queryKey: ["mission", ulid] });
      toast.success("Candidature acceptée !");
    },
  });
}

export function useRejectApplication() {
  const qc = useQueryClient();
  return useMutation<
    any,
    Error,
    {
      ulid: string;
      appId: number;
      reason?: string;
    }
  >({
    mutationFn: async ({
      ulid,
      appId,
      reason,
    }: {
      ulid: string;
      appId: number;
      reason?: string;
    }) => {
      const { data } = await api.patch(
        `/missions/${ulid}/applications/${appId}/reject`,
        { reason },
      );
      return data;
    },
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: ["mission-applications", ulid] });
      toast.success("Candidature refusée.");
    },
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation<
    any,
    Error,
    {
      ulid: string;
      rating: number;
      comment?: string;
      direction: string;
      reviewee_id?: number;
    }
  >({
    mutationFn: async ({
      ulid,
      ...payload
    }: {
      ulid: string;
      rating: number;
      comment?: string;
      direction: string;
      reviewee_id?: number;
    }) => {
      const { data } = await api.post(`/missions/${ulid}/reviews`, payload);
      return data;
    },
    onSuccess: (_, { ulid }) => {
      qc.invalidateQueries({ queryKey: ["mission", ulid] });
      toast.success("Évaluation soumise, merci !");
    },
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from "react";
import { moderationService } from "@/services/moderation/moderation.service";
import {
  ModerationStats,
  ModerationActionRequest,
  ReportRequest,
  ModerationQueueParams,
} from "@/types/moderation";
import { toast } from "react-hot-toast";

export function useModeration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = useCallback(
    async (
      type: "post" | "comment" | "message",
      id: number,
      data: ModerationActionRequest,
    ) => {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (type) {
          case "post":
            response = await moderationService.moderatePost(id, data);
            break;
        }
        toast.success(
          `Contenu ${data.action === "approve" ? "approuvé" : data.action === "reject" ? "rejeté" : "mis en révision"}`,
        );
        return response;
      } catch (err: any) {
        const message =
          err.response?.data?.error || err.message || "Une erreur est survenue";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleReanalyze = useCallback(
    async (type: "post" | "comment" | "message", id: number) => {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (type) {
          case "post":
            response = await moderationService.reanalyzePost(id);
            break;
        }
        toast.success("Réanalyse en cours...");
        return response;
      } catch (err: any) {
        const message =
          err.response?.data?.error || err.message || "Une erreur est survenue";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const createReport = useCallback(async (data: ReportRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await moderationService.createReport(data);
      toast.success("Signalement envoyé");
      return response;
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Une erreur est survenue";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStats = useCallback(async (): Promise<ModerationStats | null> => {
    setLoading(true);
    setError(null);
    try {
      return await moderationService.getStats();
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Une erreur est survenue";
      setError(message);
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const testModeration = useCallback(async (content: string, image?: File) => {
    setLoading(true);
    setError(null);
    try {
      const result = await moderationService.testModeration(content, image);
      return result;
    } catch (err: any) {
      const message =
        err.response?.data?.error || err.message || "Une erreur est survenue";
      setError(message);
      toast.error(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getQueue = useCallback(
    async (
      type: "posts" | "comments" | "messages",
      params: ModerationQueueParams = {},
    ) => {
      setLoading(true);
      setError(null);
      try {
        let response;
        switch (type) {
          case "posts":
            response = await moderationService.getQueuePosts(params);
            break;
        }
        return response;
      } catch (err: any) {
        const message =
          err.response?.data?.error || err.message || "Une erreur est survenue";
        setError(message);
        toast.error(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    loading,
    error,
    moderate: handleAction,
    reanalyze: handleReanalyze,
    report: createReport,
    getStats,
    testModeration,
    getQueue,
    service: moderationService,
  };
}

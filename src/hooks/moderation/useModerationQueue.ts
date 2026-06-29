/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect, useCallback } from "react";
import { moderationService } from "@/services/moderation/moderation.service";
import { ModerationQueueParams } from "@/types/moderation";

export function useModerationQueue(type: "posts") {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState<ModerationQueueParams>({
    page: 1,
    per_page: 20,
  });

  /**
   * Chargement de la file de modération
   */
  const loadQueue = useCallback(
    async (currentParams: ModerationQueueParams = params) => {
      setLoading(true);
      setError(null);

      try {
        let response;

        switch (type) {
          case "posts":
            response = await moderationService.getQueuePosts(currentParams);
            break;

          default:
            throw new Error("Type de modération non supporté.");
        }

        setData(response.data);
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Une erreur est survenue.",
        );
      } finally {
        setLoading(false);
      }
    },
    [type, params],
  );

  /**
   * Chargement automatique
   */
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      if (cancelled) return;

      setLoading(true);
      setError(null);

      try {
        let response;

        switch (type) {
          case "posts":
            response = await moderationService.getQueuePosts(params);
            break;

          default:
            throw new Error("Type de modération non supporté.");
        }

        if (!cancelled) {
          setData(response.data);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(
            err?.response?.data?.error ||
              err?.message ||
              "Une erreur est survenue.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [type, params]);

  /**
   * Rafraîchir les données
   */
  const refresh = useCallback(async () => {
    await loadQueue();
  }, [loadQueue]);

  /**
   * Mise à jour des paramètres
   */
  const updateParams = useCallback(
    (newParams: Partial<ModerationQueueParams>) => {
      setParams((prev) => ({
        ...prev,
        ...newParams,
      }));
    },
    [],
  );

  /**
   * Validation / rejet
   */
  const handleAction = useCallback(
    async (
      id: number,
      action: "approve" | "reject" | "review",
      reason?: string,
    ) => {
      try {
        switch (type) {
          case "posts":
            await moderationService.moderatePost(id, {
              action,
              reason,
            });
            break;

          default:
            return false;
        }

        await loadQueue();

        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    },
    [type, loadQueue],
  );

  return {
    data,
    loading,
    error,
    params,
    updateParams,
    refresh,
    handleAction,
  };
}

import { useState, useEffect, useCallback } from "react";
import { moderationService } from "@/services/moderation/moderation.service";
import { ModerationQueueParams } from "@/types/moderation";

export function useModerationQueue(type: "posts" | "comments" | "messages") {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<ModerationQueueParams>({
    page: 1,
    per_page: 20,
  });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let response;
      switch (type) {
        case "posts":
          response = await moderationService.getQueuePosts(params);
          break;
        case "comments":
          response = await moderationService.getQueueComments(params);
          break;
        case "messages":
          response = await moderationService.getQueueMessages(params);
          break;
      }
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, [type, params]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const refresh = useCallback(() => {
    fetchQueue();
  }, [fetchQueue]);

  const updateParams = useCallback(
    (newParams: Partial<ModerationQueueParams>) => {
      setParams((prev) => ({ ...prev, ...newParams }));
    },
    [],
  );

  const handleAction = useCallback(
    async (
      id: number,
      action: "approve" | "reject" | "review",
      reason?: string,
    ) => {
      const serviceMap = {
        posts: moderationService.moderatePost,
        comments: moderationService.moderateComment,
        messages: moderationService.moderateMessage,
      };

      const service = serviceMap[type];
      if (!service) return;

      try {
        await service(id, { action, reason });
        await fetchQueue();
        return true;
      } catch (err) {
        return false;
      }
    },
    [type, fetchQueue],
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

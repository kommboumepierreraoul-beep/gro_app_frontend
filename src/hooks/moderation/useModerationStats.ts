import { useState, useEffect, useCallback } from "react";
import { moderationService } from "@/services/moderation/moderation.service";
import { ModerationStats } from "@/types/moderation";

export function useModerationStats() {
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await moderationService.getStats();
      setStats(response);
    } catch (err: any) {
      setError(err.response?.data?.error || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = useCallback(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}

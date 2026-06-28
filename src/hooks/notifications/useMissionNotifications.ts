/* eslint-disable @typescript-eslint/no-explicit-any */
// ============================================================
// hooks/notifications/useMissionNotifications.ts
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { missionNotificationService } from "@/services/mission/notification.service";
import {
  MissionNotification,
  MissionNotificationFilters,
  MissionNotificationType,
} from "@/lib/missions/notification.type";
import toast from "react-hot-toast";

export function useMissionNotifications(params?: MissionNotificationFilters) {
  const queryClient = useQueryClient();

  // ── Récupérer toutes les notifications ─────────────────────────────────────
  const query = useQuery({
    queryKey: ["mission-notifications", params],
    queryFn: () => missionNotificationService.list(params),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // ── Récupérer le nombre de notifications non lues ─────────────────────────
  const unreadCountQuery = useQuery({
    queryKey: ["mission-notifications-unread-count"],
    queryFn: () => missionNotificationService.unreadCount(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // ── Récupérer les notifications non lues ──────────────────────────────────
  const unreadQuery = useQuery({
    queryKey: ["mission-notifications-unread"],
    queryFn: () => missionNotificationService.unread(),
    refetchInterval: 30000,
    staleTime: 15000,
  });

  // ── Marquer une notification comme lue ────────────────────────────────────
  const markAsRead = useMutation({
    mutationFn: (id: string | number) =>
      missionNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["mission-notifications-unread"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mission-notifications-unread-count"],
      });
    },
    onError: (error: any) => {
      toast.error("Erreur lors du marquage de la notification");
      console.error("Mark as read error:", error);
    },
  });

  // ── Marquer toutes les notifications comme lues ──────────────────────────
  const markAllAsRead = useMutation({
    mutationFn: () => missionNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["mission-notifications-unread"],
      });
      queryClient.invalidateQueries({
        queryKey: ["mission-notifications-unread-count"],
      });
      toast.success("Toutes les notifications ont été marquées comme lues");
    },
    onError: (error: any) => {
      toast.error("Erreur lors du marquage des notifications");
      console.error("Mark all as read error:", error);
    },
  });

  // ── Supprimer une notification ────────────────────────────────────────────
  const remove = useMutation({
    mutationFn: (id: string | number) => missionNotificationService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["mission-notifications-unread-count"],
      });
      toast.success("Notification supprimée");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression");
      console.error("Delete notification error:", error);
    },
  });

  // ── Supprimer toutes les notifications ────────────────────────────────────
  const clearAll = useMutation({
    mutationFn: () => missionNotificationService.clearAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["mission-notifications-unread-count"],
      });
      toast.success("Toutes les notifications ont été supprimées");
    },
    onError: (error: any) => {
      toast.error("Erreur lors de la suppression");
      console.error("Clear all error:", error);
    },
  });

  return {
    // ✅ Toujours retourner un tableau, même en cas d'erreur
    notifications: query.data?.data ?? [],
    unreadCount: unreadCountQuery.data ?? 0,
    unreadNotifications: unreadQuery.data?.data ?? [],
    isLoading: query.isLoading || unreadCountQuery.isLoading,
    isError: query.isError || unreadCountQuery.isError,

    // Meta
    meta: query.data?.meta,

    // Actions
    markAsRead: markAsRead.mutate,
    markAsReadLoading: markAsRead.isPending,
    markAllAsRead: markAllAsRead.mutate,
    markAllAsReadLoading: markAllAsRead.isPending,
    remove: remove.mutate,
    removeLoading: remove.isPending,
    clearAll: clearAll.mutate,
    clearAllLoading: clearAll.isPending,

    // Refetch
    refetch: query.refetch,
    refetchUnreadCount: unreadCountQuery.refetch,
    refetchUnread: unreadQuery.refetch,
  };
}

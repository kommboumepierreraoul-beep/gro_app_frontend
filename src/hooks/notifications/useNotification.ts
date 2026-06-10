// ============================================================
// hooks/notifications/useNotifications.ts
// Hooks pour le centre de notifications in-app GRO
// ============================================================

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/mission/notification.service";

export function useNotifications(params?: {
  per_page?: number;
  page?: number;
}) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => notificationService.list(params),
    refetchInterval: 1000 * 60, // refresh toutes les minutes
  });
}

export function useUnreadNotifications() {
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => notificationService.unread(),
    refetchInterval: 1000 * 30,
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => notificationService.unreadCount(),
    refetchInterval: 1000 * 30,
  });
}

export function useMarkNotificationAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useMarkAllNotificationsAsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread-count"] });
    },
  });
}

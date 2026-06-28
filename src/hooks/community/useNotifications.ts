/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "@/services/community/notification.service";
import { useCommunityStore } from "@/stores/community.store";

export function useNotifications() {
  const queryClient = useQueryClient();
  const setUnreadNotifs = useCommunityStore((s) => s.setUnreadNotifs);

  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const result = await notificationService.getNotifications();
      setUnreadNotifs(result.data?.unread_count ?? 0);
      return result;
    },
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  const markAllRead = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      setUnreadNotifs(0);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  const deleteNotif = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["notifications-unread-count"],
      });
    },
  });

  return {
    notifications: query.data?.data?.data ?? [],
    unreadCount: query.data?.data?.unread_count ?? 0,
    isLoading: query.isLoading,
    markAsRead: markAsRead.mutate,
    markAllRead: markAllRead.mutate,
    markAllReadLoading: markAllRead.isPending, // ✅ Ajout du loading
    deleteNotif: deleteNotif.mutate,
    deleteNotifLoading: deleteNotif.isPending,
    refetch: query.refetch,
  };
}

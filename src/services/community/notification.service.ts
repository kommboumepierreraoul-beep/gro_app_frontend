import api from "@/lib/axios"; // ✅ instance avec token

class NotificationService {
  async getNotifications() {
    try {
      // ✅ /community/notifications
      const response = await api.get(`/community/notifications`);
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      throw error;
    }
  }

  async markAsRead(notificationId: string) {
    try {
      // ✅ /community/notifications/{id}/read
      const response = await api.post(
        `/community/notifications/${notificationId}/read`,
      );
      return response.data;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }

  async markAllAsRead() {
    try {
      // ✅ /community/notifications/read-all
      const response = await api.post(`/community/notifications/read-all`);
      return response.data;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }

  async deleteNotification(notificationId: string) {
    try {
      // ✅ /community/notifications/{id}
      const response = await api.delete(
        `/community/notifications/${notificationId}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  }
  // SERVICE
  notifService = {
    getAll: async (): Promise<{
      data: Notification[];
      unread_count: number;
    }> => {
      const r = await api.get("/community/notifications");
      return {
        data: r.data.data?.data ?? r.data.data ?? [],
        unread_count: r.data.unread_count ?? 0,
      };
    },
    markRead: (id: number) => api.post(`/community/notifications/${id}/read`),
    markAllRead: () => api.post("/community/notifications/read-all"),
    remove: (id: number) => api.delete(`/community/notifications/${id}`),
  };
}

export const notificationService = new NotificationService();

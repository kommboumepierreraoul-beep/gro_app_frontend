// ============================================================
// services/mission/notification.service.ts
// ============================================================

import api from "@/lib/axios";
import {
  MissionNotification,
  MissionNotificationsResponse,
  MissionNotificationFilters,
  MissionNotificationType,
} from "@/lib/missions/notification.type";

export const missionNotificationService = {
  /**
   * GET /community/notifications/missions — Toutes les notifications missions
   */
  async list(
    params?: MissionNotificationFilters,
  ): Promise<MissionNotificationsResponse> {
    try {
      const { data } = await api.get<{
        success: boolean;
        data: {
          data: MissionNotification[];
          current_page: number;
          last_page: number;
          total: number;
          per_page: number;
        };
        unread_count?: number;
      }>("/community/notifications/missions", { params });

      // ✅ Normaliser la réponse
      return {
        data: data.data?.data ?? [],
        meta: {
          current_page: data.data?.current_page ?? 1,
          last_page: data.data?.last_page ?? 1,
          total: data.data?.total ?? 0,
          per_page: data.data?.per_page ?? 20,
        },
        unread_count: data.unread_count ?? 0,
      };
    } catch (error) {
      console.error("Error fetching mission notifications:", error);
      return {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 20,
        },
        unread_count: 0,
      };
    }
  },

  /**
   * GET /community/notifications/missions/unread — Notifications non lues
   */
  async unread(): Promise<MissionNotificationsResponse> {
    try {
      const { data } = await api.get<{
        success: boolean;
        data: MissionNotification[];
      }>("/community/notifications/missions/unread");

      return {
        data: data.data ?? [],
        meta: {
          current_page: 1,
          last_page: 1,
          total: data.data?.length ?? 0,
          per_page: data.data?.length ?? 0,
        },
        unread_count: data.data?.length ?? 0,
      };
    } catch (error) {
      console.error("Error fetching unread mission notifications:", error);
      return {
        data: [],
        meta: {
          current_page: 1,
          last_page: 1,
          total: 0,
          per_page: 20,
        },
        unread_count: 0,
      };
    }
  },

  /**
   * GET /community/notifications/missions/unread-count — Compteur
   */
  async unreadCount(): Promise<number> {
    try {
      const { data } = await api.get<{ success: boolean; count: number }>(
        "/community/notifications/missions/unread-count",
      );
      return data.count ?? 0;
    } catch (error) {
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  /**
   * POST /community/notifications/{id}/read — Marquer comme lue
   */
  async markAsRead(id: string | number): Promise<void> {
    try {
      await api.post(`/community/notifications/${id}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  /**
   * POST /community/notifications/read-all — Tout marquer comme lu
   */
  async markAllAsRead(): Promise<void> {
    try {
      await api.post("/community/notifications/read-all");
    } catch (error) {
      console.error("Error marking all as read:", error);
      throw error;
    }
  },

  /**
   * DELETE /community/notifications/{id} — Supprimer une notification
   */
  async remove(id: string | number): Promise<void> {
    try {
      await api.delete(`/community/notifications/${id}`);
    } catch (error) {
      console.error("Error deleting notification:", error);
      throw error;
    }
  },

  /**
   * DELETE /community/notifications — Supprimer toutes les notifications
   */
  async clearAll(): Promise<void> {
    try {
      await api.delete("/community/notifications");
    } catch (error) {
      console.error("Error clearing notifications:", error);
      throw error;
    }
  },

  /**
   * Construire l'URL de redirection
   */
  resolveUrl(notification: MissionNotification): string {
    if (notification.data?.url) return notification.data.url;

    if (notification.data?.mission_ulid) {
      const missionUrl = `/missions/${notification.data.mission_ulid}`;

      const type = notification.type as MissionNotificationType;
      switch (type) {
        case "new_application":
        case "application_accepted":
        case "application_rejected":
        case "application_withdrawn":
          return `${missionUrl}/applications`;
        case "mission_reminder":
        case "mission_updated":
        case "new_mission":
        case "mission_filled":
        case "mission_cancelled":
        case "mission_report":
          return missionUrl;
        case "mission_completed":
        case "review_request":
          return `${missionUrl}/review`;
        default:
          return missionUrl;
      }
    }

    return "/missions";
  },

  /**
   * Libellé pour un type de notification
   */
  labelFor(type: MissionNotificationType): string {
    const labels: Record<MissionNotificationType, string> = {
      new_mission: "Nouvelle mission",
      new_application: "Nouvelle candidature",
      application_accepted: "Candidature acceptée",
      application_rejected: "Candidature refusée",
      application_withdrawn: "Candidature retirée",
      mission_reminder: "Rappel de mission",
      mission_updated: "Mission mise à jour",
      mission_completed: "Mission terminée",
      mission_filled: "Mission pourvue",
      mission_cancelled: "Mission annulée",
      review_request: "Demande d'avis",
      mission_report: "Mission signalée",
    };
    return labels[type] ?? "Notification";
  },

  /**
   * Icône pour un type de notification
   */
  iconFor(type: MissionNotificationType): string {
    const icons: Record<MissionNotificationType, string> = {
      new_mission: "📋",
      new_application: "📩",
      application_accepted: "✅",
      application_rejected: "❌",
      application_withdrawn: "↩️",
      mission_reminder: "⏰",
      mission_updated: "✏️",
      mission_completed: "🏁",
      mission_filled: "👥",
      mission_cancelled: "🚫",
      review_request: "⭐",
      mission_report: "🚩",
    };
    return icons[type] ?? "🔔";
  },
};

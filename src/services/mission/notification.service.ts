// ============================================================
// services/notification.service.ts
// Couche d'accès API pour le centre de notifications in-app GRO.
// Repose sur les routes natives Laravel notifications (database channel).
// ============================================================

import api from "@/lib/axios";

export interface AppNotification {
  id: string; // UUID Laravel
  type: string; // ex: 'new_mission', 'application_accepted', 'mission_reminder', ...
  data: {
    type: string;
    title?: string;
    body?: string;
    message?: string;
    mission_ulid?: string;
    mission_title?: string;
    url?: string;
    [key: string]: unknown;
  };
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  data: AppNotification[];
  meta?: { current_page: number; last_page: number; total: number };
  unread_count?: number;
}

export const notificationService = {
  /**
   * GET /user/notifications — toutes les notifications (paginées)
   */
  async list(params?: {
    per_page?: number;
    page?: number;
  }): Promise<NotificationsResponse> {
    const { data } = await api.get<NotificationsResponse>(
      "/user/notifications",
      { params },
    );
    return data;
  },

  /**
   * GET /user/notifications/unread — notifications non lues uniquement
   */
  async unread(): Promise<NotificationsResponse> {
    const { data } = await api.get<NotificationsResponse>(
      "/user/notifications/unread",
    );
    return data;
  },

  /**
   * GET /user/notifications/unread-count — compteur pour badge
   */
  async unreadCount(): Promise<number> {
    const { data } = await api.get<{ count: number }>(
      "/user/notifications/unread-count",
    );
    return data.count;
  },

  /**
   * POST /user/notifications/{id}/read — marquer comme lue
   */
  async markAsRead(id: string): Promise<void> {
    await api.post(`/user/notifications/${id}/read`);
  },

  /**
   * POST /user/notifications/read-all — tout marquer comme lu
   */
  async markAllAsRead(): Promise<void> {
    await api.post("/user/notifications/read-all");
  },

  /**
   * DELETE /user/notifications/{id}
   */
  async remove(id: string): Promise<void> {
    await api.delete(`/user/notifications/${id}`);
  },

  /**
   * Construire l'URL de redirection à partir d'une notification
   * (fallback si data.url n'est pas fourni par le backend)
   */
  resolveUrl(notification: AppNotification): string {
    if (notification.data.url) return notification.data.url;

    if (notification.data.mission_ulid) {
      switch (notification.data.type) {
        case "new_application":
          return `/missions/${notification.data.mission_ulid}/applications`;
        default:
          return `/missions/${notification.data.mission_ulid}`;
      }
    }

    return "/missions";
  },

  /**
   * Libellé lisible pour un type de notification
   */
  labelFor(type: string): string {
    const labels: Record<string, string> = {
      new_mission: "Nouvelle mission",
      new_application: "Nouvelle candidature",
      application_accepted: "Candidature acceptée",
      application_rejected: "Candidature refusée",
      mission_reminder: "Rappel de mission",
      mission_updated: "Mission mise à jour",
    };
    return labels[type] ?? "Notification";
  },
};

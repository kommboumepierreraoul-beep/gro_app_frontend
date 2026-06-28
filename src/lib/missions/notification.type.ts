// ============================================================
// lib/missions/notification.type.ts
// ============================================================

export type MissionNotificationType =
  | "new_mission"
  | "new_application"
  | "application_accepted"
  | "application_rejected"
  | "application_withdrawn"
  | "mission_reminder"
  | "mission_updated"
  | "mission_completed"
  | "mission_filled"
  | "mission_cancelled"
  | "review_request"
  | "mission_report";

export interface MissionNotificationData {
  type: MissionNotificationType;
  title?: string;
  body?: string;
  message?: string;
  mission_ulid?: string;
  mission_title?: string;
  mission_id?: number;
  application_id?: number;
  url?: string;
  reviewer_id?: number;
  reviewer_name?: string;
  [key: string]: unknown;
}

export interface MissionNotification {
  id: string | number;
  type: MissionNotificationType | string;
  data: MissionNotificationData;
  read_at: string | null;
  is_read: boolean;
  created_at: string;
  updated_at?: string;
  actor?: {
    id: number;
    firstname: string;
    lastname: string;
    avatar?: string | null;
  };
  message?: string;
}

export interface MissionNotificationsResponse {
  data: MissionNotification[];
  meta?: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  unread_count?: number;
}

export interface MissionNotificationFilters {
  per_page?: number;
  page?: number;
  type?: MissionNotificationType;
  read?: boolean;
}

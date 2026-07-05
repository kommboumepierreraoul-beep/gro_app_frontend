// ============================================================
// lib/missions/types.ts
// ============================================================

export type MissionStatus =
  | "draft"
  | "published"
  | "filled"
  | "in_progress"
  | "completed"
  | "archived"
  | "suspended"
  | "cancelled";

export type ApplicationStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "withdrawn"
  | "confirmed";

export type RemunerationType =
  | "fixed"
  | "daily_rate"
  | "hourly_rate"
  | "negotiable"
  | "in_kind"
  | "volunteer";

export type DurationType = "hours" | "day" | "days" | "weeks" | "flexible";

export type ContactMethodType =
  | "app_message"
  | "whatsapp"
  | "email"
  | "instagram"
  | "facebook";

export type FormFieldType =
  | "text"
  | "textarea"
  | "boolean"
  | "select"
  | "number";

export interface ContactMethod {
  type: ContactMethodType;
  value?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: FormFieldType;
  required: boolean;
  options?: string[];
}

export interface MissionCategory {
  id: number;
  name: string;
  slug: string;
  icon: string;
  color: string;
  sort_order: number;
  missions_count?: number;
}

export interface MissionAuthor {
  id: number;
  name?: string | null;
  firstname?: string;
  lastname?: string;
  email?: string;
  avatar?: string | null;
  bio?: string;
  email_verified_at?: string | null;
  created_at?: string;
  rating?: number;
}

export interface MissionReview {
  id: number;
  rating: number;
  comment?: string;
  direction: "author_to_applicant" | "applicant_to_author";
  reviewer: { id: number; name: string; avatar?: string | null };
  created_at: string;
}

export interface Mission {
  id: number;
  ulid: string;
  title: string;
  description: string;
  description_short?: string;
  desired_profile?: string;
  category?: MissionCategory | null;
  author: MissionAuthor;

  duration_type: DurationType;
  duration_value?: number;
  duration_label: string;
  start_date?: string;
  expires_at?: string;

  location_label?: string;
  lat?: number;
  lng?: number;
  distance_km?: number | null;

  remuneration_type: RemunerationType;
  remuneration_amount?: number | null;
  remuneration_currency: string;
  remuneration_conditions?: string;
  remuneration_label: string;

  contact_methods: ContactMethod[];
  application_form: FormField[];
  allow_attachments: boolean;
  max_applications?: number | null;

  status: MissionStatus;
  is_open: boolean;
  is_full: boolean;
  applications_count: number;
  pending_count?: number | null;
  accepted_count?: number;
  views_count: number;

  // Injectés dans le détail
  user_application?: { id: number; status: ApplicationStatus } | null;
  reviews?: MissionReview[];

  filled_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface MissionApplication {
  id: number;
  mission: Mission;
  applicant: MissionAuthor;
  method: "form" | "app_message" | "whatsapp" | "email";
  form_responses: Record<string, unknown>;
  motivation?: string;
  attachment_paths: string[];
  status: ApplicationStatus;
  author_note?: string;
  rejection_reason?: string;
  accepted_at?: string;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
  };
  links?: { next?: string; prev?: string };
}

export interface MissionApplicationsResponse {
  data: MissionApplication[];
  meta: { current_page: number; last_page: number; total: number };
  stats: {
    pending: number;
    accepted: number;
    rejected: number;
    withdrawn: number;
  };
}

export interface MissionFilters {
  lat?: number;
  lng?: number;
  radius_km?: number;
  category?: number;
  remuneration_type?: RemunerationType | "";
  sort?: "recent" | "distance" | "popular";
  search?: string;
  author_id?: number;
  status?: string;
  per_page?: number;
  page?: number;
}

export interface MissionMapPoint {
  id: number;
  ulid: string;
  title: string;
  applications_count: number;
  lat: number;
  lng: number;
  category_slug: string | null;
  category_icon: string | null;
  category_color: string | null;
  distance_km: number;
}

export type ReportReason =
  | "spam"
  | "inappropriate"
  | "scam"
  | "duplicate"
  | "misleading"
  | "other";

export interface MissionReport {
  id: number;
  mission_id: number;
  reason: ReportReason;
  details?: string;
  status: "pending" | "reviewed" | "dismissed" | "action_taken";
  created_at: string;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// Types de base
export type ModerationStatus = "pending" | "approved" | "review" | "rejected";
export type ContentType = "post" | "comment" | "message";
export type ActorType = "ai" | "moderator" | "system";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
export type ReportReason =
  | "spam"
  | "harassment"
  | "hate_speech"
  | "violence"
  | "inappropriate"
  | "misinformation"
  | "other";

// ─── Scores ──────────────────────────────────────────────────────────────────

export interface ModerationScores {
  toxicity: number;
  spam: number;
  hate: number;
  violence: number;
}

// ─── Modération ──────────────────────────────────────────────────────────────

export interface ModerationData {
  status: ModerationStatus;
  reason?: string;
  moderated_at?: string;
  scores?: ModerationScores;
  result_raw?: any;
  content_hash?: string;
}

export interface ModerationPost extends ModerationData {
  id: number;
  post_id: number;
}

export interface ModerationComment extends ModerationData {
  id: number;
  comment_id: number;
}

export interface ModerationMessage extends ModerationData {
  id: number;
  message_id: number;
}

// ─── Audit ──────────────────────────────────────────────────────────────────

export interface ModerationAuditLog {
  id: number;
  moderatable_type: string;
  moderatable_id: number;
  action: ModerationStatus;
  actor_type: ActorType;
  actor_id: number | null;
  actor?: {
    id: number;
    firstname: string;
    lastname: string;
  };
  payload: {
    old_status?: ModerationStatus;
    new_status?: ModerationStatus;
    reason?: string;
    scores?: ModerationScores;
    [key: string]: any;
  };
  created_at: string;
}

// ─── Signalements ──────────────────────────────────────────────────────────

export interface ModerationReport {
  id: number;
  reporter_id: number;
  content_type: ContentType | "user";
  content_id: number;
  reason: ReportReason;
  description: string | null;
  status: ReportStatus;
  resolved_by: number | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Statistiques ──────────────────────────────────────────────────────────

export interface ModerationStats {
  posts: {
    total: number;
    pending: number;
    approved: number;
    review: number;
    rejected: number;
    avg_toxicity: number;
    avg_spam: number;
    avg_hate: number;
    avg_violence: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  comments: {
    total: number;
    pending: number;
    approved: number;
    review: number;
    rejected: number;
    avg_toxicity: number;
    avg_spam: number;
    avg_hate: number;
    avg_violence: number;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  };
  messages: {
    total: number;
    pending: number;
    approved: number;
    review: number;
    rejected: number;
    avg_toxicity: number;
    avg_spam: number;
    avg_hate: number;
    avg_violence: number;
  };
  audit: {
    total: number;
    ai_decisions: number;
    moderator_decisions: number;
    system_decisions: number;
    approvals: number;
    rejections: number;
    reviews: number;
  };
  reports: {
    total: number;
    pending: number;
    reviewing: number;
    resolved: number;
    dismissed: number;
    by_reason: Array<{ reason: string; count: number }>;
    by_type: Array<{ content_type: string; count: number }>;
  };
  overall: {
    total_pending: number;
    total_review: number;
    total_rejected: number;
    total_approved: number;
  };
}

// ─── Posts avec modération ────────────────────────────────────────────────

export interface PostWithModeration extends Post {
  moderation_status: ModerationStatus;
  toxicity_score?: number;
  spam_score?: number;
  hate_score?: number;
  violence_score?: number;
  moderation_reason?: string;
  moderated_at?: string;
  moderation?: ModerationData;
}

export interface CommentWithModeration extends Comment {
  moderation_status: ModerationStatus;
  toxicity_score?: number;
  spam_score?: number;
  hate_score?: number;
  violence_score?: number;
  moderation_reason?: string;
  moderated_at?: string;
  moderation?: ModerationData;
}

export interface MessageWithModeration extends Message {
  moderation_status: ModerationStatus;
  toxicity_score?: number;
  spam_score?: number;
  hate_score?: number;
  violence_score?: number;
  moderation_reason?: string;
  moderated_at?: string;
  moderation?: ModerationData;
}

// ─── Requêtes API ──────────────────────────────────────────────────────────

export interface ModerationQueueParams {
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: "asc" | "desc";
  status?: ModerationStatus;
}

export interface ModerationActionRequest {
  action: "approve" | "reject" | "review";
  reason?: string;
}

export interface ReportRequest {
  content_type: ContentType | "user";
  content_id: number;
  reason: ReportReason;
  description?: string;
}

export interface ModerationTestRequest {
  content: string;
  image?: File;
}

export interface ModerationTestResponse {
  safe: boolean;
  action: ModerationStatus;
  reason: string;
  toxicity: number;
  spam: number;
  hate: number;
  violence: number;
  source: string;
  estimated_cost: number;
}

// ─── Providers ─────────────────────────────────────────────────────────────

export interface ProviderInfo {
  name: string;
  model: string;
  available: boolean;
}

export interface ProvidersResponse {
  available: Record<string, ProviderInfo>;
  current: {
    name: string;
    model: string;
  };
}

// ─── Configuration ────────────────────────────────────────────────────────

export interface ModerationThresholds {
  toxicity: { review: number; reject: number };
  spam: { review: number; reject: number };
  hate: { review: number; reject: number };
  violence: { review: number; reject: number };
}

export interface BlocklistConfig {
  words: string[];
  spam_domains: string[];
}

// ─── Types de base pour les extensions ───────────────────────────────────

export interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  avatar?: string;
  role: string;
}

export interface Post {
  id: number;
  user_id: number;
  content: string;
  title?: string;
  type: string;
  media_urls: string[];
  pdf_files: any[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  parent_id: number | null;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  media_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

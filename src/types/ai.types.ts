export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  tokens?: number;
  createdAt?: Date;
  isStreaming?: boolean;
}

export interface AIConversation {
  id: string;
  user_id: number;
  title: string | null;
  model: string;
  context_type: string;
  context_id: number | null;
  total_tokens: number;
  message_count: number;
  meta?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  messages?: AIMessage[];
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  stream?: boolean;
  context_type?: "general" | "post" | "mission" | "comment";
  context_id?: number;
  system_prompt?: string;
}

export interface ChatResponse {
  message: {
    id: string;
    role: "assistant";
    content: string;
    tokens: number;
  };
  conversation_id: string;
  total_tokens_used: number;
}

export type SendMessageResponse = ChatResponse;

export interface TagSuggestion {
  tags: string[];
}

export interface SummaryRequest {
  content: string;
  language?: "fr" | "en" | "es" | "de";
}

export interface ImproveTextRequest {
  content: string;
  language?: "fr" | "en" | "es" | "de";
}

export interface ModerationCheck {
  content: string;
  strict_mode?: boolean;
}

export interface ModerationResult {
  flagged: boolean;
  confidence: number;
  reasons: string[];
  requires_review: boolean;
}

export interface ModerationLog {
  id: number;
  moderatable_type: string;
  moderatable_id: number;
  content_hash: string;
  flagged: boolean;
  confidence_score: number | null;
  reasons: string[] | null;
  raw_response: Record<string, unknown> | null;
  status: "pending" | "completed" | "failed";
  model_used: string | null;
  processing_time_ms: number | null;
  created_at: string;
  updated_at: string;
  moderatable?: Record<string, unknown>;
}

export interface BatchModerationRequest {
  contents: Array<{
    id: string;
    content: string;
    type: string;
  }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

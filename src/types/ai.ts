// types/ai.ts

/**
 * Types partagés pour le module IA.
 */

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface Conversation {
  id: number;
  sessionId: string;
  title: string | null;
  messagesCount: number;
  updatedAt: string;
}

export interface ModerationResult {
  is_safe: boolean;
  score: number;
  categories: string[];
  reason: string;
}

export interface AIError {
  message: string;
  code?: number;
}

export interface StreamChunk {
  content?: string;
  done?: boolean;
}

export interface SendMessageResponse {
  content: string;
  session_id: string;
  usage: {
    total_tokens: number;
    prompt_tokens: number;
    completion_tokens: number;
  };
}

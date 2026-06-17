/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Service unique pour tous les appels API IA.
 * Auth : Bearer token injecté via tokenService
 */

import api from "@/lib/axios";
import { tokenService } from "@/lib/auth-token";
import {
  ChatRequest,
  ChatResponse,
  TagSuggestion,
  SummaryRequest,
  ImproveTextRequest,
  ModerationCheck,
  ModerationResult,
  AIConversation,
  BatchModerationRequest,
  ModerationLog,
  PaginatedResponse,
} from "@/types/ai.types";

class AIService {
  // ── Chat (mode direct) ───────────────────────────────────────────────────────

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const response = await api.post<ChatResponse>("/ai/chat", {
      ...request,
      stream: false,
    });
    return response.data;
  }

  // ── Suggestions ──────────────────────────────────────────────────────────────

  async generateTags(content: string, max = 5): Promise<TagSuggestion> {
    const response = await api.post<TagSuggestion>("/ai/suggestions/tags", {
      content,
      max,
    });
    return response.data;
  }

  async summarizeContent(
    request: SummaryRequest,
  ): Promise<{ summary: string }> {
    const response = await api.post<{ summary: string }>(
      "/ai/suggestions/summarize",
      request,
    );
    return response.data;
  }

  async improveText(
    request: ImproveTextRequest,
  ): Promise<{ improved: string }> {
    const response = await api.post<{ improved: string }>(
      "/ai/suggestions/improve",
      request,
    );
    return response.data;
  }

  // ── Conversations ────────────────────────────────────────────────────────────

  async getConversations(
    page = 1,
    perPage = 20,
  ): Promise<PaginatedResponse<AIConversation>> {
    const response = await api.get<PaginatedResponse<AIConversation>>(
      `/ai/conversations?page=${page}&per_page=${perPage}`,
    );
    return response.data;
  }

  async getConversation(id: string): Promise<AIConversation> {
    const response = await api.get<AIConversation>(`/ai/conversations/${id}`);
    return response.data;
  }

  async deleteConversation(id: string): Promise<void> {
    await api.delete(`/ai/conversations/${id}`);
  }

  // ── Streaming (helper URL uniquement) ────────────────────────────────────────

  getStreamConfig(request: ChatRequest): {
    url: string;
    headers: Record<string, string>;
    body: string;
  } {
    const token = tokenService.get();

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return {
      url: `${api.defaults.baseURL}/ai/chat`,
      headers,
      body: JSON.stringify({ ...request, stream: true }),
    };
  }
}

// ── Modération ────────────────────────────────────────────────────────────────

class ModerationService {
  async checkContent(request: ModerationCheck): Promise<ModerationResult> {
    const response = await api.post<ModerationResult>(
      "/ai/moderation/check",
      request,
    );
    return response.data;
  }

  async getLogs(params?: {
    flagged?: boolean;
    status?: string;
    page?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.flagged) query.append("flagged", "true");
    if (params?.status) query.append("status", params.status);
    if (params?.page) query.append("page", String(params.page));

    const response = await api.get(`/ai/moderation/logs?${query.toString()}`);
    return response.data;
  }

  async getLog(id: number): Promise<ModerationLog> {
    const response = await api.get<ModerationLog>(`/ai/moderation/logs/${id}`);
    return response.data;
  }

  async recheck(moderationLogId: number): Promise<any> {
    const response = await api.post("/ai/moderation/recheck", {
      moderation_log_id: moderationLogId,
    });
    return response.data;
  }

  async batchModerate(request: BatchModerationRequest): Promise<any> {
    const response = await api.post("/ai/moderation/batch", request);
    return response.data;
  }
}

export const aiService = new AIService();
export const moderationService = new ModerationService();

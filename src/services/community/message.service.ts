/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/message.service.ts
// ============================================================
// SERVICE MESSAGERIE UNIFIÉ
// - Pas de socket.io (Laravel Sanctum = REST + polling)
// - Upload media réel via FormData
// - Compatible avec votre MessageController Laravel
// ============================================================

import api from "@/lib/axios";

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
export interface ConversationParticipant {
  id: number;
  firstname: string;
  lastname: string;
  avatar: string | null;
}

export interface LastMessage {
  content: string;
  sender: string;
  created_at: string;
}

export interface Conversation {
  id: number;
  is_group: boolean;
  name: string | null;
  participants: ConversationParticipant[];
  last_message: LastMessage | null;
  unread_count: number;
  updated_at: string;
}

export interface Message {
  id: number;
  content: string;
  media_url: string | null;
  status: "sent" | "delivered" | "read";
  is_mine: boolean;
  sender_id: number;
  sender: {
    id: number;
    firstname: string;
    avatar: string | null;
  };
  conversation_id: number;
  created_at: string;
}

export interface PaginatedMessages {
  data: Message[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ConversationsResponse {
  data: Conversation[];
  current_page: number;
  last_page: number;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function extractApiError(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as any).response?.data?.message === "string"
  ) {
    return (error as any).response.data.message;
  }
  return "Une erreur est survenue.";
}

// ─────────────────────────────────────────────────────────────
// SERVICE
// ─────────────────────────────────────────────────────────────
class MessageService {
  // ── GET /community/messages/conversations ──────────────────
  async getConversations(): Promise<Conversation[]> {
    try {
      const res = await api.get("/community/messages/conversations");
      // Robustesse : le backend peut retourner data.data.data ou data.data
      const raw = res.data?.data;
      if (Array.isArray(raw)) return raw;
      if (Array.isArray(raw?.data)) return raw.data;
      return [];
    } catch (error) {
      console.error("[MessageService] getConversations:", error);
      throw new Error(extractApiError(error));
    }
  }

  // ── POST /community/messages/conversations ─────────────────
  // Crée ou retrouve une conversation privée avec userId
  async createOrFindConversation(userId: number): Promise<Conversation> {
    try {
      const res = await api.post("/community/messages/conversations", {
        user_id: userId,
      });
      return res.data?.data ?? res.data;
    } catch (error) {
      console.error("[MessageService] createOrFindConversation:", error);
      throw new Error(extractApiError(error));
    }
  }

  // ── GET /community/messages/conversations/{id}/messages ────
  async getMessages(
    conversationId: number | string,
    page = 1,
  ): Promise<PaginatedMessages> {
    try {
      const res = await api.get(
        `/community/messages/conversations/${conversationId}/messages`,
        { params: { page } },
      );
      const raw = res.data?.data;
      // Normalise la réponse paginée
      return {
        data: Array.isArray(raw?.data) ? raw.data : [],
        current_page: raw?.current_page ?? 1,
        last_page: raw?.last_page ?? 1,
        per_page: raw?.per_page ?? 30,
        total: raw?.total ?? 0,
      };
    } catch (error) {
      console.error("[MessageService] getMessages:", error);
      throw new Error(extractApiError(error));
    }
  }

  // ── POST /community/messages/conversations/{id}/messages ───
  // Supporte texte seul, media seul, ou les deux
  async sendMessage(
    conversationId: number | string,
    content: string,
    media?: File,
  ): Promise<Message> {
    try {
      const form = new FormData();

      if (content.trim()) {
        form.append("content", content.trim());
      }
      if (media) {
        form.append("media", media);
      }

      const res = await api.post(
        `/community/messages/conversations/${conversationId}/messages`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );

      return res.data?.data ?? res.data;
    } catch (error) {
      console.error("[MessageService] sendMessage:", error);
      throw new Error(extractApiError(error));
    }
  }

  // ── DELETE /community/messages/messages/{id} ───────────────
  async deleteMessage(messageId: number): Promise<void> {
    try {
      await api.delete(`/community/messages/messages/${messageId}`);
    } catch (error) {
      console.error("[MessageService] deleteMessage:", error);
      throw new Error(extractApiError(error));
    }
  }

  // ── Polling manuel (remplace le socket) ───────────────────
  // Retourne une fonction stop() pour arrêter le polling
  pollMessages(
    conversationId: number | string,
    onNewMessages: (messages: Message[]) => void,
    intervalMs = 5000,
  ): () => void {
    let lastMessageId = 0;

    const tick = async () => {
      try {
        const result = await this.getMessages(conversationId, 1);
        const newOnes = result.data.filter((m) => m.id > lastMessageId);
        if (newOnes.length > 0) {
          lastMessageId = Math.max(...newOnes.map((m) => m.id));
          onNewMessages(newOnes);
        }
      } catch {
        // Silencieux — ne pas crasher le polling
      }
    };

    // Premier appel immédiat
    tick();
    const timer = setInterval(tick, intervalMs);

    // Retourne la fonction d'arrêt
    return () => clearInterval(timer);
  }
}

export const messageService = new MessageService();

// src/services/community/message.service.ts
import api from "@/lib/axios";
import { Conversation, Message, Paginated } from "@/types/community.types";

class MessageService {
  // Récupérer toutes les conversations
  async getConversations(): Promise<Paginated<Conversation>> {
    const response = await api.get("/community/messages/conversations");
    return response.data.data;
  }

  // Créer ou trouver une conversation privée
  async createOrFindConversation(userId: number): Promise<Conversation> {
    const response = await api.post("/community/messages/conversations", {
      user_id: userId,
    });
    return response.data.data;
  }

  // Créer une conversation de groupe
  async createGroupConversation(
    participantIds: number[],
    name?: string,
  ): Promise<Conversation> {
    const response = await api.post("/community/messages/conversations", {
      participants: participantIds,
      name: name || "Groupe",
    });
    return response.data.data;
  }

  // Récupérer les messages d'une conversation
  async getMessages(
    conversationId: number,
    page: number = 1,
  ): Promise<Paginated<Message>> {
    const response = await api.get(
      `/community/messages/conversations/${conversationId}/messages`,
      { params: { page } },
    );
    return response.data.data;
  }

  // Envoyer un message
  async sendMessage(
    conversationId: number,
    content: string,
    media?: File,
    replyToId?: number | string,
  ): Promise<Message> {
    const formData = new FormData();
    if (content.trim()) {
      formData.append("content", content.trim());
    }
    if (media) {
      formData.append("media", media);
    }
    if (replyToId) {
      formData.append("reply_to_id", String(replyToId));
    }

    const response = await api.post(
      `/community/messages/conversations/${conversationId}/messages`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data.data;
  }

  // Supprimer un message
  async deleteMessage(messageId: number): Promise<void> {
    await api.delete(`/community/messages/messages/${messageId}`);
  }

  // Marquer une conversation comme lue
  async markAsRead(conversationId: number): Promise<void> {
    await api.post(`/community/messages/conversations/${conversationId}/read`);
  }

  // Récupérer le statut d'un message spécifique
  async getMessageStatus(
    messageId: number,
  ): Promise<{ is_read: boolean; is_delivered: boolean }> {
    const response = await api.get(
      `/community/messages/messages/${messageId}/status`,
    );
    return response.data.data;
  }

  // Ajouter des participants à un groupe
  async addParticipants(
    conversationId: number,
    userIds: number[],
  ): Promise<void> {
    await api.post(
      `/community/messages/conversations/${conversationId}/participants`,
      {
        user_ids: userIds,
      },
    );
  }

  // Quitter un groupe
  async leaveGroup(conversationId: number): Promise<void> {
    await api.delete(
      `/community/messages/conversations/${conversationId}/leave`,
    );
  }
}

export const messageService = new MessageService();

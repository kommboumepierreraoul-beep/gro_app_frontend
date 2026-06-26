/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";
import { ModerationStatus } from "@/types/community.types";

export interface CreatePostData {
  content?: string;
  type?: "text" | "image" | "video" | "pdf" | "shared" | "announcement";
  media?: File[];
  shared_post_id?: number;
}

export interface ModeratePostData {
  action: "approve" | "reject" | "review";
  reason?: string;
}

class PostService {
  // ────────────────────────────────────────────────────────────────────────────
  // POSTS CRUD
  // ────────────────────────────────────────────────────────────────────────────

  async getFeed(page: number = 1) {
    try {
      const response = await api.get(`/community/posts`, { params: { page } });
      return response.data;
    } catch (error) {
      console.error("Error fetching feed:", error);
      throw error;
    }
  }

  async getPost(postId: string | number) {
    try {
      const response = await api.get(`/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching post:", error);
      throw error;
    }
  }

  async getUserPosts(userId: string | number, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/user/${userId}`, {
        params: { page },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  }

  async getUserSharedPosts(userId: string | number, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/user/${userId}/shared`, {
        params: { page },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("Error fetching user shared posts:", error);
      throw error;
    }
  }

  async getUserLikedPosts(userId: string | number, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/user/${userId}/liked`, {
        params: { page },
      });
      return response.data?.data ?? response.data;
    } catch (error) {
      console.error("Error fetching user liked posts:", error);
      throw error;
    }
  }

  async createPost(data: CreatePostData) {
    const formData = new FormData();

    if (data.content && data.content.trim().length > 0) {
      formData.append("content", data.content.trim());
    } else {
      formData.append("content", "");
    }

    formData.append("type", data.type ?? "text");

    if (data.shared_post_id) {
      formData.append("shared_post_id", String(data.shared_post_id));
    }

    if (data.media && data.media.length > 0) {
      data.media.forEach((file) => {
        formData.append("media[]", file);
      });
    }

    try {
      const response = await api.post("/community/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    } catch (error: any) {
      console.error("❌ Response data:", error.response?.data);
      if (error.response?.data?.errors) {
        Object.entries(error.response.data.errors).forEach(([key, val]) => {
          console.error(`  - ${key}:`, val);
        });
      }
      throw error;
    }
  }

  async deletePost(postId: string | number) {
    try {
      const response = await api.delete(`/community/posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  async toggleLike(postId: string | number) {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error toggling like:", error);
      throw error;
    }
  }

  async sharePost(postId: string | number, content: string = "") {
    try {
      const response = await api.post(`/community/posts`, {
        content: content || "A partagé une publication.",
        type: "shared",
        shared_post_id: postId,
      });
      return response.data;
    } catch (error) {
      console.error("Error sharing post:", error);
      throw error;
    }
  }

  async getComments(postId: string | number) {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  async searchPosts(query: string, page: number = 1) {
    try {
      const response = await api.get(`/community/posts/search`, {
        params: { q: query, page },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching posts:", error);
      return { data: [] };
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - ACTIONS ADMIN (POSTS UNIQUEMENT)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Modérer un post (admin uniquement)
   */
  async moderatePost(postId: string | number, data: ModeratePostData) {
    try {
      const response = await api.post(
        `/moderation/posts/${postId}/moderate`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error moderating post:", error);
      throw error;
    }
  }

  /**
   * Réanalyser un post
   */
  async reanalyzePost(postId: string | number) {
    try {
      const response = await api.post(`/moderation/posts/${postId}/reanalyze`);
      return response.data;
    } catch (error) {
      console.error("Error reanalyzing post:", error);
      throw error;
    }
  }

  /**
   * Obtenir les détails de modération d'un post
   */
  async getPostModeration(postId: string | number) {
    try {
      const response = await api.get(`/moderation/posts/${postId}/moderation`);
      return response.data;
    } catch (error) {
      console.error("Error fetching post moderation:", error);
      throw error;
    }
  }

  /**
   * Supprimer la modération d'un post
   */
  async deletePostModeration(postId: string | number) {
    try {
      const response = await api.delete(
        `/moderation/posts/${postId}/moderation`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting post moderation:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - FILE DE REVIEW (POSTS UNIQUEMENT)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Récupérer la file de review des posts
   */
  async getReviewQueue(page: number = 1, perPage: number = 20) {
    try {
      const response = await api.get(`/moderation/queue/posts`, {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching review queue:", error);
      throw error;
    }
  }

  // ❌ SUPPRIMER les méthodes pour les commentaires et messages
  // async getCommentReviewQueue() { ... }
  // async getMessageReviewQueue() { ... }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - MES CONTENUS (POSTS UNIQUEMENT)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Récupérer mes posts en attente de modération
   */
  async getMyPendingPosts(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/pending`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching pending posts:", error);
      throw error;
    }
  }

  /**
   * Récupérer mes posts rejetés
   */
  async getMyRejectedPosts(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/rejected`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching rejected posts:", error);
      throw error;
    }
  }

  /**
   * Récupérer mes posts approuvés
   */
  async getMyApprovedPosts(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/approved`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching approved posts:", error);
      throw error;
    }
  }

  /**
   * Récupérer mes posts en révision
   */
  async getMyReviewPosts(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/review`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching review posts:", error);
      throw error;
    }
  }

  /**
   * Récupérer le résumé de ma modération
   */
  async getMyModerationSummary() {
    try {
      const response = await api.get(`/moderation/my/summary`);
      return response.data;
    } catch (error) {
      console.error("Error fetching moderation summary:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - STATISTIQUES (POSTS UNIQUEMENT)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Récupérer les statistiques de modération
   */
  async getModerationStats() {
    try {
      const response = await api.get(`/moderation/stats`);
      return response.data;
    } catch (error) {
      console.error("Error fetching moderation stats:", error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques quotidiennes
   */
  async getDailyStats(days: number = 7) {
    try {
      const response = await api.get(`/moderation/stats/daily`, {
        params: { days },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching daily stats:", error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques hebdomadaires
   */
  async getWeeklyStats() {
    try {
      const response = await api.get(`/moderation/stats/weekly`);
      return response.data;
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      throw error;
    }
  }

  /**
   * Récupérer les statistiques mensuelles
   */
  async getMonthlyStats() {
    try {
      const response = await api.get(`/moderation/stats/monthly`);
      return response.data;
    } catch (error) {
      console.error("Error fetching monthly stats:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - ACTIONS EN MASSE (POSTS UNIQUEMENT)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Approuver plusieurs posts en masse
   */
  async bulkApprovePosts(ids: number[]) {
    try {
      const response = await api.post(`/moderation/bulk/approve`, {
        ids,
        type: "posts",
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk approving posts:", error);
      throw error;
    }
  }

  /**
   * Rejeter plusieurs posts en masse
   */
  async bulkRejectPosts(ids: number[], reason?: string) {
    try {
      const response = await api.post(`/moderation/bulk/reject`, {
        ids,
        type: "posts",
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk rejecting posts:", error);
      throw error;
    }
  }

  /**
   * Mettre plusieurs posts en révision en masse
   */
  async bulkReviewPosts(ids: number[]) {
    try {
      const response = await api.post(`/moderation/bulk/review`, {
        ids,
        type: "posts",
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk reviewing posts:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - AUDIT (POSTS UNIQUEMENT)
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Récupérer les logs d'audit
   */
  async getAuditLogs(
    params: {
      page?: number;
      per_page?: number;
      action?: string;
      actor_type?: string;
      content_type?: string;
      date_from?: string;
      date_to?: string;
    } = {},
  ) {
    try {
      const response = await api.get(`/moderation/audit`, { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw error;
    }
  }

  /**
   * Exporter les logs d'audit
   */
  async exportAuditLogs(params: any = {}) {
    try {
      const response = await api.get(`/moderation/audit/export`, {
        params,
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error exporting audit logs:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // UTILITAIRES DE MODÉRATION
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Obtenir le libellé du statut
   */
  getStatusLabel(status: ModerationStatus): string {
    const labels: Record<ModerationStatus, string> = {
      pending: "⏳ En attente",
      approved: "✅ Approuvé",
      review: "🔍 En révision",
      rejected: "❌ Rejeté",
    };
    return labels[status] || status;
  }

  /**
   * Obtenir la couleur du statut
   */
  getStatusColor(status: ModerationStatus): string {
    const colors: Record<ModerationStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      review: "bg-orange-100 text-orange-800 border-orange-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  }

  /**
   * Obtenir l'icône du statut
   */
  getStatusIcon(status: ModerationStatus): string {
    const icons: Record<ModerationStatus, string> = {
      pending: "⏳",
      approved: "✅",
      review: "🔍",
      rejected: "❌",
    };
    return icons[status] || "📌";
  }

  /**
   * Obtenir le niveau de risque
   */
  getRiskLevel(score: number): string {
    if (score >= 0.7) return "Élevé";
    if (score >= 0.4) return "Moyen";
    return "Faible";
  }

  /**
   * Obtenir la couleur du risque
   */
  getRiskColor(score: number): string {
    if (score >= 0.7) return "text-red-600";
    if (score >= 0.4) return "text-orange-600";
    return "text-green-600";
  }

  /**
   * Formater une date
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Formater une date relative
   */
  formatDateRelative(date: string): string {
    const now = new Date();
    const past = new Date(date);
    const diff = now.getTime() - past.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "À l'instant";
    if (minutes < 60) return `Il y a ${minutes} min`;
    if (hours < 24) return `Il y a ${hours} h`;
    if (days < 7) return `Il y a ${days} j`;
    return this.formatDate(date);
  }
}

export const postService = new PostService();

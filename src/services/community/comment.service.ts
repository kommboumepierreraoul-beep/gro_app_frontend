import api from "@/lib/axios";
import { ModerationStatus } from "@/types/community.types";

interface CreateCommentData {
  content: string;
  parentId?: number;
}

interface ModerateCommentData {
  action: "approve" | "reject" | "review";
  reason?: string;
}

class CommentService {
  // ────────────────────────────────────────────────────────────────────────────
  // COMMENTS CRUD
  // ────────────────────────────────────────────────────────────────────────────

  async getComments(postId: string | number) {
    try {
      const response = await api.get(`/community/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  }

  async addComment(postId: string | number, data: CreateCommentData) {
    try {
      const response = await api.post(
        `/community/posts/${postId}/comments`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error adding comment:", error);
      throw error;
    }
  }

  async deleteComment(commentId: string | number) {
    try {
      const response = await api.delete(`/community/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw error;
    }
  }

  async likeComment(commentId: string | number) {
    try {
      const response = await api.post(`/community/comments/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error("Error liking comment:", error);
      throw error;
    }
  }

  async updateComment(commentId: string | number, content: string) {
    try {
      const response = await api.put(`/community/comments/${commentId}`, {
        content,
      });
      return response.data;
    } catch (error) {
      console.error("Error updating comment:", error);
      throw error;
    }
  }

  async getComment(commentId: string | number) {
    try {
      const response = await api.get(`/community/comments/${commentId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comment:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - ACTIONS ADMIN
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Modérer un commentaire (admin uniquement)
   */
  async moderateComment(commentId: string | number, data: ModerateCommentData) {
    try {
      const response = await api.post(
        `/moderation/comments/${commentId}/moderate`,
        data,
      );
      return response.data;
    } catch (error) {
      console.error("Error moderating comment:", error);
      throw error;
    }
  }

  /**
   * Réanalyser un commentaire
   */
  async reanalyzeComment(commentId: string | number) {
    try {
      const response = await api.post(
        `/moderation/comments/${commentId}/reanalyze`,
      );
      return response.data;
    } catch (error) {
      console.error("Error reanalyzing comment:", error);
      throw error;
    }
  }

  /**
   * Obtenir les détails de modération d'un commentaire
   */
  async getCommentModeration(commentId: string | number) {
    try {
      const response = await api.get(
        `/moderation/comments/${commentId}/moderation`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching comment moderation:", error);
      throw error;
    }
  }

  /**
   * Supprimer la modération d'un commentaire
   */
  async deleteCommentModeration(commentId: string | number) {
    try {
      const response = await api.delete(
        `/moderation/comments/${commentId}/moderation`,
      );
      return response.data;
    } catch (error) {
      console.error("Error deleting comment moderation:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - MES COMMENTAIRES
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Récupérer mes commentaires en attente de modération
   */
  async getMyPendingComments(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/comments/pending`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching pending comments:", error);
      throw error;
    }
  }

  /**
   * Récupérer mes commentaires rejetés
   */
  async getMyRejectedComments(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/comments/rejected`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching rejected comments:", error);
      throw error;
    }
  }

  /**
   * Récupérer mes commentaires approuvés
   */
  async getMyApprovedComments(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/comments/approved`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching approved comments:", error);
      throw error;
    }
  }

  /**
   * Récupérer mes commentaires en révision
   */
  async getMyReviewComments(page: number = 1) {
    try {
      const response = await api.get(`/moderation/my/comments/review`, {
        params: { page },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching review comments:", error);
      throw error;
    }
  }

  /**
   * Récupérer le résumé de mes commentaires modérés
   */
  async getMyCommentModerationSummary() {
    try {
      const response = await api.get(`/moderation/my/comments/summary`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comment moderation summary:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - FILE DE REVIEW
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Récupérer la file de review des commentaires
   */
  async getCommentReviewQueue(page: number = 1, perPage: number = 20) {
    try {
      const response = await api.get(`/moderation/queue/comments`, {
        params: { page, per_page: perPage },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching comment review queue:", error);
      throw error;
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // MODÉRATION - ACTIONS EN MASSE
  // ────────────────────────────────────────────────────────────────────────────

  /**
   * Approuver plusieurs commentaires en masse
   */
  async bulkApproveComments(ids: number[]) {
    try {
      const response = await api.post(`/moderation/bulk/approve`, {
        ids,
        type: "comments",
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk approving comments:", error);
      throw error;
    }
  }

  /**
   * Rejeter plusieurs commentaires en masse
   */
  async bulkRejectComments(ids: number[], reason?: string) {
    try {
      const response = await api.post(`/moderation/bulk/reject`, {
        ids,
        type: "comments",
        reason,
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk rejecting comments:", error);
      throw error;
    }
  }

  /**
   * Mettre plusieurs commentaires en révision en masse
   */
  async bulkReviewComments(ids: number[]) {
    try {
      const response = await api.post(`/moderation/bulk/review`, {
        ids,
        type: "comments",
      });
      return response.data;
    } catch (error) {
      console.error("Error bulk reviewing comments:", error);
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

export const commentService = new CommentService();

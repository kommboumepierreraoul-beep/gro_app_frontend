/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";
import {
  ModerationStats,
  ModerationQueueParams,
  ModerationActionRequest,
  ReportRequest,
  ProvidersResponse,
  ModerationThresholds,
  BlocklistConfig,
  ModerationTestRequest,
  ModerationTestResponse,
} from "@/types/moderation";

class ModerationService {
  // ────────────────────────────────────────────────────────────────────────────
  // 1. STATISTIQUES
  // ────────────────────────────────────────────────────────────────────────────

  async getStats(): Promise<ModerationStats> {
    const response = await api.get("/moderation/stats");
    return response.data;
  }

  async getDailyStats(days: number = 7): Promise<any> {
    const response = await api.get("/moderation/stats/daily", {
      params: { days },
    });
    return response.data;
  }

  async getWeeklyStats(): Promise<any> {
    const response = await api.get("/moderation/stats/weekly");
    return response.data;
  }

  async getMonthlyStats(): Promise<any> {
    const response = await api.get("/moderation/stats/monthly");
    return response.data;
  }

  async exportStats(): Promise<Blob> {
    const response = await api.get("/moderation/stats/export", {
      responseType: "blob",
    });
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 2. FILES DE REVIEW
  // ────────────────────────────────────────────────────────────────────────────

  async getQueuePosts(params: ModerationQueueParams = {}): Promise<any> {
    const response = await api.get("/moderation/queue/posts", { params });
    return response.data;
  }

  async getQueueComments(params: ModerationQueueParams = {}): Promise<any> {
    const response = await api.get("/moderation/queue/comments", { params });
    return response.data;
  }

  // async getQueueMessages(params: ModerationQueueParams = {}): Promise<any> {
  //   const response = await api.get("/moderation/queue/messages", { params });
  //   return response.data;
  // }

  // ────────────────────────────────────────────────────────────────────────────
  // 3. ACTIONS DE MODÉRATION
  // ────────────────────────────────────────────────────────────────────────────

  async moderatePost(
    postId: number,
    data: ModerationActionRequest,
  ): Promise<any> {
    const response = await api.post(
      `/moderation/posts/${postId}/moderate`,
      data,
    );
    return response.data;
  }

  async moderateComment(
    commentId: number,
    data: ModerationActionRequest,
  ): Promise<any> {
    const response = await api.post(
      `/moderation/comments/${commentId}/moderate`,
      data,
    );
    return response.data;
  }

  // async moderateMessage(
  //   messageId: number,
  //   data: ModerationActionRequest,
  // ): Promise<any> {
  //   const response = await api.post(
  //     `/moderation/messages/${messageId}/moderate`,
  //     data,
  //   );
  //   return response.data;
  // }

  // ────────────────────────────────────────────────────────────────────────────
  // 4. RÉANALYSE
  // ────────────────────────────────────────────────────────────────────────────

  async reanalyzePost(postId: number): Promise<any> {
    const response = await api.post(`/moderation/posts/${postId}/reanalyze`);
    return response.data;
  }

  async reanalyzeComment(commentId: number): Promise<any> {
    const response = await api.post(
      `/moderation/comments/${commentId}/reanalyze`,
    );
    return response.data;
  }

  // async reanalyzeMessage(messageId: number): Promise<any> {
  //   const response = await api.post(
  //     `/moderation/messages/${messageId}/reanalyze`,
  //   );
  //   return response.data;
  // }

  // ────────────────────────────────────────────────────────────────────────────
  // 5. DÉTAILS DE MODÉRATION
  // ────────────────────────────────────────────────────────────────────────────

  async getPostModeration(postId: number): Promise<any> {
    const response = await api.get(`/moderation/posts/${postId}/moderation`);
    return response.data;
  }

  async getCommentModeration(commentId: number): Promise<any> {
    const response = await api.get(
      `/moderation/comments/${commentId}/moderation`,
    );
    return response.data;
  }

  // async getMessageModeration(messageId: number): Promise<any> {
  //   const response = await api.get(
  //     `/moderation/messages/${messageId}/moderation`,
  //   );
  //   return response.data;
  // }

  async deletePostModeration(postId: number): Promise<any> {
    const response = await api.delete(`/moderation/posts/${postId}/moderation`);
    return response.data;
  }

  async deleteCommentModeration(commentId: number): Promise<any> {
    const response = await api.delete(
      `/moderation/comments/${commentId}/moderation`,
    );
    return response.data;
  }

  // async deleteMessageModeration(messageId: number): Promise<any> {
  //   const response = await api.delete(
  //     `/moderation/messages/${messageId}/moderation`,
  //   );
  //   return response.data;
  // }

  // ────────────────────────────────────────────────────────────────────────────
  // 6. AUDIT
  // ────────────────────────────────────────────────────────────────────────────

  async getAuditLogs(params: any = {}): Promise<any> {
    const response = await api.get("/moderation/audit", { params });
    return response.data;
  }

  async exportAuditLogs(params: any = {}): Promise<Blob> {
    const response = await api.get("/moderation/audit/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  }

  async cleanupAuditLogs(days: number = 30): Promise<any> {
    const response = await api.delete("/moderation/audit/cleanup", {
      data: { days },
    });
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 7. ACTIONS EN MASSE
  // ────────────────────────────────────────────────────────────────────────────

  async bulkApprove(
    ids: number[],
    type: "posts" | "comments" | "messages",
  ): Promise<any> {
    const response = await api.post("/moderation/bulk/approve", { ids, type });
    return response.data;
  }

  async bulkReject(
    ids: number[],
    type: "posts" | "comments" | "messages",
    reason?: string,
  ): Promise<any> {
    const response = await api.post("/moderation/bulk/reject", {
      ids,
      type,
      reason,
    });
    return response.data;
  }

  async bulkReview(
    ids: number[],
    type: "posts" | "comments" | "messages",
  ): Promise<any> {
    const response = await api.post("/moderation/bulk/review", { ids, type });
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 8. SIGNALEMENTS
  // ────────────────────────────────────────────────────────────────────────────

  async createReport(data: ReportRequest): Promise<any> {
    const response = await api.post("/moderation/reports", data);
    return response.data;
  }

  async getMyReports(params: any = {}): Promise<any> {
    const response = await api.get("/moderation/reports/my", { params });
    return response.data;
  }

  async getReport(reportId: number): Promise<any> {
    const response = await api.get(`/moderation/reports/${reportId}`);
    return response.data;
  }

  async getAllReports(params: any = {}): Promise<any> {
    const response = await api.get("/moderation/reports", { params });
    return response.data;
  }

  async getPendingReports(): Promise<any> {
    const response = await api.get("/moderation/reports/pending");
    return response.data;
  }

  async resolveReport(reportId: number): Promise<any> {
    const response = await api.post(`/moderation/reports/${reportId}/resolve`);
    return response.data;
  }

  async dismissReport(reportId: number): Promise<any> {
    const response = await api.post(`/moderation/reports/${reportId}/dismiss`);
    return response.data;
  }

  async getReportStats(): Promise<any> {
    const response = await api.get("/moderation/reports/stats");
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 9. PROVIDERS
  // ────────────────────────────────────────────────────────────────────────────

  async getProviders(): Promise<ProvidersResponse> {
    const response = await api.get("/moderation/providers");
    return response.data;
  }

  async switchProvider(provider: string): Promise<any> {
    const response = await api.post("/moderation/switch-provider", {
      provider,
    });
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 10. CONFIGURATION
  // ────────────────────────────────────────────────────────────────────────────

  async getThresholds(): Promise<ModerationThresholds> {
    const response = await api.get("/moderation/config/thresholds");
    return response.data;
  }

  async updateThresholds(thresholds: ModerationThresholds): Promise<any> {
    const response = await api.put("/moderation/config/thresholds", thresholds);
    return response.data;
  }

  async getBlocklist(): Promise<BlocklistConfig> {
    const response = await api.get("/moderation/config/blocklist");
    return response.data;
  }

  async addToBlocklist(word: string): Promise<any> {
    const response = await api.post("/moderation/config/blocklist", { word });
    return response.data;
  }

  async removeFromBlocklist(word: string): Promise<any> {
    const response = await api.delete(
      `/moderation/config/blocklist/${encodeURIComponent(word)}`,
    );
    return response.data;
  }

  async getSpamDomains(): Promise<string[]> {
    const response = await api.get("/moderation/config/spam-domains");
    return response.data;
  }

  async addSpamDomain(domain: string): Promise<any> {
    const response = await api.post("/moderation/config/spam-domains", {
      domain,
    });
    return response.data;
  }

  async removeSpamDomain(domain: string): Promise<any> {
    const response = await api.delete(
      `/moderation/config/spam-domains/${encodeURIComponent(domain)}`,
    );
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 11. MES CONTENUS
  // ────────────────────────────────────────────────────────────────────────────

  async getMyPendingContent(params: any = {}): Promise<any> {
    const response = await api.get("/moderation/my/pending", { params });
    return response.data;
  }

  async getMyRejectedContent(params: any = {}): Promise<any> {
    const response = await api.get("/moderation/my/rejected", { params });
    return response.data;
  }

  async getMyApprovedContent(params: any = {}): Promise<any> {
    const response = await api.get("/moderation/my/approved", { params });
    return response.data;
  }

  async getMyReviewContent(params: any = {}): Promise<any> {
    const response = await api.get("/moderation/my/review", { params });
    return response.data;
  }

  async getMyModerationSummary(): Promise<any> {
    const response = await api.get("/moderation/my/summary");
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 12. TEST
  // ────────────────────────────────────────────────────────────────────────────

  async testModeration(content: string, image?: File): Promise<any> {
    const formData = new FormData();
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    const response = await api.post("/moderation/test", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  // ────────────────────────────────────────────────────────────────────────────
  // 13. UTILITAIRES
  // ────────────────────────────────────────────────────────────────────────────

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: "⏳ En attente",
      approved: "✅ Approuvé",
      review: "🔍 En révision",
      rejected: "❌ Rejeté",
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      review: "bg-orange-100 text-orange-800 border-orange-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  }

  getStatusIcon(status: string): string {
    const icons: Record<string, string> = {
      pending: "⏳",
      approved: "✅",
      review: "🔍",
      rejected: "❌",
    };
    return icons[status] || "📌";
  }

  getRiskLevel(score: number): string {
    if (score >= 0.7) return "Élevé";
    if (score >= 0.4) return "Moyen";
    return "Faible";
  }

  getRiskColor(score: number): string {
    if (score >= 0.7) return "text-red-600";
    if (score >= 0.4) return "text-orange-600";
    return "text-green-600";
  }

  getRiskBadgeClass(score: number): string {
    if (score >= 0.7) return "bg-red-100 text-red-800";
    if (score >= 0.4) return "bg-orange-100 text-orange-800";
    return "bg-green-100 text-green-800";
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

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

  getContentTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      post: "📝 Publication",
      comment: "💬 Commentaire",
      message: "✉️ Message",
      user: "👤 Utilisateur",
    };
    return labels[type] || type;
  }

  getReportReasonLabel(reason: string): string {
    const labels: Record<string, string> = {
      spam: "📧 Spam",
      harassment: "⚠️ Harcèlement",
      hate_speech: "💢 Discours haineux",
      violence: "🔫 Violence",
      inappropriate: "🔞 Contenu inapproprié",
      misinformation: "📢 Désinformation",
      other: "📌 Autre",
    };
    return labels[reason] || reason;
  }

  getReportStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      pending: "⏳ En attente",
      reviewing: "🔍 En révision",
      resolved: "✅ Résolu",
      dismissed: "❌ Rejeté",
    };
    return labels[status] || status;
  }
}

export const moderationService = new ModerationService();
export default moderationService;

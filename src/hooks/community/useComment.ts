/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { commentService } from "@/services/community/comment.service";
import toast from "react-hot-toast";
import { ModerationStatus } from "@/types/community.types";

export function useComments(postId: number) {
  const queryClient = useQueryClient();
  const key = ["comments", postId];

  // ── Query ────────────────────────────────────────────────────────────────────
  const query = useQuery({
    queryKey: key,
    queryFn: () => commentService.getComments(postId),
    enabled: !!postId,
  });

  // ── Add comment ─────────────────────────────────────────────────────────────
  const addComment = useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: number;
    }) => commentService.addComment(postId, { content, parentId }),

    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: key });

      // Mettre à jour le feed pour incrémenter le compteur
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.map((p: any) =>
                String(p.id) === String(postId)
                  ? { ...p, comments_count: (p.comments_count ?? 0) + 1 }
                  : p,
              ),
            },
          })),
        };
      });

      // Afficher le message de modération
      const status = res.data?.moderation_status || "pending";
      const messages = {
        pending: "💬 Commentaire ajouté, en cours d'analyse...",
        approved: "💬 Commentaire ajouté et approuvé",
        review: "💬 Commentaire en cours de vérification",
        rejected: "❌ Commentaire rejeté",
      };
      toast.success(
        messages[status as ModerationStatus] || "Commentaire ajouté !",
      );
    },

    onError: () => toast.error("Erreur lors de l'ajout du commentaire."),
  });

  // ── Delete comment ──────────────────────────────────────────────────────────
  const deleteComment = useMutation({
    mutationFn: (id: string | number) => commentService.deleteComment(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "comments"],
      });
      toast.success("Commentaire supprimé");
    },

    onError: () => toast.error("Erreur lors de la suppression"),
  });

  // ── Like comment ────────────────────────────────────────────────────────────
  const likeComment = useMutation({
    mutationFn: (id: string | number) => commentService.likeComment(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
    },

    onError: () => toast.error("Erreur lors du like"),
  });

  // ── Update comment ──────────────────────────────────────────────────────────
  const updateComment = useMutation({
    mutationFn: ({ id, content }: { id: number; content: string }) =>
      commentService.updateComment(id, content),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      toast.success("Commentaire modifié");
    },

    onError: () => toast.error("Erreur lors de la modification"),
  });

  // ── MODÉRATION ─────────────────────────────────────────────────────────────

  /**
   * Modérer un commentaire (admin uniquement)
   */
  const moderateComment = useMutation({
    mutationFn: async ({
      commentId,
      action,
      reason,
    }: {
      commentId: number;
      action: "approve" | "reject" | "review";
      reason?: string;
    }) => {
      return commentService.moderateComment(commentId, { action, reason });
    },

    onSuccess: (_, variables) => {
      // Mettre à jour les commentaires
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((c: any) =>
              c.id === variables.commentId
                ? {
                    ...c,
                    moderation_status: variables.action,
                    moderation_reason: variables.reason,
                    moderated_at: new Date().toISOString(),
                  }
                : c,
            ),
          },
        };
      });

      // Invalider les caches de modération
      queryClient.invalidateQueries({
        queryKey: ["moderation", "queue", "comments"],
      });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "comments"],
      });

      const messages = {
        approve: "✅ Commentaire approuvé",
        reject: "❌ Commentaire rejeté",
        review: "🔍 Commentaire mis en révision",
      };
      toast.success(messages[variables.action]);
    },

    onError: () => toast.error("Erreur lors de la modération"),
  });

  /**
   * Réanalyser un commentaire
   */
  const reanalyzeComment = useMutation({
    mutationFn: (commentId: number) =>
      commentService.reanalyzeComment(commentId),

    onSuccess: (_, commentId) => {
      queryClient.setQueryData(key, (old: any) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((c: any) =>
              c.id === commentId
                ? {
                    ...c,
                    moderation_status: "pending",
                    moderated_at: null,
                  }
                : c,
            ),
          },
        };
      });
      toast.success("🔄 Réanalyse en cours...");
    },

    onError: () => toast.error("Erreur lors de la réanalyse"),
  });

  // ── File de review des commentaires ────────────────────────────────────────

  /**
   * Récupérer la file de review des commentaires
   */
  const reviewQueueQuery = useInfiniteQuery({
    queryKey: ["moderation", "queue", "comments"],
    queryFn: ({ pageParam = 1 }) =>
      commentService.getCommentReviewQueue(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const reviewQueueComments =
    reviewQueueQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];

  // ── Mes commentaires en attente ────────────────────────────────────────────

  /**
   * Récupérer mes commentaires en attente de modération
   */
  const myPendingCommentsQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "comments", "pending"],
    queryFn: ({ pageParam = 1 }) =>
      commentService.getMyPendingComments(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const myPendingComments =
    myPendingCommentsQuery.data?.pages.flatMap(
      (p: any) => p.data?.data ?? [],
    ) ?? [];

  /**
   * Récupérer mes commentaires rejetés
   */
  const myRejectedCommentsQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "comments", "rejected"],
    queryFn: ({ pageParam = 1 }) =>
      commentService.getMyRejectedComments(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const myRejectedComments =
    myRejectedCommentsQuery.data?.pages.flatMap(
      (p: any) => p.data?.data ?? [],
    ) ?? [];

  /**
   * Récupérer mes commentaires approuvés
   */
  const myApprovedCommentsQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "comments", "approved"],
    queryFn: ({ pageParam = 1 }) =>
      commentService.getMyApprovedComments(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const myApprovedComments =
    myApprovedCommentsQuery.data?.pages.flatMap(
      (p: any) => p.data?.data ?? [],
    ) ?? [];

  /**
   * Récupérer le résumé de mes commentaires modérés
   */
  const myCommentSummaryQuery = useQuery({
    queryKey: ["moderation", "my", "comments", "summary"],
    queryFn: () => commentService.getMyCommentModerationSummary(),
    staleTime: 2 * 60 * 1000,
  });

  // ── Actions en masse ────────────────────────────────────────────────────────

  /**
   * Approuver plusieurs commentaires en masse
   */
  const bulkApprove = useMutation({
    mutationFn: (ids: number[]) => commentService.bulkApproveComments(ids),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderation", "queue", "comments"],
      });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "comments"],
      });
      toast.success("✅ Commentaires approuvés en masse");
    },

    onError: () => toast.error("Erreur lors de l'approbation en masse"),
  });

  /**
   * Rejeter plusieurs commentaires en masse
   */
  const bulkReject = useMutation({
    mutationFn: ({ ids, reason }: { ids: number[]; reason?: string }) =>
      commentService.bulkRejectComments(ids, reason),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderation", "queue", "comments"],
      });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "comments"],
      });
      toast.success("❌ Commentaires rejetés en masse");
    },

    onError: () => toast.error("Erreur lors du rejet en masse"),
  });

  /**
   * Mettre plusieurs commentaires en révision en masse
   */
  const bulkReview = useMutation({
    mutationFn: (ids: number[]) => commentService.bulkReviewComments(ids),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["moderation", "queue", "comments"],
      });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      toast.success("🔍 Commentaires mis en révision en masse");
    },

    onError: () => toast.error("Erreur lors de la mise en révision en masse"),
  });

  // ── Utilitaires ─────────────────────────────────────────────────────────────

  const getStatusLabel = (status: ModerationStatus): string => {
    const labels: Record<ModerationStatus, string> = {
      pending: "⏳ En attente",
      approved: "✅ Approuvé",
      review: "🔍 En révision",
      rejected: "❌ Rejeté",
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: ModerationStatus): string => {
    const colors: Record<ModerationStatus, string> = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      approved: "bg-green-100 text-green-800 border-green-300",
      review: "bg-orange-100 text-orange-800 border-orange-300",
      rejected: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // ── Retour ──────────────────────────────────────────────────────────────────

  return {
    // Comments CRUD
    comments: query.data?.data?.data ?? [],
    isLoading: query.isLoading,
    addComment,
    deleteComment,
    likeComment,
    updateComment,

    // Modération
    moderateComment: moderateComment.mutate,
    moderateCommentLoading: moderateComment.isPending,
    reanalyzeComment: reanalyzeComment.mutate,
    reanalyzeCommentLoading: reanalyzeComment.isPending,

    // File de review
    reviewQueue: reviewQueueComments,
    reviewQueueLoading: reviewQueueQuery.isLoading,
    reviewQueueFetchNextPage: reviewQueueQuery.fetchNextPage,
    reviewQueueHasNextPage: reviewQueueQuery.hasNextPage,

    // Mes commentaires
    myPendingComments,
    myPendingCommentsLoading: myPendingCommentsQuery.isLoading,
    myRejectedComments,
    myRejectedCommentsLoading: myRejectedCommentsQuery.isLoading,
    myApprovedComments,
    myApprovedCommentsLoading: myApprovedCommentsQuery.isLoading,
    myCommentSummary: myCommentSummaryQuery.data,
    myCommentSummaryLoading: myCommentSummaryQuery.isLoading,

    // Actions en masse
    bulkApprove: bulkApprove.mutate,
    bulkApproveLoading: bulkApprove.isPending,
    bulkReject: bulkReject.mutate,
    bulkRejectLoading: bulkReject.isPending,
    bulkReview: bulkReview.mutate,
    bulkReviewLoading: bulkReview.isPending,

    // Utilitaires
    getStatusLabel,
    getStatusColor,
  };
}

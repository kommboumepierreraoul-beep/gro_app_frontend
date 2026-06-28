/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  useQuery,
} from "@tanstack/react-query";
import { postService } from "@/services/community/post.service";
import toast from "react-hot-toast";
import { Post, ModerationStatus } from "@/types/community.types";

export function useFeed() {
  const queryClient = useQueryClient();

  // ── Feed ──────────────────────────────────────────────────────────────────
  const feedQuery = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 1 }) => postService.getFeed(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const allPosts =
    feedQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];

  // ── Create post ───────────────────────────────────────────────────────────
  const createPost = useMutation({
    mutationFn: async (data: {
      content?: string;
      type?: "text" | "image" | "video" | "pdf" | "announcement";
      media?: File[];
      shared_post_id?: number;
    }) => {
      return postService.createPost(data);
    },

    onSuccess: (res: any) => {
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any, i: number) =>
            i === 0
              ? {
                  ...page,
                  data: {
                    ...page.data,
                    data: [res.data, ...page.data.data],
                  },
                }
              : page,
          ),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "pending"],
      });

      const status = res.data?.moderation_status || "pending";
      const messages = {
        pending: "⏳ Publication créée, en cours d'analyse...",
        approved: "Publication approuvée et publiée",
        review: "🔍 Publication en cours de vérification",
        rejected: "❌ Publication rejetée",
      };
      toast.success(
        messages[status as ModerationStatus] || "Publication créée !",
      );
    },

    onError: (error: any) => {
      console.error("❌ [useFeed] createPost onError:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error("Erreur lors de la publication");
    },
  });

  // ── Delete post ───────────────────────────────────────────────────────────
  const deletePost = useMutation({
    mutationFn: (id: number | string) => postService.deletePost(id),

    onSuccess: (_, id) => {
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.filter((p: Post) => p.id !== id),
            },
          })),
        };
      });
      queryClient.invalidateQueries({ queryKey: ["moderation", "my"] });
      toast.success("🗑️ Publication supprimée");
    },

    onError: (error: any) => {
      console.error("❌ [useFeed] deletePost error:", error);
      toast.error("Erreur lors de la suppression");
    },
  });

  // ── Update Post ───────────────────────────────────────────────────────────
  const updatePost = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: { content: string; media?: File[]; removeMedia?: string[] };
    }) => postService.updatePost(id, data),

    onSuccess: (response, variables) => {
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.map((p: any) =>
                p.id === variables.id
                  ? {
                      ...p,
                      content: variables.data.content,
                      media_urls: response.data?.media_urls || [],
                      moderation_status:
                        response.data?.moderation_status || "pending",
                      updated_at: new Date().toISOString(),
                    }
                  : p,
              ),
            },
          })),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", variables.id] });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "pending"],
      });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "summary"],
      });

      const status = response.data?.moderation_status || "pending";
      const messages = {
        pending: "⏳ Publication mise à jour, en cours d'analyse...",
        approved: "✅ Publication mise à jour et approuvée",
        review: "🔍 Publication mise à jour, en cours de vérification",
        rejected: "❌ Publication mise à jour mais rejetée",
      };
      toast.success(
        messages[status as ModerationStatus] || "Publication mise à jour !",
      );
    },

    onError: (error: any) => {
      console.error("❌ [useFeed] updatePost error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Erreur lors de la mise à jour";
      toast.error(message);
    },
  });

  // ── Like post (optimistic) ────────────────────────────────────────────────
  const likePost = useMutation({
    mutationFn: (id: number | string) => postService.toggleLike(id),

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["feed"] });
      const previous = queryClient.getQueryData(["feed"]);

      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.map((p: any) =>
                p.id === id
                  ? {
                      ...p,
                      is_liked: !p.is_liked,
                      likes_count: p.is_liked
                        ? p.likes_count - 1
                        : p.likes_count + 1,
                    }
                  : p,
              ),
            },
          })),
        };
      });

      return { previous };
    },

    onError: (error: any, _, ctx: any) => {
      if (ctx?.previous) queryClient.setQueryData(["feed"], ctx.previous);
      toast.error("Erreur lors du like.");
    },
  });

  // ─── MODÉRATION - POSTS ──────────────────────────────────────────────────

  const moderatePost = useMutation({
    mutationFn: async ({
      postId,
      action,
      reason,
    }: {
      postId: number;
      action: "approve" | "reject" | "review";
      reason?: string;
    }) => {
      return postService.moderatePost(postId, { action, reason });
    },

    onSuccess: (_, variables) => {
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.map((p: any) =>
                p.id === variables.postId
                  ? {
                      ...p,
                      moderation_status: variables.action,
                      moderation_reason: variables.reason,
                      moderated_at: new Date().toISOString(),
                    }
                  : p,
              ),
            },
          })),
        };
      });

      queryClient.invalidateQueries({ queryKey: ["moderation", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "my"] });

      const messages = {
        approve: "✅ Post approuvé",
        reject: "❌ Post rejeté",
        review: "🔍 Post mis en révision",
      };
      toast.success(messages[variables.action]);
    },

    onError: (error: any) => {
      console.error("❌ [useFeed] moderatePost error:", error);
      toast.error("Erreur lors de la modération");
    },
  });

  const reanalyzePost = useMutation({
    mutationFn: (postId: number) => postService.reanalyzePost(postId),

    onSuccess: (_, postId) => {
      queryClient.setQueryData(["feed"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            data: {
              ...page.data,
              data: page.data.data.map((p: any) =>
                p.id === postId
                  ? {
                      ...p,
                      moderation_status: "pending",
                      moderated_at: null,
                    }
                  : p,
              ),
            },
          })),
        };
      });

      toast.success("🔄 Réanalyse en cours...");
    },

    onError: (error: any) => {
      console.error("❌ [useFeed] reanalyzePost error:", error);
      toast.error("Erreur lors de la réanalyse");
    },
  });

  // ─── STATISTIQUES DE MODÉRATION ──────────────────────────────────────────

  const moderationStatsQuery = useQuery({
    queryKey: ["moderation", "stats"],
    queryFn: () => postService.getModerationStats(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  const myModerationSummaryQuery = useQuery({
    queryKey: ["moderation", "my", "summary"],
    queryFn: () => postService.getMyModerationSummary(),
    staleTime: 2 * 60 * 1000,
  });

  // ─── FILE DE REVIEW ──────────────────────────────────────────────────────

  const reviewQueueQuery = useInfiniteQuery({
    queryKey: ["moderation", "queue", "posts"],
    queryFn: ({ pageParam = 1 }) =>
      postService.getReviewQueue(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const reviewQueuePosts =
    reviewQueueQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];

  // ─── MES POSTS - MODÉRATION ─────────────────────────────────────────────

  const myPendingPostsQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "pending", "posts"],
    queryFn: ({ pageParam = 1 }) =>
      postService.getMyPendingPosts(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
  });

  const myPendingPosts =
    myPendingPostsQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ??
    [];

  const myRejectedPostsQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "rejected", "posts"],
    queryFn: ({ pageParam = 1 }) =>
      postService.getMyRejectedPosts(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const myRejectedPosts =
    myRejectedPostsQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ??
    [];

  const myApprovedPostsQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "approved", "posts"],
    queryFn: ({ pageParam = 1 }) =>
      postService.getMyApprovedPosts(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const myApprovedPosts =
    myApprovedPostsQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ??
    [];

  const myReviewPostsQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "review", "posts"],
    queryFn: ({ pageParam = 1 }) =>
      postService.getMyReviewPosts(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const myReviewPosts =
    myReviewPostsQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ??
    [];

  // ─── ACTIONS EN MASSE ────────────────────────────────────────────────────

  const bulkApprove = useMutation({
    mutationFn: (ids: number[]) => postService.bulkApprovePosts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "my"] });
      toast.success("✅ Posts approuvés en masse");
    },
    onError: (error: any) => {
      console.error("❌ [useFeed] bulkApprove error:", error);
      toast.error("Erreur lors de l'approbation en masse");
    },
  });

  const bulkReject = useMutation({
    mutationFn: ({ ids, reason }: { ids: number[]; reason?: string }) =>
      postService.bulkRejectPosts(ids, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "my"] });
      toast.success("❌ Posts rejetés en masse");
    },
    onError: (error: any) => {
      console.error("❌ [useFeed] bulkReject error:", error);
      toast.error("Erreur lors du rejet en masse");
    },
  });

  const bulkReview = useMutation({
    mutationFn: (ids: number[]) => postService.bulkReviewPosts(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["moderation", "queue"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({ queryKey: ["moderation", "my"] });
      toast.success("🔍 Posts mis en révision en masse");
    },
    onError: (error: any) => {
      console.error("❌ [useFeed] bulkReview error:", error);
      toast.error("Erreur lors de la mise en révision en masse");
    },
  });

  // ─── RETURN ──────────────────────────────────────────────────────────────

  return {
    // Feed
    posts: allPosts,
    isLoading: feedQuery.isLoading,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,

    // CRUD
    createPost,
    deletePost,
    updatePost: updatePost.mutate,
    updatePostLoading: updatePost.isPending,
    likePost,

    // Modération - Actions individuelles
    moderatePost: moderatePost.mutate,
    moderatePostLoading: moderatePost.isPending,
    reanalyzePost: reanalyzePost.mutate,
    reanalyzePostLoading: reanalyzePost.isPending,

    // Statistiques
    moderationStats: moderationStatsQuery.data,
    moderationStatsLoading: moderationStatsQuery.isLoading,
    myModerationSummary: myModerationSummaryQuery.data,
    myModerationSummaryLoading: myModerationSummaryQuery.isLoading,

    // File de review
    reviewQueue: reviewQueuePosts,
    reviewQueueLoading: reviewQueueQuery.isLoading,
    reviewQueueFetchNextPage: reviewQueueQuery.fetchNextPage,
    reviewQueueHasNextPage: reviewQueueQuery.hasNextPage,

    // Mes posts - modération
    myPendingPosts,
    myPendingPostsLoading: myPendingPostsQuery.isLoading,
    myRejectedPosts,
    myRejectedPostsLoading: myRejectedPostsQuery.isLoading,
    myApprovedPosts,
    myApprovedPostsLoading: myApprovedPostsQuery.isLoading,
    myReviewPosts,
    myReviewPostsLoading: myReviewPostsQuery.isLoading,

    // Actions en masse
    bulkApprove: bulkApprove.mutate,
    bulkApproveLoading: bulkApprove.isPending,
    bulkReject: bulkReject.mutate,
    bulkRejectLoading: bulkReject.isPending,
    bulkReview: bulkReview.mutate,
    bulkReviewLoading: bulkReview.isPending,

    // Utilitaires
    getStatusLabel: postService.getStatusLabel.bind(postService),
    getStatusColor: postService.getStatusColor.bind(postService),
    getStatusIcon: postService.getStatusIcon.bind(postService),
    getRiskLevel: postService.getRiskLevel.bind(postService),
    getRiskColor: postService.getRiskColor.bind(postService),
    formatDate: postService.formatDate.bind(postService),
    formatDateRelative: postService.formatDateRelative.bind(postService),
  };
}

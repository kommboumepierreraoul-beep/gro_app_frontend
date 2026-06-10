/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { postService } from "@/services/community/post.service";
import toast from "react-hot-toast";
import { Post } from "@/types/community.types";

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
      content?: string; // ← optionnel
      type?: "text" | "image" | "video" | "pdf" | "announcement"; // ← + pdf
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
      toast.success("Publication créée !");
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
      toast.success("Publication supprimée");
    },

    onError: (error: any) => {
      console.error("❌ [useFeed] deletePost error:", error);
      toast.error("Erreur lors de la suppression");
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

  return {
    posts: allPosts,
    isLoading: feedQuery.isLoading,
    fetchNextPage: feedQuery.fetchNextPage,
    hasNextPage: feedQuery.hasNextPage,
    isFetchingNextPage: feedQuery.isFetchingNextPage,
    createPost,
    deletePost,
    likePost,
  };
}

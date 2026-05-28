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

  // ─────────────────────────────
  // FEED QUERY
  // ─────────────────────────────
  const feedQuery = useInfiniteQuery({
    queryKey: ["feed"],
    queryFn: ({ pageParam = 1 }) => postService.getFeed(pageParam as number),

    // 🟡 FIX IMPORTANT : sécurisation des pages (évite undefined)
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,

    initialPageParam: 1,
  });

  // 🟡 FIX IMPORTANT : sécurisation du data.data
  const allPosts =
    feedQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];

  // ─────────────────────────────
  // CREATE POST
  // ─────────────────────────────
  const createPost = useMutation({
    // 🔴 FIX CRITIQUE : on reçoit un OBJECT (content + media)
    mutationFn: (data: { content: string; type?: "text" | "image" | "video" | "announcement"; media?: File[] }) =>
      postService.createPost(data),

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
                    // 🟡 FIX : injection du nouveau post en haut
                    data: [res.data, ...page.data.data],
                  },
                }
              : page,
          ),
        };
      });

      toast.success("Publication créée !");
    },

    onError: () => {
      toast.error("Erreur lors de la publication");
    },
  });

  // ─────────────────────────────
  // DELETE POST
  // ─────────────────────────────
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
              // 🟡 FIX : suppression du post
              data: page.data.data.filter((p: Post) => p.id !== id),
            },
          })),
        };
      });

      toast.success("Publication supprimée");
    },
  });

  // ─────────────────────────────
  // LIKE POST (optimistic update)
  // ─────────────────────────────
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
              // 🟡 FIX : toggle like optimiste
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

    onError: (_, __, ctx: any) => {
      if (ctx?.previous) {
        queryClient.setQueryData(["feed"], ctx.previous);
      }
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

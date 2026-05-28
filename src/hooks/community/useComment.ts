/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentService } from "@/services/community/comment.service";
import toast from "react-hot-toast";

export function useComments(postId: number) {
  const queryClient = useQueryClient();
  const key = ["comments", postId];

  const query = useQuery({
    queryKey: key,
    queryFn: () => commentService.getComments(postId),
    enabled: !!postId,
  });

  const addComment = useMutation({
    mutationFn: ({
      content,
      parentId,
    }: {
      content: string;
      parentId?: number;
    }) => commentService.addComment(postId, { content, parentId }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });

      // ✅ Sync feed — accès à page.data.data
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
    },

    onError: () => toast.error("Erreur lors de l'ajout du commentaire."),
  });

  const deleteComment = useMutation({
    mutationFn: (id: string | number) => commentService.deleteComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const likeComment = useMutation({
    mutationFn: (id: string | number) => commentService.likeComment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  return {
    comments: query.data?.data?.data ?? [], // ✅ .data.data = tableau
    isLoading: query.isLoading,
    addComment,
    deleteComment,
    likeComment,
  };
}

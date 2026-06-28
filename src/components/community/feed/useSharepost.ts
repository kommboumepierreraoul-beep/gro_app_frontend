"use client";
import { useState, useCallback } from "react";
import { postService } from "@/services/community/post.service";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

export function useSharePost(postId: number, url: string, onClose: () => void) {
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  const handleShareInternal = useCallback(
    async (text: string) => {
      setLoading(true);
      try {
        await postService.sharePost(postId, text);
        queryClient.invalidateQueries({ queryKey: ["feed"] });
        toast.success("Publication partagée !");
        onClose();
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors du partage.");
      } finally {
        setLoading(false);
      }
    },
    [postId, queryClient, onClose],
  );

  const handleNativeShare = useCallback(
    async (text: string, postContent: string) => {
      if (!navigator.share) {
        toast.error("Partage non supporté sur ce navigateur");
        return;
      }
      try {
        await navigator.share({
          title: "Publication",
          text: text || postContent,
          url,
        });
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          console.error(err);
          toast.error("Erreur lors du partage.");
        }
      }
    },
    [url],
  );

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Lien copié !");
    } catch (error) {
      console.error(error);
      toast.error("Impossible de copier le lien.");
    }
  }, [url]);

  return { loading, handleShareInternal, handleNativeShare, handleCopy };
}

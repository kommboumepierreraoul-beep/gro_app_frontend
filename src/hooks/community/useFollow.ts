/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { followService } from "@/services/community/follow.service";
import toast from "react-hot-toast";

export function useFollow(targetUserId: string | number, isInitiallyFollowing: boolean) {
  const queryClient = useQueryClient();

  const toggle = useMutation({
    mutationFn: async () => {
      return isInitiallyFollowing
        ? followService.unfollowUser(String(targetUserId))
        : followService.followUser(String(targetUserId));
    },

    onSuccess: (_, __, context: any) => {
      toast.success(
        isInitiallyFollowing
          ? "Abonnement retiré"
          : "Abonnement ajouté"
      );

      queryClient.invalidateQueries({
        queryKey: ["profile", targetUserId],
      });

      queryClient.invalidateQueries({
        queryKey: ["suggestions"],
      });
    },

    onError: () => {
      toast.error("Erreur lors de l'action");
    },
  });

  return {
    toggle,
    isLoading: toggle.isPending,
  };
}
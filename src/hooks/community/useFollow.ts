import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { followService } from "@/services/community/follow.service";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export function useFollow(targetUserId: string | number, isInitiallyFollowing: boolean) {
  const queryClient = useQueryClient();
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);

  useEffect(() => {
    setIsFollowing(isInitiallyFollowing);
  }, [isInitiallyFollowing]);

  const toggle = useMutation({
    mutationFn: async () => {
      return isFollowing
        ? followService.unfollowUser(String(targetUserId))
        : followService.followUser(String(targetUserId));
    },

    onSuccess: (data) => {
      const nextState = data?.is_following ?? !isFollowing;
      setIsFollowing(nextState);
      toast.success(nextState ? "Abonnement ajoute" : "Abonnement retire");

      queryClient.invalidateQueries({
        queryKey: ["community-users"],
      });

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
    isFollowing,
  };
}

export function useFollowers(userId?: number) {
  return useQuery({
    queryKey: ["followers", userId],
    queryFn: () => followService.getFollowers(userId!),
    enabled: !!userId,
  });
}

/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/announcements/useAnnouncement.ts
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { announcementService } from "@/services/community/announcement.service";
import toast from "react-hot-toast";

// Query keys
const announcementKeys = {
  all: ["announcements"] as const,
  lists: () => [...announcementKeys.all, "list"] as const,
  list: (filters: { category?: string; page?: number }) =>
    [...announcementKeys.lists(), filters] as const,
  details: () => [...announcementKeys.all, "detail"] as const,
  detail: (id: number) => [...announcementKeys.details(), id] as const,
};

// Hook principal
export function useAnnouncement() {
  const queryClient = useQueryClient();

  // ============ REQUÊTES ============

  // Récupérer toutes les annonces
  const useAll = (category?: string, page = 1) => {
    return useQuery({
      queryKey: announcementKeys.list({ category, page }),
      queryFn: () => announcementService.getAll(category, page),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      placeholderData: keepPreviousData,
      retry: 1,
    });
  };

  // Récupérer une annonce spécifique
  const useOne = (id: number) => {
    return useQuery({
      queryKey: announcementKeys.detail(id),
      queryFn: () => announcementService.getOne(id),
      enabled: !!id,
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    });
  };

  // Récupérer les dernières annonces
  const useLatest = (limit = 3) => {
    const { data, isLoading, error } = useAll(undefined, 1);
    return {
      announcements: data?.data?.slice(0, limit) || [],
      isLoading,
      error,
    };
  };

  // ============ MUTATIONS ============

  // Créer une annonce
  const useCreate = () => {
    return useMutation({
      mutationFn: (data: FormData) => announcementService.create(data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        toast.success("Annonce créée avec succès !");
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message || "Erreur lors de la création";
        toast.error(message);
      },
    });
  };

  // Mettre à jour une annonce
  const useUpdate = () => {
    return useMutation({
      mutationFn: ({ id, data }: { id: number; data: FormData }) =>
        announcementService.update(id, data),
      onSuccess: (_, { id }) => {
        queryClient.invalidateQueries({
          queryKey: announcementKeys.detail(id),
        });
        queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        toast.success("Annonce mise à jour avec succès");
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message || "Erreur lors de la mise à jour";
        toast.error(message);
      },
    });
  };

  // Supprimer une annonce
  const useDelete = () => {
    return useMutation({
      mutationFn: (id: number) => announcementService.delete(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: announcementKeys.lists() });
        toast.success("Annonce supprimée avec succès");
      },
      onError: (error: any) => {
        const message =
          error.response?.data?.message || "Erreur lors de la suppression";
        toast.error(message);
      },
    });
  };

  // Liker/Unliker une annonce
  const useLike = () => {
    return useMutation({
      mutationFn: (id: number) => announcementService.toggleLike(id),
      onMutate: async (likeId) => {
        await queryClient.cancelQueries({
          queryKey: announcementKeys.detail(likeId),
        });

        const previousAnnouncement = queryClient.getQueryData(
          announcementKeys.detail(likeId),
        );

        queryClient.setQueryData(
          announcementKeys.detail(likeId),
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              is_liked: !old.is_liked,
              likes_count: old.is_liked
                ? old.likes_count - 1
                : old.likes_count + 1,
            };
          },
        );

        return { previousAnnouncement };
      },
      onError: (err, likeId, context) => {
        if (context?.previousAnnouncement) {
          queryClient.setQueryData(
            announcementKeys.detail(likeId),
            context.previousAnnouncement,
          );
        }
        toast.error("Erreur lors du like");
      },
      onSuccess: (result, likeId) => {
        queryClient.setQueryData(
          announcementKeys.detail(likeId),
          (old: any) => {
            if (!old) return old;
            return {
              ...old,
              is_liked: result.liked,
              likes_count: result.likes_count,
            };
          },
        );
      },
    });
  };

  // ============ RETOUR ============

  return {
    useAll,
    useOne,
    useLatest,
    useCreate,
    useUpdate,
    useDelete,
    useLike,
  };
}

// ============ HOOKS PRÉ-CONFIGURÉS POUR UNE UTILISATION SIMPLE ============

export function useAnnouncementsList(category?: string, page = 1) {
  const { useAll } = useAnnouncement();
  return useAll(category, page);
}

export function useAnnouncementDetail(id: number) {
  const { useOne } = useAnnouncement();
  return useOne(id);
}

export function useLatestAnnouncements(limit = 3) {
  const { useLatest } = useAnnouncement();
  return useLatest(limit);
}

export function useCreateAnnouncement() {
  const { useCreate } = useAnnouncement();
  return useCreate();
}

export function useUpdateAnnouncement() {
  const { useUpdate } = useAnnouncement();
  return useUpdate();
}

export function useDeleteAnnouncement() {
  const { useDelete } = useAnnouncement();
  return useDelete();
}

export function useLikeAnnouncement() {
  const { useLike } = useAnnouncement();
  return useLike();
}

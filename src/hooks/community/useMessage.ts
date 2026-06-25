/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { messageService } from "@/services/community/message.service";
import { useCommunityStore } from "@/stores/community.store";
import {
  Message,
  Conversation,
  ModerationStatus,
} from "@/types/community.types";
import toast from "react-hot-toast";
import { useEffect, useRef } from "react";

// ────────────────────────────────────────────────────────────────────────────
// Récupérer toutes les conversations
// ────────────────────────────────────────────────────────────────────────────
export function useConversations() {
  const setUnreadMessages = useCommunityStore((s) => s.setUnreadMessages);

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const result = await messageService.getConversations();
      const totalUnread = result.data.reduce(
        (acc: number, conv: Conversation) => acc + (conv.unread_count || 0),
        0,
      );
      setUnreadMessages(totalUnread);
      return result;
    },
    refetchInterval: 10000,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Récupérer les messages d'une conversation
// ────────────────────────────────────────────────────────────────────────────
export function useMessages(conversationId: number) {
  const queryClient = useQueryClient();
  const markAsReadCalledRef = useRef(false);

  const query = useInfiniteQuery({
    queryKey: ["messages", conversationId],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await messageService.getMessages(
        conversationId,
        pageParam,
      );
      return result;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.current_page < lastPage.last_page) {
        return lastPage.current_page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!conversationId,
    refetchInterval: 3000,
  });

  // Les messages sont dans l'ordre décroissant (du plus récent au plus ancien)
  const allMessages =
    query.data?.pages.flatMap((page) => page.data).reverse() ?? [];

  // Marquer comme lu uniquement une fois quand les messages sont chargés
  useEffect(() => {
    if (
      conversationId &&
      allMessages.length > 0 &&
      !markAsReadCalledRef.current
    ) {
      markAsReadCalledRef.current = true;
      messageService
        .markAsRead(conversationId)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ["conversations"] });
          queryClient.invalidateQueries({
            queryKey: ["messages", conversationId],
          });
        })
        .catch(console.error);
    }
  }, [conversationId, allMessages.length, queryClient]);

  // Réinitialiser le flag quand la conversation change
  useEffect(() => {
    markAsReadCalledRef.current = false;
  }, [conversationId]);

  // ── Envoyer un message ────────────────────────────────────────────────────
  const sendMessage = useMutation({
    mutationFn: ({ content, media }: { content: string; media?: File }) =>
      messageService.sendMessage(conversationId, content, media),

    onSuccess: (newMessage) => {
      // Mise à jour optimiste
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = [...oldData.pages];
        const lastPage = newPages[newPages.length - 1];

        if (lastPage) {
          lastPage.data = [...lastPage.data, newMessage];
        }

        return { ...oldData, pages: newPages };
      });

      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // Afficher le message de modération
      const status = newMessage.moderation_status || "pending";
      const messages = {
        pending: "📝 Message envoyé, en cours d'analyse...",
        approved: "✅ Message envoyé et approuvé",
        review: "🔍 Message en cours de vérification",
        rejected: "❌ Message rejeté",
      };
      toast.success(messages[status as ModerationStatus] || "Message envoyé !");

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ["messages", conversationId],
        });
      }, 500);
    },

    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    },
  });

  // ── Supprimer un message ──────────────────────────────────────────────────
  const deleteMessage = useMutation({
    mutationFn: (messageId: number) => messageService.deleteMessage(messageId),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "messages"],
      });
      toast.success("Message supprimé");
    },

    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  // ── MODÉRATION ─────────────────────────────────────────────────────────────

  /**
   * Modérer un message (admin uniquement)
   */
  const moderateMessage = useMutation({
    mutationFn: async ({
      messageId,
      action,
      reason,
    }: {
      messageId: number;
      action: "approve" | "reject" | "review";
      reason?: string;
    }) => {
      return messageService.moderateMessage(messageId, { action, reason });
    },

    onSuccess: (_, variables) => {
      // Mettre à jour les messages
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          data: page.data.map((msg: any) =>
            msg.id === variables.messageId
              ? {
                  ...msg,
                  moderation_status: variables.action,
                  moderation_reason: variables.reason,
                  moderated_at: new Date().toISOString(),
                }
              : msg,
          ),
        }));

        return { ...oldData, pages: newPages };
      });

      // Invalider les caches
      queryClient.invalidateQueries({
        queryKey: ["moderation", "queue", "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["moderation", "stats"] });
      queryClient.invalidateQueries({
        queryKey: ["moderation", "my", "messages"],
      });

      const messages = {
        approve: "✅ Message approuvé",
        reject: "❌ Message rejeté",
        review: "🔍 Message mis en révision",
      };
      toast.success(messages[variables.action]);
    },

    onError: () => {
      toast.error("Erreur lors de la modération");
    },
  });

  /**
   * Réanalyser un message
   */
  const reanalyzeMessage = useMutation({
    mutationFn: (messageId: number) =>
      messageService.reanalyzeMessage(messageId),

    onSuccess: (_, messageId) => {
      queryClient.setQueryData(["messages", conversationId], (oldData: any) => {
        if (!oldData) return oldData;

        const newPages = oldData.pages.map((page: any) => ({
          ...page,
          data: page.data.map((msg: any) =>
            msg.id === messageId
              ? {
                  ...msg,
                  moderation_status: "pending",
                  moderated_at: null,
                }
              : msg,
          ),
        }));

        return { ...oldData, pages: newPages };
      });

      toast.success("🔄 Réanalyse en cours...");
    },

    onError: () => {
      toast.error("Erreur lors de la réanalyse");
    },
  });

  // ── Charger plus ──────────────────────────────────────────────────────────
  const loadMore = async () => {
    if (query.hasNextPage && !query.isFetchingNextPage) {
      await query.fetchNextPage();
    }
  };

  return {
    messages: allMessages,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    loadMore,
    sendMessage,
    deleteMessage,
    moderateMessage: moderateMessage.mutate,
    moderateMessageLoading: moderateMessage.isPending,
    reanalyzeMessage: reanalyzeMessage.mutate,
    reanalyzeMessageLoading: reanalyzeMessage.isPending,
    refetch: () => query.refetch(),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Récupérer une conversation spécifique
// ────────────────────────────────────────────────────────────────────────────
export function useConversation(conversationId: number) {
  const { data: conversations } = useConversations();

  return useQuery({
    queryKey: ["conversation", conversationId],
    queryFn: () => {
      const conversation = conversations?.data?.find(
        (conv: Conversation) => conv.id === conversationId,
      );
      return conversation || null;
    },
    enabled: !!conversations && !!conversationId,
  });
}

// ────────────────────────────────────────────────────────────────────────────
// Créer un groupe
// ────────────────────────────────────────────────────────────────────────────
export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      participantIds,
      name,
    }: {
      participantIds: number[];
      name?: string;
    }) => messageService.createGroupConversation(participantIds, name),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
      toast.success("Groupe créé avec succès");
    },

    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Erreur lors de la création",
      );
    },
  });
}

// ────────────────────────────────────────────────────────────────────────────
// File de review des messages
// ────────────────────────────────────────────────────────────────────────────
export function useMessageReviewQueue() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: ["moderation", "queue", "messages"],
    queryFn: ({ pageParam = 1 }) =>
      messageService.getMessageReviewQueue(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  });

  const reviewQueueMessages =
    query.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];

  return {
    messages: reviewQueueMessages,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Mes messages en attente
// ────────────────────────────────────────────────────────────────────────────
export function useMyMessages() {
  const pendingQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "messages", "pending"],
    queryFn: ({ pageParam = 1 }) =>
      messageService.getMyPendingMessages(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const rejectedQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "messages", "rejected"],
    queryFn: ({ pageParam = 1 }) =>
      messageService.getMyRejectedMessages(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const approvedQuery = useInfiniteQuery({
    queryKey: ["moderation", "my", "messages", "approved"],
    queryFn: ({ pageParam = 1 }) =>
      messageService.getMyApprovedMessages(pageParam as number),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
  });

  const summaryQuery = useQuery({
    queryKey: ["moderation", "my", "messages", "summary"],
    queryFn: () => messageService.getMyMessageModerationSummary(),
    staleTime: 2 * 60 * 1000,
  });

  const pendingMessages =
    pendingQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];
  const rejectedMessages =
    rejectedQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];
  const approvedMessages =
    approvedQuery.data?.pages.flatMap((p: any) => p.data?.data ?? []) ?? [];

  return {
    pending: pendingMessages,
    pendingLoading: pendingQuery.isLoading,
    rejected: rejectedMessages,
    rejectedLoading: rejectedQuery.isLoading,
    approved: approvedMessages,
    approvedLoading: approvedQuery.isLoading,
    summary: summaryQuery.data,
    summaryLoading: summaryQuery.isLoading,
    refetchAll: () => {
      pendingQuery.refetch();
      rejectedQuery.refetch();
      approvedQuery.refetch();
      summaryQuery.refetch();
    },
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Utilitaires
// ────────────────────────────────────────────────────────────────────────────
export function getMessageStatusLabel(status: ModerationStatus): string {
  const labels: Record<ModerationStatus, string> = {
    pending: "⏳ En attente",
    approved: "✅ Approuvé",
    review: "🔍 En révision",
    rejected: "❌ Rejeté",
  };
  return labels[status] || status;
}

export function getMessageStatusColor(status: ModerationStatus): string {
  const colors: Record<ModerationStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    approved: "bg-green-100 text-green-800 border-green-300",
    review: "bg-orange-100 text-orange-800 border-orange-300",
    rejected: "bg-red-100 text-red-800 border-red-300",
  };
  return colors[status] || "bg-gray-100 text-gray-800 border-gray-300";
}

// hooks/community/useMessage.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { messageService } from "@/services/community/message.service";
import { useCommunityStore } from "@/stores/community.store";
import { Message, Conversation } from "@/types/community.types";
import toast from "react-hot-toast";
import { useEffect } from "react";

// Récupérer toutes les conversations
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

// Récupérer les messages d'une conversation
export function useMessages(conversationId: number) {
  const queryClient = useQueryClient();

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
    refetchInterval: 5000,
  });

  // Les messages sont dans l'ordre décroissant (du plus récent au plus ancien)
  // On les inverse pour les afficher du plus ancien au plus récent
  const allMessages =
    query.data?.pages.flatMap((page) => page.data).reverse() ?? [];

  // 🔥 CORRECTION: Utiliser useEffect au lieu de useQuery pour markAsRead
  useEffect(() => {
    if (conversationId && allMessages.length > 0) {
      messageService.markAsRead(conversationId).catch(console.error);
    }
  }, [conversationId, allMessages.length]);

  const sendMessage = useMutation({
    mutationFn: ({ content, media }: { content: string; media?: File }) =>
      messageService.sendMessage(conversationId, content, media),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi");
    },
  });

  const deleteMessage = useMutation({
    mutationFn: (messageId: number) => messageService.deleteMessage(messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      toast.success("Message supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

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
  };
}

// Récupérer une conversation spécifique
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

// Créer un groupe
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

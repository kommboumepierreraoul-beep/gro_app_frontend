/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useQuery,
  useMutation,
  useQueryClient,
  useInfiniteQuery,
} from "@tanstack/react-query";
import { messageService } from "@/services/community/message.service";
import { useCommunityStore } from "@/store/community.store";

// ✅ Export useConversations
export function useConversations() {
  const setUnreadMessages = useCommunityStore((s) => s.setUnreadMessages);

  return useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const result = await messageService.getConversations();

      const total = (result.data?.data ?? []).reduce(
        // ✅ .data.data
        (acc: number, c: any) => acc + (c.unread_count ?? 0),
        0,
      );

      setUnreadMessages(total);
      return result;
    },
    refetchInterval: 10_000,
  });
}

// ✅ Export useMessages
export function useMessages(conversationId: string | number) {
  const queryClient = useQueryClient();
  const key = ["messages", conversationId];

  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: () => messageService.getMessages(conversationId),
    getNextPageParam: (lastPage: any) =>
      lastPage.data.current_page < lastPage.data.last_page
        ? lastPage.data.current_page + 1
        : undefined,
    initialPageParam: 1,
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });

  const allMessages =
    query.data?.pages.flatMap((p: any) => p.data.data).reverse() ?? [];

  const sendMessage = useMutation({
    mutationFn: ({ content }: { content: string }) =>
      messageService.sendMessage({ content, conversationId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: key });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  return {
    messages: allMessages,
    isLoading: query.isLoading,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    sendMessage,
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import  { messageService } from "@/services/community/message.service";
import { ChatWindow } from "@/components/community/messages/ChatWindow";
import { ConversationList } from "@/components/community/messages/ConversationList";
import { useAuthStore } from "@/store/auth.store";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const convId = Number(id);
  const { user } = useAuthStore();

  const { data: convs } = useQuery({
    queryKey: ["conversations"],
    queryFn: messageService.getConversations,
  });

  const conv = convs?.data.find((c: any) => c.id === convId);
  const participant = conv?.participants.find((p: any) => p.id !== user?.id);

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      style={{ height: "calc(100vh - 7rem)" }}
    >
      <div className="flex h-full">
        {/* Liste conversations — masquée sur mobile */}
        <div className="hidden md:block w-72 border-r border-gray-100 overflow-y-auto">
          <div className="p-4 border-b border-gray-100 font-bold text-gray-900 text-sm">
            Messages
          </div>
          <ConversationList activeId={convId} />
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          <ChatWindow convId={convId} participant={participant} />
        </div>
      </div>
    </div>
  );
}

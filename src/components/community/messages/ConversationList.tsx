/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { useConversations } from "@/hooks/community/useMessage";
import { useAuthStore } from "@/store/auth.store";

export function ConversationList({ activeId }: { activeId?: number }) {
  const { user } = useAuthStore();
  const { data, isLoading } = useConversations();
  const convs = data?.data?.data ?? []; // ✅ correction ici

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-2 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (convs.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-2xl mb-2">💬</p>
        <p className="text-sm text-gray-400">Aucune conversation</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto">
      {convs.map((conv: any) => {
        const other = conv.participants?.find((p: any) => p.id !== user?.id);
        const isActive = conv.id === activeId;
        const hasUnread = conv.unread_count > 0;

        return (
          <Link
            key={conv.id}
            href={`/messages/${conv.id}`}
            className={`flex items-center gap-3 px-4 py-3 transition ${
              isActive ? "bg-blue-50" : "hover:bg-gray-50"
            }`}
          >
            <div className="relative flex-shrink-0">
              <Avatar
                src={other?.avatar}
                firstname={other?.firstname ?? "?"}
                size="md"
              />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {conv.unread_count}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate ${hasUnread ? "font-bold text-gray-900" : "font-medium text-gray-800"}`}>
                  {other?.firstname} {other?.lastname}
                </p>
                {conv.last_message && (
                  <TimeAgo
                    date={conv.last_message.created_at}
                    className="flex-shrink-0 ml-2"
                  />
                )}
              </div>
              {conv.last_message && (
                <p className={`text-xs truncate mt-0.5 ${hasUnread ? "text-blue-600 font-medium" : "text-gray-400"}`}>
                  {conv.last_message.sender === user?.firstname ? "Vous : " : ""}
                  {conv.last_message.content}
                </p>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
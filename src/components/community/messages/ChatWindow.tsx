/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef } from "react";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { MessageInput } from "./MessageInput";
import { useMessages } from "@/hooks/community/useMessage";
import { useAuthStore } from "@/store/auth.store";

export function ChatWindow({
  convId,
  participant,
}: {
  convId: number;
  participant?: any;
}) {
  const { user } = useAuthStore();
  const { messages, isLoading, sendMessage } = useMessages(convId);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

  return (
    <div className="flex flex-col h-full">
      {/* Header conversation */}
      {participant && (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white">
          <Avatar
            src={participant.avatar}
            firstname={participant.firstname}
            size="md"
          />
          <div>
            <p className="font-semibold text-sm text-gray-900">
              {participant.firstname} {participant.lastname}
            </p>
            <p className="text-xs text-green-500">En ligne</p>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center py-8 text-sm text-gray-400">
            Commencez la conversation ! 👋
          </div>
        )}

        {messages.map((msg: any) => {
          const isMine = msg.sender_id === user?.id || msg.is_mine;

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${isMine ? "flex-row-reverse" : "flex-row"}`}
            >
              {!isMine && (
                <Avatar
                  src={msg.sender?.avatar}
                  firstname={msg.sender?.firstname}
                  size="xs"
                />
              )}

              <div
                className={`max-w-[70%] ${isMine ? "items-end" : "items-start"} flex flex-col gap-1`}
              >
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMine
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  {msg.content}
                </div>
                <TimeAgo date={msg.created_at} />
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput
        onSend={(content) => sendMessage.mutateAsync({ content })}
        isLoading={sendMessage.isPending}
      />
    </div>
  );
}

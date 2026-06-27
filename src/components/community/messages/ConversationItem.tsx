"use client";

import Link from "next/link";

export default function ConversationItem({
  conversation,
}: {
  conversation: any;
}) {
  return (
    <Link
      href={`/messages/${conversation.id}`}
      className="block p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="bg-gray-200 w-10 h-10 rounded-full flex-shrink-0"></div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{conversation.participantName}</p>
          <p className="text-sm text-gray-500 truncate">
            {conversation.lastMessage}
          </p>
        </div>
        <p className="text-xs text-gray-500">{conversation.lastMessageTime}</p>
      </div>
    </Link>
  );
}

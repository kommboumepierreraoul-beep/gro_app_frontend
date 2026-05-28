"use client";
import { ConversationList } from "@/components/community/messages/ConversationList";

export default function MessagesPage() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[60vh]">
      <div className="p-4 border-b border-gray-100">
        <h1 className="font-bold text-gray-900">Messages</h1>
      </div>
      <ConversationList />
    </div>
  );
}

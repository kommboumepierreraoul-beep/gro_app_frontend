"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { ConversationList } from "@/components/community/messages/ConversationList";
import { ChatWindow } from "@/components/community/messages/ChatWindow";
import { CreateDiscussion } from "@/components/community/messages/CreateDiscussion";
import { MessageCircle, Plus } from "lucide-react";

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("id");

  const [selectedConversation, setSelectedConversation] = useState<
    number | null
  >(conversationId ? Number(conversationId) : null);

  const [isCreateDiscussionOpen, setIsCreateDiscussionOpen] = useState(false);

  const handleDiscussionCreated = (id: number) => {
    setSelectedConversation(id);
    setIsCreateDiscussionOpen(false);
  };

  return (
    <div className="flex h-screen w-full xl:p-2 overflow-hidden bg-[#f9faf2]">
      {/* ================= LEFT ================= */}
      <section
        className={`
          flex flex-col
          w-full md:w-96
          border-r border-[rgba(194,201,187,0.35)]
          ${selectedConversation ? "hidden md:flex" : "flex"}
        `}
      >
        {/* HEADER */}
        <div className="px-6 py-4 border-b border-[rgba(194,201,187,0.35)] flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-[#154212]">Messages</h3>

          <button
            onClick={() => setIsCreateDiscussionOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 transition"
            style={{ background: "#bcf0ae", color: "#23501e" }}
          >
            <Plus size={18} />
          </button>
        </div>

        {/* LIST */}
        <div className="flex-1 overflow-y-auto">
          <ConversationList
            activeId={selectedConversation || undefined}
            onSelectConversation={setSelectedConversation}
          />
        </div>
      </section>

      {/* ================= RIGHT ================= */}
      <section className="flex-1 flex flex-col min-w-0 relative">
        {selectedConversation ? (
          <ChatWindow
            convId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center text-center px-6">
            <div className="max-w-sm">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center bg-[rgba(188,240,174,0.3)]">
                <MessageCircle size={32} color="#154212" />
              </div>

              <h2 className="text-xl font-semibold text-[#154212] mb-2">
                Démarrez une conversation
              </h2>

              <p className="text-sm text-[#72796e]">
                Créez une nouvelle discussion pour commencer à échanger.
              </p>
            </div>
          </div>
        )}

        {/* FLOAT BUTTON MOBILE */}
        <button
          onClick={() => setIsCreateDiscussionOpen(true)}
          className="
            md:hidden
            absolute bottom-6 right-6
            w-14 h-14
            flex items-center justify-center
            rounded-full shadow-lg
            hover:scale-105 transition
            z-50
          "
          style={{ background: "#bcf0ae", color: "#23501e" }}
        >
          <Plus size={24} />
        </button>
      </section>

      {/* MODAL */}
      <CreateDiscussion
        isOpen={isCreateDiscussionOpen}
        onClose={() => setIsCreateDiscussionOpen(false)}
        onSuccess={handleDiscussionCreated}
      />
    </div>
  );
}

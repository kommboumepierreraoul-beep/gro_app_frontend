"use client";

import { useState } from "react";
import { ConversationList } from "@/components/community/messages/ConversationList";
import { ChatWindow } from "@/components/community/messages/ChatWindow";
import { CreateDiscussion } from "@/components/community/messages/CreateDiscussion";
import { MessageCircle, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";

// ✅ Extraire la logique useSearchParams dans un composant séparé
function MessagesContent() {
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
    <div className="inset-0 top-16 h-[calc(100vh-4rem)] flex w-full overflow-hidden bg-[#f9faf2]">
      {/* ================= LEFT ================= */}
      <section
        className={`
          flex flex-col
          md:w-96
          border-r border-[rgba(194,201,187,0.35)]
          ${selectedConversation ? "hidden md:flex" : "flex"}
        `}
        style={{
          background: "rgba(249,250,242,0.96)",
          backdropFilter: "blur(12px)",
        }}
      >
        {/* HEADER */}
        <div
          className="px-6 py-4 border-b border-[rgba(194,201,187,0.35)] flex items-center justify-between flex-shrink-0"
          style={{ background: "rgba(249,250,242,0.98)" }}
        >
          <h3
            className="text-2xl font-semibold"
            style={{
              color: "#154212",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Messages
          </h3>

          <button
            onClick={() => setIsCreateDiscussionOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:scale-105 transition-all duration-150"
            style={{
              background: "#bcf0ae",
              color: "#23501e",
              border: "1px solid rgba(45,90,39,0.2)",
            }}
          >
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>

        {/* LIST */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
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
              <div
                className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{ background: "rgba(188,240,174,0.3)" }}
              >
                <MessageCircle size={32} color="#154212" />
              </div>

              <h2
                className="text-xl font-semibold mb-2"
                style={{
                  color: "#154212",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Démarrez une conversation
              </h2>

              <p className="text-sm" style={{ color: "#72796e" }}>
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
            hover:scale-105 transition-all duration-150
            z-50
          "
          style={{
            background: "#bcf0ae",
            color: "#23501e",
            border: "1px solid rgba(45,90,39,0.2)",
            boxShadow: "0 4px 16px rgba(21,66,18,0.15)",
          }}
        >
          <Plus size={24} strokeWidth={2.5} />
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

// ✅ Composant principal qui enveloppe avec Suspense (optionnel ici car géré dans page.tsx)
export default function MessagesPageContent() {
  return <MessagesContent />;
}

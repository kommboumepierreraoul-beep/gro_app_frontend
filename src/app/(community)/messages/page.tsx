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

  // État pour contrôler l'ouverture du modal de nouvelle discussion
  const [isCreateDiscussionOpen, setIsCreateDiscussionOpen] = useState(false);

  const handleOpenCreateDiscussion = () => {
    setIsCreateDiscussionOpen(true);
  };

  const handleDiscussionCreated = (conversationId: number) => {
    setSelectedConversation(conversationId);
    setIsCreateDiscussionOpen(false);
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden relative"
      style={{ background: "#f9faf2" }}
    >
      {/* Colonne 2 — Liste des conversations */}
      <section
        className={`
          ${selectedConversation ? "hidden md:flex" : "flex"}
          flex-col h-full
          w-full md:w-96
          flex-shrink-0
          z-30
        `}
        style={{
          background: "#f9faf2",
          borderRight: "1px solid rgba(194,201,187,0.35)",
        }}
      >
        {/* Header liste */}
        <div
          className="flex-shrink-0 px-6 py-4 space-y-3"
          style={{ borderBottom: "1px solid rgba(194,201,187,0.35)" }}
        >
          <div className="flex items-center justify-between">
            <h3
              className="text-2xl font-semibold"
              style={{
                color: "#154212",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Messages
            </h3>
            {/* Bouton 1 - En haut à côté du titre */}
            <button
              onClick={handleOpenCreateDiscussion}
              className="w-10 h-10 flex items-center justify-center rounded-full transition-transform hover:scale-105"
              style={{ background: "#bcf0ae", color: "#23501e" }}
              title="Nouvelle discussion"
            >
              <Plus size={18} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Liste scrollable */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <ConversationList
            activeId={selectedConversation || undefined}
            onSelectConversation={(id) => setSelectedConversation(id)}
          />
        </div>
      </section>

      {/* Colonne 3 — Fenêtre de chat */}
      {selectedConversation ? (
        <section
          className={`
            ${selectedConversation ? "flex" : "hidden"}
            lg:flex flex-1 flex-col h-full min-w-0 relative
          `}
          style={{ background: "#f9faf2" }}
        >
          <ChatWindow
            convId={selectedConversation}
            onBack={() => setSelectedConversation(null)}
          />
        </section>
      ) : (
        <section
          className="hidden lg:flex flex-1 flex-col items-center justify-center h-full relative"
          style={{ background: "#f9faf2" }}
        >
          {/* Empty state */}
          <div className="text-center px-8 max-w-sm">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ background: "rgba(188,240,174,0.3)" }}
            >
              <MessageCircle
                size={32}
                strokeWidth={1.5}
                style={{ color: "#154212" }}
              />
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
            <p className="text-sm leading-relaxed" style={{ color: "#72796e" }}>
              Créez une nouvelle discussion ou un groupe pour échanger avec vos
              amis.
            </p>
          </div>
          {/* Bouton 2 - En bas à droite */}
          <button
            onClick={handleOpenCreateDiscussion}
            className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 z-50"
            style={{ background: "#bcf0ae", color: "#23501e" }}
            title="Nouvelle discussion"
          >
            <Plus size={24} strokeWidth={2} />
          </button>
        </section>
      )}

      {/* Modal de nouvelle discussion */}
      <CreateDiscussion
        isOpen={isCreateDiscussionOpen}
        onClose={() => setIsCreateDiscussionOpen(false)}
        onSuccess={handleDiscussionCreated}
      />
    </div>
  );
}

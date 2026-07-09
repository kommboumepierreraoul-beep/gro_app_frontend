/* eslint-disable @typescript-eslint/no-explicit-any */
// components/ai/ChatSidebar.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useAIChat } from "@/hooks/AI/useAIChat";
import {
  Plus,
  MessageSquare,
  Trash2,
  Loader2,
  Bot,
  Clock,
  MessageCircle,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChatSidebarProps {
  currentConversationId?: string | null;
  onNewConversation: () => void;
  onSelectConversation?: (id: string) => void;
  onClose?: () => void;
}

export function ChatSidebar({
  currentConversationId,
  onNewConversation,
  onSelectConversation,
  onClose,
}: ChatSidebarProps) {
  const { conversations, loadConversations, deleteConversation, loading } =
    useAIChat();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = (id: string) => {
    onSelectConversation?.(id);
    onClose?.(); // Ferme automatiquement sur mobile
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation?.(id);
      await loadConversations();
      if (currentConversationId === id) {
        onNewConversation();
      }
      toast.success("Conversation supprimée");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Impossible de supprimer la conversation");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const iconBtnStyle: React.CSSProperties = {
    padding: "8px 16px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
    border: "1px solid rgba(49,69,45,0.12)",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
    background: "#31452d",
    color: "#f3f7ee",
  };

  return (
    <aside
      className="h-full w-full flex flex-col bg-[rgba(249,250,242,0.98)] backdrop-blur-sm"
      style={{ background: "rgba(249,250,242,0.98)" }}
    >
      {/* Header avec bouton close sur mobile */}
      <div
        className="p-3 sm:p-4 border-b border-[rgba(194,201,187,0.3)] flex-shrink-0 flex items-center justify-between"
        style={{ background: "rgba(249,250,242,0.98)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #31452d 0%, #1f2d1d 100%)",
              color: "#e8f5df",
            }}
          >
            <Bot size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <h2
              className="font-semibold text-sm sm:text-base"
              style={{
                color: "#191c18",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Conversations
            </h2>
            <p
              className="text-xs"
              style={{
                color: "#72796e",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {conversations.length} conversation
              {conversations.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Bouton de fermeture sur mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-2 rounded-xl hover:bg-black/5 active:bg-black/10 transition-all duration-150"
          style={{ color: "#42493e" }}
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Bouton nouvelle conversation */}
      <div className="p-3 sm:p-4 flex-shrink-0">
        <button
          onClick={onNewConversation}
          style={iconBtnStyle}
          className="hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
          onMouseEnter={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.boxShadow = "0 8px 18px rgba(25,28,24,0.16)";
          }}
          onMouseLeave={(e) => {
            const target = e.currentTarget as HTMLElement;
            target.style.boxShadow = "none";
          }}
        >
          <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
          Nouvelle conversation
        </button>
      </div>

      {/* Liste des conversations */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 space-y-1 gro-sidebar-scroll">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2
              size={28}
              className="animate-spin"
              style={{ color: "#2d5a27" }}
            />
            <p
              className="text-sm"
              style={{
                color: "#72796e",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Chargement...
            </p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(49,69,45,0.12) 0%, rgba(244,187,146,0.16) 100%)",
                border: "1px solid rgba(194,201,187,0.4)",
              }}
            >
              <MessageCircle size={24} style={{ color: "#31452d" }} />
            </div>
            <p
              className="text-sm font-medium mb-1"
              style={{
                color: "#191c18",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Aucune conversation
            </p>
            <p
              className="text-xs"
              style={{
                color: "#72796e",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              Commencez une nouvelle discussion
            </p>
          </div>
        ) : (
          conversations.map((conv: any) => {
            const isActive = currentConversationId === conv.id;
            return (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`group flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                  isActive
                    ? "border border-[rgba(49,69,45,0.16)] bg-[rgba(49,69,45,0.08)] shadow-sm"
                    : "hover:bg-[rgba(49,69,45,0.05)] border border-transparent hover:border-[rgba(194,201,187,0.4)]"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelectConversation(conv.id);
                  }
                }}
              >
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? "bg-[#31452d] text-white"
                      : "bg-[rgba(49,69,45,0.08)] text-[#31452d] group-hover:bg-[rgba(49,69,45,0.14)]"
                  }`}
                >
                  <MessageSquare size={14} className="sm:w-4 sm:h-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs sm:text-sm font-semibold truncate ${
                      isActive ? "text-[#31452d]" : "text-[#191c18]"
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {conv.title || "Nouvelle conversation"}
                  </p>
                  <div
                    className="flex items-center gap-1.5 text-[10px] sm:text-xs mt-0.5"
                    style={{
                      color: "#72796e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span>{conv.message_count} msg</span>
                    <span className="opacity-40">•</span>
                    <div className="flex items-center gap-1">
                      <Clock size={10} className="sm:w-[11px] sm:h-[11px]" />
                      <span>{formatDate(conv.created_at)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => handleDelete(e, conv.id)}
                  disabled={deletingId === conv.id}
                  className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-150 hover:bg-[rgba(186,26,26,0.08)] shrink-0 disabled:opacity-50 touch:opacity-100"
                  aria-label="Supprimer la conversation"
                >
                  {deletingId === conv.id ? (
                    <Loader2
                      size={12}
                      className="animate-spin"
                      style={{ color: "#ba1a1a" }}
                    />
                  ) : (
                    <Trash2 size={12} style={{ color: "#72796e" }} />
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Footer - version simplifiée sur mobile */}
      <div
        className="p-3 sm:p-4 border-t border-[rgba(194,201,187,0.3)] flex-shrink-0"
        style={{ background: "rgba(249,250,242,0.98)" }}
      >
        <div
          className="flex items-center gap-2 text-[10px] sm:text-xs"
          style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
        >
          <Bot size={12} className="sm:w-[14px] sm:h-[14px]" />
          <span>AgriPulse IA v1.0</span>
          <span className="opacity-30">•</span>
          <span className="opacity-60 hidden xs:inline">Communauté</span>
        </div>
      </div>

      <style jsx global>{`
        .gro-sidebar-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .gro-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .gro-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(45, 90, 39, 0.2);
          border-radius: 10px;
        }
        .gro-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(49, 69, 45, 0.35);
        }

        /* Support tactile pour les boutons de suppression */
        @media (pointer: coarse) {
          .group button {
            opacity: 1 !important;
          }
        }

        @media (max-width: 400px) {
          .xs\\:inline {
            display: none;
          }
        }
      `}</style>
    </aside>
  );
}

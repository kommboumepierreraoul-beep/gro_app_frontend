/* eslint-disable react/no-unescaped-entities */
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
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChatSidebarProps {
  currentConversationId?: string | null;
  onNewConversation: () => void;
  onSelectConversation?: (id: string) => void;
}

export function ChatSidebar({
  currentConversationId,
  onNewConversation,
  onSelectConversation,
}: ChatSidebarProps) {
  const { conversations, loadConversations, deleteConversation, loading } =
    useAIChat();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    loadConversations();
  }, []);

  const handleSelectConversation = (id: string) => {
    onSelectConversation?.(id);
    setIsMobileOpen(false);
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
    borderRadius: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 600,
    border: "none",
    cursor: "pointer",
    transition: "all 0.15s",
    fontFamily: "'Inter', sans-serif",
    width: "100%",
  };

  return (
    <>
      {/* Bouton toggle mobile */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed bottom-4 right-4 md:hidden z-50 p-3 rounded-full shadow-lg"
        style={{
          background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
          color: "#bcf0ae",
          boxShadow: "0 4px 16px rgba(45,90,39,0.3)",
        }}
      >
        <MessageSquare size={20} />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`
          w-72 sm:w-80 shrink-0 border-r border-[rgba(194,201,187,0.3)] 
          bg-[rgba(249,250,242,0.95)] backdrop-blur-sm flex flex-col h-full
          fixed md:relative inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ background: "rgba(249,250,242,0.95)" }}
      >
        {/* Header */}
        <div
          className="p-4 border-b border-[rgba(194,201,187,0.3)] flex-shrink-0"
          style={{ background: "rgba(249,250,242,0.98)" }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
              style={{
                background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
                color: "#bcf0ae",
              }}
            >
              <Bot size={20} />
            </div>
            <div>
              <h2
                className="font-semibold text-base"
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
                {conversations.length} conversation{conversations.length > 1 ? "s" : ""}
              </p>
            </div>
          </div>

          <button
            onClick={onNewConversation}
            style={iconBtnStyle}
            className="hover:scale-[1.02] active:scale-[0.98]"
            onMouseEnter={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.boxShadow = "0 4px 12px rgba(45,90,39,0.25)";
            }}
            onMouseLeave={(e) => {
              const target = e.currentTarget as HTMLElement;
              target.style.boxShadow = "0 2px 8px rgba(45,90,39,0.15)";
            }}
          >
            <Plus size={16} />
            Nouvelle conversation
          </button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 gro-sidebar-scroll">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2
                size={32}
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
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(188,240,174,0.35) 0%, rgba(244,187,146,0.15) 100%)",
                  border: "1px solid rgba(194,201,187,0.4)",
                }}
              >
                <MessageCircle size={28} style={{ color: "#72796e" }} />
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
                Commencez une nouvelle discussion avec l'assistant IA
              </p>
            </div>
          ) : (
            conversations.map((conv: any) => {
              const isActive = currentConversationId === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv.id)}
                  className={`group flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-[rgba(45,90,39,0.08)] border border-[rgba(45,90,39,0.15)] shadow-sm"
                      : "hover:bg-[rgba(45,90,39,0.04)] border border-transparent hover:border-[rgba(194,201,187,0.3)]"
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
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive
                        ? "bg-[#2d5a27] text-white"
                        : "bg-[rgba(45,90,39,0.08)] text-[#2d5a27] group-hover:bg-[rgba(45,90,39,0.15)]"
                    }`}
                  >
                    <MessageSquare size={16} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isActive ? "text-[#2d5a27]" : "text-[#191c18]"
                      }`}
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {conv.title || "Nouvelle conversation"}
                    </p>
                    <div
                      className="flex items-center gap-1.5 text-xs mt-0.5"
                      style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
                    >
                      <span>{conv.message_count} msg</span>
                      <span className="opacity-40">•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={11} />
                        <span>{formatDate(conv.created_at)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all duration-150 hover:bg-[rgba(186,26,26,0.08)] shrink-0 disabled:opacity-50"
                    aria-label="Supprimer la conversation"
                  >
                    {deletingId === conv.id ? (
                      <Loader2 size={14} className="animate-spin" style={{ color: "#ba1a1a" }} />
                    ) : (
                      <Trash2 size={14} style={{ color: "#72796e" }} />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div
          className="p-4 border-t border-[rgba(194,201,187,0.3)] flex-shrink-0"
          style={{ background: "rgba(249,250,242,0.98)" }}
        >
          <div
            className="flex items-center gap-2 text-xs"
            style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
          >
            <Bot size={14} />
            <span>Assistant IA v1.0</span>
            <span className="opacity-30">•</span>
            <span className="opacity-60">Communauté</span>
          </div>
        </div>
      </aside>

      <style jsx global>{`
        .gro-sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .gro-sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .gro-sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(45, 90, 39, 0.2);
          border-radius: 10px;
        }
        .gro-sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 90, 39, 0.35);
        }
      `}</style>
    </>
  );
}
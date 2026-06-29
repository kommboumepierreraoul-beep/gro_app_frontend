/* eslint-disable react/no-unescaped-entities */
// components/ai/ChatInterface.tsx
"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAIChat } from "@/hooks/AI/useAIChat";
import { useStreamingChat } from "@/hooks/AI/useStreamingChat";
import { ChatMessage } from "./ChatMessage";
import { MessageInput } from "./MessageInput";
import { ChatSidebar } from "./ChatSidebar";
import { AIMessage } from "@/types/ai.types";
import {
  Plus,
  Sparkles,
  MessageSquare,
  Bot,
  MoreVertical,
  Copy,
  Trash2,
  Wand2,
  Tag,
  FileText,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

export function ChatInterface() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // États pour l'effet d'écriture
  const [displayedContent, setDisplayedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const typingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const charIndexRef = useRef(0);

  const { sendMessage, loading, loadConversation } = useAIChat();
  const { isStreaming, streamingContent, streamMessage } = useStreamingChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Scroll initial
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      setTimeout(() => {
        scrollToBottom();
        setIsInitialLoad(false);
      }, 100);
    }
  }, [messages, isInitialLoad]);

  // Effet d'écriture pour le message en attente
  useEffect(() => {
    if (pendingMessage) {
      setIsTyping(true);
      setDisplayedContent("");
      charIndexRef.current = 0;

      const typeSpeed = 0.5; // ms par caractère
      let timeoutId: NodeJS.Timeout;

      const typeChar = () => {
        if (charIndexRef.current < pendingMessage.length) {
          const nextChar = pendingMessage[charIndexRef.current];
          setDisplayedContent((prev) => prev + nextChar);
          charIndexRef.current++;
          timeoutId = setTimeout(typeChar, typeSpeed);
          scrollToBottom();
        } else {
          // Fin de l'écriture
          setIsTyping(false);
          setPendingMessage(null);
          // Ajouter le message complet à la liste
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "assistant",
              content: pendingMessage,
              createdAt: new Date(),
            },
          ]);
          setDisplayedContent("");
        }
      };

      const startDelay = setTimeout(typeChar, 300);

      return () => {
        clearTimeout(startDelay);
        clearTimeout(timeoutId);
      };
    }
  }, [pendingMessage]);

  const handleSelectConversation = async (id: string) => {
    const conv = await loadConversation(id);
    setMessages(conv.messages ?? []);
    setCurrentConversationId(id);
  };

  const handleSendMessage = async (content: string, useStreaming = true) => {
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Nettoyer tout typing en cours
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
      typingIntervalRef.current = null;
    }
    setIsTyping(false);
    setPendingMessage(null);
    setDisplayedContent("");

    if (useStreaming) {
      try {
        const result = await streamMessage(
          {
            message: content,
            conversation_id: currentConversationId ?? undefined,
          },
          () => scrollToBottom(),
        );
        if (result) {
          // Utiliser l'effet d'écriture pour le message reçu
          setPendingMessage(result.content);
          if (result.conversationId) {
            setCurrentConversationId(result.conversationId);
          }
        }
      } catch {
        // error displayed by hook
      }
    } else {
      try {
        const response = await sendMessage({
          message: content,
          conversation_id: currentConversationId ?? undefined,
          stream: false,
        });
        // Utiliser l'effet d'écriture
        setPendingMessage(response.message.content);
        setCurrentConversationId(response.conversation_id);
      } catch {
        // error displayed by hook
      }
    }
  };

  const handleNewConversation = () => {
    // Nettoyer le typing
    setIsTyping(false);
    setPendingMessage(null);
    setDisplayedContent("");
    setMessages([]);
    setCurrentConversationId(null);
    setShowMenu(false);
  };

  const handleCopyConversationId = () => {
    if (currentConversationId) {
      navigator.clipboard.writeText(currentConversationId);
      toast.success("ID de conversation copié");
      setShowMenu(false);
    }
  };

  const quickPrompts = [
    {
      label: "Analyser un post de la communauté",
      icon: <FileText size={16} />,
    },
    { label: "Générer des tags pour mon article", icon: <Tag size={16} /> },
    { label: "Résumer une discussion", icon: <MessageSquare size={16} /> },
    { label: "Améliorer mon texte", icon: <Wand2 size={16} /> },
  ];

  const iconBtnStyle: React.CSSProperties = {
    width: 36,
    height: 36,
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#42493e",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    transition: "all 0.15s",
  };

  // Fonction pour afficher le message en cours d'écriture ou streaming
  const getCurrentAssistantMessage = () => {
    if (isTyping && displayedContent) {
      return {
        id: "typing",
        role: "assistant" as const,
        content: displayedContent,
        isStreaming: true,
        createdAt: new Date(),
      };
    }
    if (isStreaming && streamingContent) {
      return {
        id: "streaming",
        role: "assistant" as const,
        content: streamingContent,
        isStreaming: true,
        createdAt: new Date(),
      };
    }
    return null;
  };

  const currentAssistantMessage = getCurrentAssistantMessage();

  return (
    <div
      className="flex h-full w-full overflow-hidden"
      style={{ background: "rgba(249,250,242,0.5)" }}
    >
      {/* Sidebar conversations */}
      <ChatSidebar
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSelectConversation={handleSelectConversation}
      />

      {/* Zone chat principale */}
      <section className="flex-1 flex flex-col overflow-hidden bg-[#f9faf2]">
        {/* ================= HEADER ================= */}
        <div
          className="flex fixed w-full md:w-auto items-center justify-between px-3 sm:px-4 py-2 sm:py-3 flex-shrink-0 z-10"
          style={{
            background: "rgba(249,250,242,0.95)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(194,201,187,0.4)",
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
                color: "#bcf0ae",
              }}
            >
              <Bot size={18} className="sm:w-[20px] sm:h-[20px]" />
            </div>

            <div className="min-w-0 flex-1">
              <p
                className="font-semibold text-sm sm:text-base truncate"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                AgriPulse IA
              </p>
              <p
                className="text-xs truncate"
                style={{
                  color: "#72796e",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {currentConversationId
                  ? `Conversation ${currentConversationId.slice(0, 8)}`
                  : "Nouvelle conversation"}
              </p>
            </div>
          </div>

          {/* Actions desktop */}
          <div className="hidden sm:flex items-center gap-1 relative">
            <button
              onClick={handleNewConversation}
              style={iconBtnStyle}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(188,240,174,0.25)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
              title="Nouvelle conversation"
            >
              <Plus size={17} />
            </button>

            <button
              onClick={() => setShowMenu(!showMenu)}
              style={iconBtnStyle}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(188,240,174,0.25)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              <MoreVertical size={17} />
            </button>

            {/* Dropdown menu desktop */}
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1 z-20 overflow-hidden"
                  style={{
                    background: "rgba(249,250,242,0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(194,201,187,0.45)",
                    boxShadow: "0 10px 30px rgba(21,66,18,0.1)",
                    animation: "groSlideDown 0.15s ease-out",
                  }}
                >
                  <button
                    onClick={handleNewConversation}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-[rgba(188,240,174,0.2)]"
                    style={{
                      color: "#42493e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span style={{ color: "#72796e" }}>
                      <Plus size={15} />
                    </span>
                    Nouvelle conversation
                  </button>
                  {currentConversationId && (
                    <>
                      <button
                        onClick={handleCopyConversationId}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-[rgba(188,240,174,0.2)]"
                        style={{
                          color: "#42493e",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <span style={{ color: "#72796e" }}>
                          <Copy size={15} />
                        </span>
                        Copier l'ID
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          toast.success("Conversation supprimée");
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-[rgba(186,26,26,0.06)]"
                        style={{
                          color: "#ba1a1a",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <Trash2 size={15} />
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Bouton menu mobile */}
          <button
            onClick={() => setShowMenu(true)}
            className="sm:hidden p-1.5 rounded-xl transition-all duration-150 active:bg-black/5"
            style={{ color: "#42493e" }}
          >
            <MoreVertical size={20} />
          </button>
        </div>

        {/* ================= MESSAGES ================= */}
        <div
          className="flex-1 overflow-y-auto px-2 sm:px-4 py-3 sm:py-4 space-y-2 sm:space-y-3 gro-chat-scroll mt-[64px] md:mt-[72px]"
          style={{ background: "rgba(243,244,237,0.6)" }}
        >
          {/* État vide — welcome screen */}
          {messages.length === 0 && !isStreaming && !isTyping && (
            <div className="max-w-2xl mx-auto text-center mt-3xl">
              {/* Icône */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(188,240,174,0.35) 0%, rgba(244,187,146,0.15) 100%)",
                  border: "1px solid rgba(194,201,187,0.4)",
                }}
              >
                <Sparkles size={32} style={{ color: "#2d5a27" }} />
              </div>

              <h2
                className="text-xl sm:text-2xl font-semibold mb-2"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Assistant IA Communauté
              </h2>
              <p
                className="text-sm mb-6"
                style={{
                  color: "#72796e",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Générez des tags, résumez des discussions, améliorez vos posts —
                en quelques secondes.
              </p>

              {/* Suggestions rapides */}
              <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() => handleSendMessage(prompt.label)}
                    className="group p-4 rounded-2xl border bg-white border-[rgba(194,201,187,0.4)] font-medium text-sm text-left transition-all hover:border-[#2d5a27] hover:shadow-sm active:scale-[0.98]"
                    style={{
                      color: "#42493e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span className="block mb-1.5" style={{ color: "#2d5a27" }}>
                      {prompt.icon}
                    </span>
                    {prompt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="max-w-3xl mx-auto space-y-3">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {/* Message en cours d'écriture (effet machine à écrire) */}
            {currentAssistantMessage && (
              <ChatMessage message={currentAssistantMessage} />
            )}

            {/* Loading direct */}
            {loading && !isStreaming && !isTyping && (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
                    color: "#bcf0ae",
                  }}
                >
                  <Bot size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl rounded-tl-sm border"
                  style={{
                    background: "white",
                    borderColor: "rgba(194,201,187,0.3)",
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: "#2d5a27",
                        animationDelay: "0ms",
                      }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: "#2d5a27",
                        animationDelay: "150ms",
                      }}
                    />
                    <span
                      className="w-2 h-2 rounded-full animate-bounce"
                      style={{
                        background: "#2d5a27",
                        animationDelay: "300ms",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ================= INPUT ZONE ================= */}
        <div
          className="flex-shrink-0 px-2 sm:px-4 py-2 sm:py-3"
          style={{
            background: "#f9faf2",
            borderTop: "1px solid rgba(194,201,187,0.4)",
          }}
        >
          <MessageInput
            onSend={handleSendMessage}
            isLoading={loading || isStreaming || isTyping}
          />
        </div>
      </section>

      <style jsx global>{`
        .gro-chat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .gro-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .gro-chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(45, 90, 39, 0.2);
          border-radius: 10px;
        }
        .gro-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 90, 39, 0.35);
        }
        @keyframes groSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
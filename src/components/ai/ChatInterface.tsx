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
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

export function ChatInterface() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
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

      const typeSpeed = 0.01;
      let timeoutId: NodeJS.Timeout;

      const typeChar = () => {
        if (charIndexRef.current < pendingMessage.length) {
          const nextChar = pendingMessage[charIndexRef.current];
          setDisplayedContent((prev) => prev + nextChar);
          charIndexRef.current++;
          timeoutId = setTimeout(typeChar, typeSpeed);
          scrollToBottom();
        } else {
          setIsTyping(false);
          setPendingMessage(null);
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
    setShowSidebar(false);
  };

  const handleSendMessage = async (content: string, useStreaming = true) => {
    const userMessage: AIMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

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
        setPendingMessage(response.message.content);
        setCurrentConversationId(response.conversation_id);
      } catch {
        // error displayed by hook
      }
    }
  };

  const handleNewConversation = () => {
    setIsTyping(false);
    setPendingMessage(null);
    setDisplayedContent("");
    setMessages([]);
    setCurrentConversationId(null);
    setShowMenu(false);
    setShowSidebar(false);
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
      label: "Analyser un post",
      icon: <FileText size={16} />,
      description: "de la communauté",
    },
    {
      label: "Générer des tags",
      icon: <Tag size={16} />,
      description: "pour mon article",
    },
    {
      label: "Résumer une discussion",
      icon: <MessageSquare size={16} />,
      description: "en quelques mots",
    },
    {
      label: "Améliorer mon texte",
      icon: <Wand2 size={16} />,
      description: "correction et style",
    },
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
      className="flex h-full min-h-0 w-full overflow-hidden relative"
      style={{ background: "rgba(246,247,240,0.86)" }}
    >
      {/* Overlay tiroir mobile - plus visible sur mobile */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden animate-fade-in"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Sidebar conversations */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 w-[85vw] max-w-sm transform transition-transform duration-300 ease-in-out
          md:static md:z-auto md:translate-x-0 md:w-72 md:max-w-none md:shadow-none
          ${showSidebar ? "translate-x-0" : "-translate-x-full"}
          shadow-2xl md:shadow-none
        `}
      >
        <ChatSidebar
          currentConversationId={currentConversationId}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          onClose={() => setShowSidebar(false)}
        />
      </div>

      {/* Zone chat principale */}
      <section className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f9faf2]">
        {/* ================= HEADER ================= */}
        <div
          className="z-10 flex min-h-[56px] sm:min-h-[64px] flex-shrink-0 items-center justify-between gap-2 px-2 py-2 sm:px-5 sm:py-3 border-b border-[rgba(194,201,187,0.45)]"
          style={{
            background: "rgba(249,250,242,0.95)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            {/* Bouton menu mobile - plus visible */}
            <button
              onClick={() => setShowSidebar(true)}
              className="md:hidden flex-shrink-0 p-2 rounded-xl hover:bg-black/5 active:bg-black/10 transition-all duration-150"
              style={{ color: "#42493e" }}
              aria-label="Voir les conversations"
            >
              <Menu size={20} />
            </button>

            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #31452d 0%, #1f2d1d 100%)",
                color: "#e8f5df",
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
                className="text-xs truncate hidden sm:block"
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

          {/* Actions - version desktop */}
          <div className="hidden sm:flex items-center gap-1 relative">
            <button
              onClick={handleNewConversation}
              style={iconBtnStyle}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(49,69,45,0.08)")
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
                  "rgba(49,69,45,0.08)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              <MoreVertical size={17} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="absolute right-0 top-full mt-2 w-52 rounded-2xl py-1 z-20 overflow-hidden animate-slide-down"
                  style={{
                    background: "rgba(249,250,242,0.98)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(194,201,187,0.45)",
                    boxShadow: "0 18px 42px rgba(25,28,24,0.12)",
                  }}
                >
                  <button
                    onClick={handleNewConversation}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-[rgba(49,69,45,0.08)]"
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
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-[rgba(49,69,45,0.08)]"
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

          {/* Menu mobile - version améliorée */}
          <div className="sm:hidden flex items-center gap-1">
            <button
              onClick={handleNewConversation}
              className="p-2 rounded-xl hover:bg-black/5 active:bg-black/10 transition-all duration-150"
              style={{ color: "#42493e" }}
              aria-label="Nouvelle conversation"
            >
              <Plus size={20} />
            </button>

            <button
              onClick={() => setShowMenu(true)}
              className="p-2 rounded-xl hover:bg-black/5 active:bg-black/10 transition-all duration-150"
              style={{ color: "#42493e" }}
              aria-label="Options"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20 bg-black/30 animate-fade-in"
                  onClick={() => setShowMenu(false)}
                />
                <div
                  className="fixed bottom-0 left-0 right-0 z-30 rounded-t-3xl overflow-hidden border-t border-[rgba(194,201,187,0.5)] bg-[#f9faf2] py-2 px-2 animate-slide-up"
                  style={{
                    boxShadow: "0 -10px 40px rgba(25,28,24,0.15)",
                    paddingBottom:
                      "calc(0.75rem + env(safe-area-inset-bottom))",
                  }}
                >
                  <div className="w-12 h-1 bg-[rgba(194,201,187,0.6)] rounded-full mx-auto mb-3" />

                  <button
                    onClick={handleNewConversation}
                    className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(49,69,45,0.08)] active:bg-[rgba(49,69,45,0.12)]"
                    style={{
                      color: "#42493e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span className="p-1.5 rounded-lg bg-[rgba(49,69,45,0.08)]">
                      <Plus size={18} style={{ color: "#31452d" }} />
                    </span>
                    Nouvelle conversation
                  </button>

                  {currentConversationId && (
                    <>
                      <button
                        onClick={handleCopyConversationId}
                        className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(49,69,45,0.08)] active:bg-[rgba(49,69,45,0.12)]"
                        style={{
                          color: "#42493e",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <span className="p-1.5 rounded-lg bg-[rgba(49,69,45,0.08)]">
                          <Copy size={18} style={{ color: "#31452d" }} />
                        </span>
                        Copier l'ID de conversation
                      </button>

                      <button
                        onClick={() => {
                          setShowMenu(false);
                          toast.success("Conversation supprimée");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors hover:bg-[rgba(186,26,26,0.06)] active:bg-[rgba(186,26,26,0.12)]"
                        style={{
                          color: "#ba1a1a",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <span className="p-1.5 rounded-lg bg-[rgba(186,26,26,0.06)]">
                          <Trash2 size={18} />
                        </span>
                        Supprimer cette conversation
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setShowMenu(false)}
                    className="flex w-full items-center justify-center gap-3 px-4 py-3 mt-1 rounded-xl text-sm font-medium transition-colors hover:bg-black/5 active:bg-black/10"
                    style={{
                      color: "#72796e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    Fermer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ================= MESSAGES ================= */}
        <div
          className="gro-chat-scroll flex-1 space-y-2 overflow-y-auto px-2 py-3 sm:space-y-3 sm:px-6 sm:py-5"
          style={{
            background:
              "linear-gradient(180deg, rgba(246,247,240,0.7), rgba(249,250,242,0.96))",
          }}
        >
          {/* État vide — welcome screen */}
          {messages.length === 0 && !isStreaming && !isTyping && (
            <div className="mx-auto flex min-h-[50vh] max-w-2xl flex-col justify-center py-6 text-center sm:min-h-[60vh] sm:py-12 px-3">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(49,69,45,0.12) 0%, rgba(244,187,146,0.18) 100%)",
                  border: "1px solid rgba(194,201,187,0.4)",
                }}
              >
                <Sparkles
                  size={28}
                  className="sm:w-8 sm:h-8"
                  style={{ color: "#31452d" }}
                />
              </div>

              <h2
                className="text-lg sm:text-2xl font-semibold mb-1 sm:mb-2 px-2"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Assistant IA Communauté
              </h2>
              <p
                className="text-xs sm:text-sm mb-4 sm:mb-6 px-4"
                style={{
                  color: "#72796e",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Générez des tags, résumez des discussions, améliorez vos posts
              </p>

              {/* Quick prompts - version mobile améliorée */}
              <div className="mx-auto grid w-full max-w-xl grid-cols-1 gap-2 px-1 sm:gap-3 sm:grid-cols-2 sm:px-0">
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt.label}
                    onClick={() =>
                      handleSendMessage(`${prompt.label} ${prompt.description}`)
                    }
                    className="group rounded-2xl border border-[rgba(194,201,187,0.45)] bg-white p-3 sm:p-4 text-left transition-all hover:border-[#31452d] hover:bg-[#fbfcf7] active:scale-[0.97] shadow-sm"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    <span className="block mb-1" style={{ color: "#31452d" }}>
                      {prompt.icon}
                    </span>
                    <p
                      className="text-xs sm:text-sm font-medium"
                      style={{ color: "#42493e" }}
                    >
                      {prompt.label}
                    </p>
                    <p
                      className="text-[10px] sm:text-xs mt-0.5 opacity-60"
                      style={{ color: "#72796e" }}
                    >
                      {prompt.description}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="mx-auto w-full max-w-3xl space-y-2 sm:space-y-3 px-1 sm:px-0">
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}

            {currentAssistantMessage && (
              <ChatMessage message={currentAssistantMessage} />
            )}

            {loading && !isStreaming && !isTyping && (
              <div className="flex gap-2 sm:gap-3">
                <div
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background:
                      "linear-gradient(135deg, #31452d 0%, #1f2d1d 100%)",
                    color: "#e8f5df",
                  }}
                >
                  <Bot size={14} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div
                  className="px-3 py-2.5 sm:px-4 sm:py-3 rounded-2xl rounded-tl-sm border"
                  style={{
                    background: "white",
                    borderColor: "rgba(194,201,187,0.3)",
                  }}
                >
                  <div className="flex gap-1.5 items-center">
                    <span
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce"
                      style={{ background: "#31452d", animationDelay: "0ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce"
                      style={{ background: "#31452d", animationDelay: "150ms" }}
                    />
                    <span
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full animate-bounce"
                      style={{ background: "#31452d", animationDelay: "300ms" }}
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
          className="flex-shrink-0 px-2 py-2 sm:px-6 sm:py-3"
          style={{
            background: "rgba(249,250,242,0.96)",
            borderTop: "1px solid rgba(194,201,187,0.4)",
            paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom))",
          }}
        >
          <MessageInput
            onSend={handleSendMessage}
            isLoading={loading || isStreaming || isTyping}
            placeholder="Posez votre question..."
          />
        </div>
      </section>

      <style jsx global>{`
        .gro-chat-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .gro-chat-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .gro-chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(49, 69, 45, 0.2);
          border-radius: 10px;
        }
        .gro-chat-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(49, 69, 45, 0.35);
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-down {
          animation: slide-down 0.15s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.2s ease-out;
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        /* Améliorations du scroll sur mobile */
        @media (max-width: 640px) {
          .gro-chat-scroll {
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
          }
        }
      `}</style>
    </div>
  );
}

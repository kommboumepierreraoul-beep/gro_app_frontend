/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "../shared/Avatar";
import { MessageInput } from "./MessageInput";
import MessageBubble from "./MessageBubble";
import { useMessages, useConversation } from "@/hooks/community/useMessage";
import { useAuthStore } from "@/stores/auth.store";
import {
  ArrowLeft,
  MoreVertical,
  Phone,
  Video,
  Users,
  UserPlus,
  LogOut,
  Copy,
  X,
  Reply,
} from "lucide-react";
import toast from "react-hot-toast";

interface ChatWindowProps {
  convId: number;
  onBack?: () => void;
}

export function ChatWindow({ convId, onBack }: ChatWindowProps) {
  const { user } = useAuthStore();
  const {
    messages,
    isLoading,
    sendMessage,
    deleteMessage,
    loadMore,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(convId);
  const { data: conversation } = useConversation(convId);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);

  // Refs pour mesurer les zones fixes
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const inputZoneRef = useRef<HTMLDivElement>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isGroup = conversation?.is_group || false;
  const participants = conversation?.participants || [];
  const otherParticipants = participants.filter(
    (p: any) => String(p.id) !== String(user?.id),
  );

  const displayName = isGroup
    ? conversation?.name || "Groupe"
    : otherParticipants[0]?.firstname
      ? `${otherParticipants[0]?.firstname} ${otherParticipants[0]?.lastname}`
      : "Conversation";

  const displayAvatar = isGroup ? null : otherParticipants[0]?.avatar;
  const participantId = !isGroup ? otherParticipants[0]?.id : null;

  // Scroll en bas quand nouveau message
  useEffect(() => {
    if (messagesContainerRef.current && !isInitialLoad) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages, isInitialLoad]);

  // Scroll initial
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
          setIsInitialLoad(false);
        }
      }, 100);
    }
  }, [messages, isInitialLoad]);

  // Scroll vers le bas quand replyTo change
  useEffect(() => {
    if (!replyTo && messagesContainerRef.current) {
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [replyTo]);

  const handleScroll = async (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    if (
      target.scrollTop === 0 &&
      hasNextPage &&
      !isFetchingMore &&
      !isFetchingNextPage
    ) {
      const previousScrollHeight = target.scrollHeight;
      setIsFetchingMore(true);
      await loadMore();
      setTimeout(() => {
        if (target) {
          target.scrollTop = target.scrollHeight - previousScrollHeight;
          setIsFetchingMore(false);
        }
      }, 100);
    }
  };

  const handleSendMessage = async (content: string, media?: File) => {
    if ((!content.trim() && !media) || sendMessage.isPending) return;

    try {
      await sendMessage.mutateAsync({
        content,
        media,
        replyToId: replyTo?.id,
      });
      setReplyTo(null);
      setTimeout(() => {
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop =
            messagesContainerRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Impossible d'envoyer le message");
    }
  };

  const handleCopyConversationId = () => {
    navigator.clipboard.writeText(String(convId));
    toast.success("ID de conversation copié");
    setShowMenu(false);
    setShowMobileMenu(false);
  };

  const handleLeaveGroup = async () => {
    try {
      const { messageService } =
        await import("@/services/community/message.service");
      await messageService.leaveGroup(convId);
      toast.success("Vous avez quitté le groupe");
      if (onBack) onBack();
      setShowMenu(false);
      setShowMobileMenu(false);
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Impossible de quitter le groupe");
    }
  };

  const handleReply = (message: any) => {
    setReplyTo(message);
    const inputElement = document.querySelector("textarea");
    if (inputElement) inputElement.focus();
  };

  const handleForward = async () => {
    toast.success("Fonctionnalité à venir");
  };

  const handleCopyMessage = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success("Message copié");
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteMessage.mutateAsync(parseInt(messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Impossible de supprimer le message");
    }
  };

  const handleMessageInfo = (message: any) => {
    const date = new Date(message.createdAt);
    toast.success(
      <div>
        <p>Envoyé le {date.toLocaleDateString()}</p>
        <p>à {date.toLocaleTimeString()}</p>
      </div>,
      { duration: 3000 },
    );
  };

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

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center h-full min-h-[200px]"
        style={{ background: "rgba(249,250,242,0.5)" }}
      >
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{
            borderColor: "rgba(45,90,39,0.25)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    /*
     * Layout : colonne flex qui occupe tout l'espace disponible.
     * Sur mobile (h-[100dvh]) on utilise dvh pour éviter le problème
     * de la barre d'adresse Safari qui rétrécit la fenêtre.
     * Sur md+ on laisse le parent gérer la hauteur (h-full).
     */
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#f9faf2]">
      {/* ================= HEADER ================= */}
      <div
        ref={headerRef}
        className="relative z-10 flex flex-shrink-0 items-center justify-between px-3 py-2 sm:px-4 sm:py-3"
        style={{
          background: "rgba(249,250,242,0.97)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(194,201,187,0.4)",
        }}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* ===== BOUTON RETOUR (visible sur mobile) ===== */}
          {onBack && (
            <button
              onClick={onBack}
              className="lg:hidden p-1.5 sm:p-2 -ml-1 rounded-xl transition-all duration-150 active:bg-black/5 hover:bg-black/5"
              style={{ color: "#42493e" }}
              aria-label="Retour à la liste des conversations"
            >
              <ArrowLeft size={20} className="sm:w-5 sm:h-5" />
            </button>
          )}

          {isGroup ? (
            <div
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
                color: "#bcf0ae",
              }}
            >
              <Users size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
          ) : (
            <Link href={`/profile/${participantId}`} className="flex-shrink-0">
              <Avatar
                src={displayAvatar}
                firstname={otherParticipants[0]?.firstname || "?"}
                size="md"
                className="cursor-pointer transition-opacity hover:opacity-80"
              />
            </Link>
          )}

          <div className="min-w-0 flex-1">
            {isGroup ? (
              <p
                className="font-semibold text-sm sm:text-base truncate"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {displayName}
              </p>
            ) : (
              <Link
                href={`/profile/${participantId}`}
                className="font-semibold text-sm sm:text-base block transition-colors truncate hover:text-[#2d5a27]"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {displayName}
              </Link>
            )}
            <p
              className="text-xs truncate"
              style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            >
              {isGroup
                ? `${participants.length} participant${participants.length > 1 ? "s" : ""}`
                : "En ligne"}
            </p>
          </div>
        </div>

        {/* Actions desktop */}
        <div className="hidden sm:flex items-center gap-1 relative">
          {[
            { icon: <Phone size={17} />, label: "Appel" },
            { icon: <Video size={17} />, label: "Vidéo" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              title={label}
              className="hidden lg:flex"
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
              {icon}
            </button>
          ))}

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
                {isGroup && (
                  <>
                    {[
                      {
                        icon: <UserPlus size={15} />,
                        label: "Ajouter des membres",
                      },
                      { icon: <Users size={15} />, label: "Voir les membres" },
                    ].map(({ icon, label }) => (
                      <button
                        key={label}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-[rgba(188,240,174,0.2)]"
                        style={{
                          color: "#42493e",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        <span style={{ color: "#72796e" }}>{icon}</span>
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={handleLeaveGroup}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150 hover:bg-[rgba(186,26,26,0.06)]"
                      style={{
                        color: "#ba1a1a",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <LogOut size={15} />
                      Quitter le groupe
                    </button>
                    <div
                      style={{
                        height: 1,
                        background: "rgba(194,201,187,0.35)",
                        margin: "2px 0",
                      }}
                    />
                  </>
                )}
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
              </div>
            </>
          )}
        </div>

        {/* Bouton menu mobile */}
        <button
          onClick={() => setShowMobileMenu(true)}
          className="sm:hidden p-1.5 rounded-xl transition-all duration-150 active:bg-black/5"
          style={{ color: "#42493e" }}
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Mobile menu modal */}
      {showMobileMenu && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowMobileMenu(false)}
          />
          <div
            className="fixed bottom-0 left-0 right-0 rounded-t-2xl z-50 animate-slide-up"
            style={{
              background: "rgba(249,250,242,0.98)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid rgba(194,201,187,0.45)",
            }}
          >
            <div className="flex justify-between items-center p-4 border-b border-[rgba(194,201,187,0.3)]">
              <h3 className="font-semibold" style={{ color: "#191c18" }}>
                Options
              </h3>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 rounded-full active:bg-black/5"
              >
                <X size={20} style={{ color: "#42493e" }} />
              </button>
            </div>
            <div className="py-2 max-h-[70vh] overflow-y-auto">
              {[
                { icon: <Phone size={20} />, label: "Appel" },
                { icon: <Video size={20} />, label: "Vidéo" },
              ].map(({ icon, label }) => (
                <button
                  key={label}
                  className="w-full flex items-center gap-3 px-4 py-3 transition-colors active:bg-[rgba(188,240,174,0.2)]"
                  style={{ color: "#42493e" }}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span style={{ color: "#72796e" }}>{icon}</span>
                  <span className="flex-1 text-left">{label}</span>
                </button>
              ))}
              {isGroup && (
                <>
                  {[
                    {
                      icon: <UserPlus size={20} />,
                      label: "Ajouter des membres",
                    },
                    { icon: <Users size={20} />, label: "Voir les membres" },
                  ].map(({ icon, label }) => (
                    <button
                      key={label}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-colors active:bg-[rgba(188,240,174,0.2)]"
                      style={{ color: "#42493e" }}
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <span style={{ color: "#72796e" }}>{icon}</span>
                      <span className="flex-1 text-left">{label}</span>
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      handleLeaveGroup();
                      setShowMobileMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 transition-colors active:bg-[rgba(186,26,26,0.1)]"
                    style={{ color: "#ba1a1a" }}
                  >
                    <LogOut size={20} />
                    <span className="flex-1 text-left">Quitter le groupe</span>
                  </button>
                  <div className="h-px bg-[rgba(194,201,187,0.3)] my-2" />
                </>
              )}
              <button
                onClick={() => {
                  handleCopyConversationId();
                  setShowMobileMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 transition-colors active:bg-[rgba(188,240,174,0.2)]"
                style={{ color: "#42493e" }}
              >
                <span style={{ color: "#72796e" }}>
                  <Copy size={20} />
                </span>
                <span className="flex-1 text-left">Copier l'ID</span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* ================= MESSAGES ================= */}
      <div
        ref={messagesContainerRef}
        className="gro-chat-scroll min-h-0 flex-1 space-y-2 overflow-y-auto px-2 py-3 sm:space-y-3 sm:px-4 sm:py-4"
        style={{ background: "rgba(243,244,237,0.6)" }}
        onScroll={handleScroll}
      >
        {/* loader */}
        {(isFetchingMore || isFetchingNextPage) && (
          <div className="flex justify-center py-2">
            <div
              className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: "rgba(45,90,39,0.25)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        )}

        {/* empty */}
        {messages.length === 0 && (
          <div className="text-center py-12">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{
                background:
                  "linear-gradient(135deg, rgba(188,240,174,0.35) 0%, rgba(244,187,146,0.15) 100%)",
                border: "1px solid rgba(194,201,187,0.4)",
              }}
            >
              <span className="text-2xl">💬</span>
            </div>
            <p
              className="text-sm font-medium"
              style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            >
              Commencez la conversation !
            </p>
          </div>
        )}

        {/* messages */}
        {messages.map((msg: any) => {
          const isMine = msg.sender_id === user?.id || msg.is_mine;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} mb-2 sm:mb-3`}
            >
              <MessageBubble
                message={{
                  id: String(msg.id),
                  content: msg.content,
                  sender: msg.sender,
                  isOwn: isMine,
                  createdAt: msg.created_at,
                  media_url: msg.media_url,
                  media_type: msg.media_url?.match(/\.(mp4|mov|webm)$/i)
                    ? "video"
                    : "image",
                  reply_to: msg.reply_to,
                }}
                onReply={handleReply}
                onForward={handleForward}
                onCopy={handleCopyMessage}
                onDelete={handleDeleteMessage}
                onInfo={handleMessageInfo}
              />
            </div>
          );
        })}
      </div>

      {/* ================= INPUT ZONE ================= */}
      <div
        ref={inputZoneRef}
        className="flex-shrink-0 border-t border-[rgba(194,201,187,0.4)] bg-[#f9faf2]"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* REPLY BAR */}
        {replyTo && (
          <div
            className="px-3 sm:px-4 pt-2 pb-1 flex items-center justify-between gap-2 animate-slide-up"
            style={{
              background: "rgba(188,240,174,0.08)",
              borderTop: "1px solid rgba(188,240,174,0.3)",
            }}
          >
            <div className="flex-1 min-w-0 flex items-start gap-2">
              <div className="flex-shrink-0 mt-0.5">
                <Reply size={14} style={{ color: "#154212" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold mb-0.5"
                  style={{ color: "#154212" }}
                >
                  Réponse à {replyTo.sender?.firstname || "l'utilisateur"}
                </p>
                <p className="text-xs truncate" style={{ color: "#72796e" }}>
                  {replyTo.content || "📎 Média"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setReplyTo(null)}
              className="p-1.5 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors flex-shrink-0"
              style={{ color: "#72796e" }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* Message Input */}
        <div className="px-2 sm:px-4 py-2 sm:py-3">
          <MessageInput
            onSend={handleSendMessage}
            isLoading={sendMessage.isPending}
          />
        </div>
      </div>

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

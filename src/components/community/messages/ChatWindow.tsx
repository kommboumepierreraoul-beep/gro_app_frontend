/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
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
  const [replyTo, setReplyTo] = useState<any>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isGroup = conversation?.is_group || false;
  const participants = conversation?.participants || [];
  const otherParticipants = participants.filter((p: any) => p.id !== user?.id);

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
      await sendMessage.mutateAsync({ content, media });
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
  };

  const handleLeaveGroup = async () => {
    try {
      const { messageService } =
        await import("@/services/community/message.service");
      await messageService.leaveGroup(convId);
      toast.success("Vous avez quitté le groupe");
      if (onBack) onBack();
      setShowMenu(false);
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

  const handleForward = async (message: any) => {
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
        className="flex items-center justify-center h-full"
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
    <div
      className="flex flex-col h-full w-full"
      style={{ background: "#f9faf2" }}
    >
      {/* ── Header ── */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{
          background: "rgba(249,250,242,0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(194,201,187,0.4)",
        }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="md:hidden p-2 -ml-1 rounded-xl transition-all duration-150"
              style={{ color: "#42493e" }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "rgba(188,240,174,0.25)")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background =
                  "transparent")
              }
            >
              <ArrowLeft size={20} />
            </button>
          )}

          {isGroup ? (
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
                color: "#bcf0ae",
              }}
            >
              <Users size={18} />
            </div>
          ) : (
            <Link href={`/profile/${participantId}`}>
              <Avatar
                src={displayAvatar}
                firstname={otherParticipants[0]?.firstname || "?"}
                size="md"
                className="cursor-pointer transition-opacity hover:opacity-80 flex-shrink-0"
              />
            </Link>
          )}

          <div>
            {isGroup ? (
              <p
                className="font-semibold text-sm"
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
                className="font-semibold text-sm block transition-colors"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#2d5a27")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "#191c18")
                }
              >
                {displayName}
              </Link>
            )}
            <p
              className="text-xs"
              style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            >
              {isGroup ? `${participants.length} participants` : "En ligne"}
            </p>
          </div>
        </div>

        {/* Actions droite */}
        <div className="flex items-center gap-1 relative">
          {[
            { icon: <Phone size={17} />, label: "Appel" },
            { icon: <Video size={17} />, label: "Vidéo" },
          ].map(({ icon, label }) => (
            <button
              key={label}
              title={label}
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

          {/* Dropdown menu */}
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
                        danger: false,
                      },
                      {
                        icon: <Users size={15} />,
                        label: "Voir les membres",
                        danger: false,
                      },
                    ].map(({ icon, label }) => (
                      <button
                        key={label}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
                        style={{
                          color: "#42493e",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "rgba(188,240,174,0.2)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "transparent")
                        }
                      >
                        <span style={{ color: "#72796e" }}>{icon}</span>
                        {label}
                      </button>
                    ))}
                    <button
                      onClick={handleLeaveGroup}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
                      style={{
                        color: "#ba1a1a",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(186,26,26,0.06)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "transparent")
                      }
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
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
                  style={{
                    color: "#42493e",
                    fontFamily: "'Inter', sans-serif",
                  }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(188,240,174,0.2)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
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
      </div>

      {/* Zone de réponse (reply) */}
      {replyTo && (
        <div
          className="px-4 py-2 flex items-center justify-between flex-shrink-0"
          style={{
            background: "rgba(188,240,174,0.15)",
            borderLeft: `3px solid #154212`,
          }}
        >
          <div className="flex-1">
            <p className="text-xs font-semibold" style={{ color: "#154212" }}>
              Réponse à {replyTo.sender?.firstname || "l'utilisateur"}
            </p>
            <p className="text-xs truncate" style={{ color: "#72796e" }}>
              {replyTo.content}
            </p>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="p-1 rounded-full hover:bg-black/5 transition-colors"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Zone de messages ── */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 gro-chat-scroll"
        style={{ background: "rgba(243,244,237,0.6)" }}
        onScroll={handleScroll}
      >
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

        {messages.map((msg: any, index: number) => {
          const isMine = msg.sender_id === user?.id || msg.is_mine;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} mb-3`}
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
                  is_read: msg.is_read,
                  is_delivered: msg.is_delivered,
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

      {/* MessageInput - corrigé */}
      <MessageInput
        onSend={handleSendMessage}
        isLoading={sendMessage.isPending}
      />

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
      `}</style>
    </div>
  );
}

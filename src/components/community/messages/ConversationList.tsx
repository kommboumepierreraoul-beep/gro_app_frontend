/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { useConversations } from "@/hooks/community/useMessage";
import { useAuthStore } from "@/stores/auth.store";
import {
  MessageCircle,
  Edit2,
  Users,
  Loader2,
  Search,
  X,
  UserPlus,
} from "lucide-react";
import { CreateGroupModal } from "./CreateGroupModal";

interface ConversationListProps {
  activeId?: number;
  onSelectConversation?: (conversationId: number) => void;
}

export function ConversationList({
  activeId,
  onSelectConversation,
}: ConversationListProps) {
  const { user } = useAuthStore();
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // ── Deux états de recherche séparés ──
  const [convSearch, setConvSearch] = useState(""); // filtre la liste des conversations
  const [modalSearch, setModalSearch] = useState(""); // filtre les users dans la modal

  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});
  const [userHeadlines, setUserHeadlines] = useState<Record<number, string>>(
    {},
  );

  const {
    data: conversationsData,
    isLoading: convLoading,
    refetch,
  } = useConversations();

  const allConversations =
    conversationsData?.data?.filter(
      (conv: any) => conv.last_message !== null,
    ) ?? [];

  // Filtre les conversations selon convSearch
  const conversations = allConversations.filter((conv: any) => {
    if (!convSearch.trim()) return true;
    const q = convSearch.toLowerCase();
    if (conv.is_group) return (conv.name || "").toLowerCase().includes(q);
    const other = conv.participants?.find((p: any) => p.id !== user?.id);
    const name =
      `${other?.firstname || ""} ${other?.lastname || ""}`.toLowerCase();
    return name.includes(q);
  });

  const loadUserProfile = async (userId: number) => {
    if (userAvatars[userId]) return;
    try {
      const { profileService } =
        await import("@/services/community/profile.service");
      const profile = await profileService.getProfile(userId);
      setUserAvatars((prev) => ({ ...prev, [userId]: profile.avatar }));
      setUserHeadlines((prev) => ({ ...prev, [userId]: profile.headline }));
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const loadUsers = async () => {
    if (users.length > 0) return;
    setUsersLoading(true);
    try {
      const { followService } =
        await import("@/services/community/follow.service");
      const response = await followService.getFollowers(user?.id);
      const followersList = response?.data?.data ?? response?.data ?? [];
      const suggestionsRes = await followService.getSuggestions();
      const suggestionsList =
        suggestionsRes?.data?.data ?? suggestionsRes?.data ?? [];
      const allUsers = [...followersList, ...suggestionsList];
      const uniqueUsers = allUsers.filter(
        (u: any, index: number, self: any[]) => {
          const userId = u.follower?.id || u.id;
          return (
            userId !== user?.id &&
            self.findIndex((x: any) => (x.follower?.id || x.id) === userId) ===
              index
          );
        },
      );
      for (const userItem of uniqueUsers) {
        const userData = userItem.follower || userItem;
        await loadUserProfile(userData.id);
      }
      setUsers(uniqueUsers);
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    allConversations.forEach((conv: any) => {
      if (!conv.is_group) {
        const other = conv.participants?.find((p: any) => p.id !== user?.id);
        if (other && !userAvatars[other.id]) loadUserProfile(other.id);
      }
    });
  }, [allConversations]);

  const handleOpenNewConversation = () => {
    setShowNewConversation(true);
    setModalSearch("");
    if (users.length === 0 && !usersLoading) loadUsers();
  };

  const handleSelectConversation = (convId: number) => {
    if (onSelectConversation) onSelectConversation(convId);
  };

  const handleStartConversation = async (userId: number) => {
    const { messageService } =
      await import("@/services/community/message.service");
    const conv = await messageService.createOrFindConversation(userId);
    handleSelectConversation(conv.id);
    setShowNewConversation(false);
    setModalSearch("");
    refetch();
  };

  // Filtre les users dans la modal selon modalSearch
  const filteredUsers = users.filter((item: any) => {
    const userData = item.follower || item;
    const name =
      `${userData.firstname || ""} ${userData.lastname || ""}`.toLowerCase();
    return name.includes(modalSearch.toLowerCase());
  });

  if (convLoading) return <ConversationListSkeleton />;

  return (
    <div className="h-full">
      <div
        className="flex flex-col h-full relative"
        style={{ background: "transparent" }}
      >
        {/* ── Search conversations ── */}
        <div
          className="px-3 py-2.5 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(194,201,187,0.3)" }}
        >
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#72796e" }}
            />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm outline-none"
              style={{
                background: "#f3f4ed",
                border: "none",
                borderRadius: "999px",
                fontFamily: "'Inter', sans-serif",
                color: "#191c18",
              }}
            />
          </div>
        </div>

        {/* ── Liste des conversations ── */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-6 sm:p-8 text-center">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center mb-3 sm:mb-4"
                style={{
                  background: "rgba(188,240,174,0.18)",
                  border: "1px solid rgba(194,201,187,0.4)",
                }}
              >
                <MessageCircle
                  size={20}
                  strokeWidth={1.5}
                  style={{ color: "#72796e" }}
                />
              </div>
              <p
                className="text-sm font-semibold mb-1"
                style={{
                  color: "#42493e",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {convSearch ? "Aucun résultat" : "Aucune discussion"}
              </p>
              <p className="text-xs mb-4 sm:mb-5" style={{ color: "#72796e" }}>
                {convSearch
                  ? "Essayez un autre terme"
                  : "Commencez une nouvelle conversation"}
              </p>
              {!convSearch && (
                <button
                  onClick={handleOpenNewConversation}
                  className="px-4 py-2 text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
                  style={{
                    background: "#154212",
                    color: "#fff",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Nouvelle conversation
                </button>
              )}
            </div>
          ) : (
            <div>
              {conversations.map((conv: any) => {
                let other: any = null;
                let displayName = conv.name;
                let displayAvatar = null;
                let displayHeadline = null;
                let displayLastMessage = "";
                let displayTime = null;

                if (!conv.is_group) {
                  other = conv.participants?.find(
                    (p: any) => p.id !== user?.id,
                  );
                  if (other) {
                    displayName =
                      `${other.firstname || ""} ${other.lastname || ""}`.trim() ||
                      "Utilisateur";
                    displayAvatar = userAvatars[other.id] || other?.avatar;
                    displayHeadline = userHeadlines[other.id];
                  }
                } else {
                  displayName = conv.name || "Groupe";
                }

                if (conv.last_message) {
                  displayLastMessage = conv.last_message.content;
                  displayTime = conv.last_message.created_at;
                }

                const isActive = conv.id === activeId;
                const hasUnread = conv.unread_count > 0;

                return (
                  <div
                    key={conv.id}
                    onClick={() => handleSelectConversation(conv.id)}
                    className="cursor-pointer flex items-center gap-2 sm:gap-3 px-3 sm:px-3.5 py-3 transition-colors"
                    style={{
                      borderBottom: "1px solid rgba(194,201,187,0.28)",
                      borderLeft: isActive
                        ? "3px solid #154212"
                        : "3px solid transparent",
                      background: isActive
                        ? "rgba(21,66,18,0.05)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background =
                          "rgba(21,66,18,0.03)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive)
                        e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div className="relative flex-shrink-0">
                      {conv.is_group ? (
                        <div
                          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
                          style={{ background: "#2d5a27" }}
                        >
                          <Users size={16} style={{ color: "#bcf0ae" }} />
                        </div>
                      ) : (
                        <Avatar
                          src={displayAvatar}
                          firstname={other?.firstname || "?"}
                          size="md"
                        />
                      )}
                      {hasUnread && (
                        <span
                          className="absolute -top-1 -right-1 min-w-[18px] h-[18px] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 border-2"
                          style={{
                            background: "#154212",
                            borderColor: "#f9faf2",
                          }}
                        >
                          {conv.unread_count > 9 ? "9+" : conv.unread_count}
                        </span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-1">
                        <p
                          className="text-sm truncate"
                          style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: hasUnread ? 700 : 600,
                            color: "#191c18",
                          }}
                        >
                          {displayName}
                        </p>
                        {displayTime && (
                          <TimeAgo
                            date={displayTime}
                            className="flex-shrink-0 text-[10px]"
                            style={{ color: "#72796e" }}
                          />
                        )}
                      </div>
                      {displayHeadline && (
                        <p
                          className="text-[11px] truncate mt-0.5"
                          style={{ color: "#72796e" }}
                        >
                          {displayHeadline}
                        </p>
                      )}
                      <p
                        className="text-xs truncate mt-0.5"
                        style={{
                          color: hasUnread ? "#154212" : "#72796e",
                          fontWeight: hasUnread ? 500 : 400,
                        }}
                      >
                        {conv.last_message?.sender_id === user?.id
                          ? "Vous : "
                          : ""}
                        {displayLastMessage.length > 40
                          ? displayLastMessage.substring(0, 40) + "…"
                          : displayLastMessage}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bouton flottant - caché sur mobile quand conversation ouverte */}
        <button
          onClick={handleOpenNewConversation}
          className="hidden sm:flex absolute bottom-10 right-4 w-11 h-11 items-center justify-center rounded-full transition-transform hover:scale-105 z-10 shadow-lg"
          style={{
            background: "#154212",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(21,66,18,0.22)",
          }}
          title="Nouvelle conversation"
        >
          <Edit2 size={18} />
        </button>
      </div>

      {/* ── Modal nouvelle conversation (responsive) ── */}
      {showNewConversation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
          style={{
            background: "rgba(0,0,0,0.32)",
            backdropFilter: "blur(4px)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowNewConversation(false);
              setModalSearch("");
            }
          }}
        >
          <div
            className="w-[95%] sm:w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
            style={{
              background: "#f9faf2",
              border: "1px solid rgba(194,201,187,0.5)",
              boxShadow: "0 12px 48px rgba(21,66,18,0.14)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 flex-shrink-0"
              style={{
                background: "rgba(255,255,255,0.85)",
                borderBottom: "1px solid rgba(194,201,187,0.35)",
              }}
            >
              <h2
                className="font-bold text-sm sm:text-base"
                style={{
                  color: "#154212",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Nouvelle conversation
              </h2>
              <button
                onClick={() => {
                  setShowNewConversation(false);
                  setModalSearch("");
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-colors hover:bg-black/5 active:bg-black/10"
                style={{ color: "#72796e" }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3 overflow-y-auto">
              {/* Search users */}
              <div className="relative">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "#72796e" }}
                />
                <input
                  type="text"
                  placeholder="Rechercher un contact..."
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm outline-none transition-colors"
                  style={{
                    background: "#f3f4ed",
                    border: "1px solid rgba(194,201,187,0.5)",
                    borderRadius: "10px",
                    fontFamily: "'Inter', sans-serif",
                    color: "#191c18",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#154212")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(194,201,187,0.5)")
                  }
                />
              </div>

              {/* Créer un groupe - option */}
              <button
                onClick={() => {
                  setShowNewConversation(false);
                  setShowCreateGroup(true);
                  setModalSearch("");
                }}
                className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors text-left"
                style={{
                  border: "1px dashed rgba(161,212,148,0.7)",
                  background: "rgba(188,240,174,0.07)",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(188,240,174,0.15)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(188,240,174,0.07)")
                }
              >
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#2d5a27" }}
                >
                  <UserPlus size={17} style={{ color: "#bcf0ae" }} />
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "#154212",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    Créer un groupe
                  </p>
                  <p className="text-xs" style={{ color: "#72796e" }}>
                    Discutez avec plusieurs personnes
                  </p>
                </div>
              </button>

              {/* Liste utilisateurs */}
              <div className="max-h-60 sm:max-h-80 overflow-y-auto">
                {usersLoading ? (
                  <div className="flex justify-center py-6">
                    <Loader2
                      size={22}
                      className="animate-spin"
                      style={{ color: "#154212" }}
                    />
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <p
                    className="text-center py-6 text-sm"
                    style={{ color: "#72796e" }}
                  >
                    {modalSearch
                      ? "Aucun résultat"
                      : "Aucun contact disponible"}
                  </p>
                ) : (
                  filteredUsers.map((item: any) => {
                    const userData = item.follower || item;
                    const userId = userData.id;
                    const userAvatar = userAvatars[userId] || userData.avatar;
                    const userHeadline =
                      userHeadlines[userId] || userData.headline;

                    return (
                      <button
                        key={userId}
                        onClick={() => handleStartConversation(userId)}
                        className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors active:bg-[rgba(21,66,18,0.08)]"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(21,66,18,0.04)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <Avatar
                          src={userAvatar}
                          firstname={userData.firstname}
                          size="md"
                        />
                        <div className="flex-1 text-left min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{
                              color: "#191c18",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {userData.firstname} {userData.lastname || ""}
                          </p>
                          {userHeadline && (
                            <p
                              className="text-xs truncate"
                              style={{ color: "#72796e" }}
                            >
                              {userHeadline}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={(conversationId: any) => {
          handleSelectConversation(conversationId);
          setShowCreateGroup(false);
          refetch();
        }}
      />
    </div>
  );
}

function ConversationListSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-3.5 py-3 animate-pulse"
          style={{ borderBottom: "1px solid rgba(194,201,187,0.28)" }}
        >
          <div
            className="w-11 h-11 rounded-full flex-shrink-0"
            style={{ background: "#e7e9e1" }}
          />
          <div className="flex-1 min-w-0">
            <div
              className="h-3 rounded-full w-1/3 mb-2"
              style={{ background: "#e7e9e1" }}
            />
            <div
              className="h-2 rounded-full w-2/3"
              style={{ background: "#edefe7" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

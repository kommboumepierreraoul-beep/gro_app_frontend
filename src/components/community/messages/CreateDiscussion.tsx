/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { Avatar } from "../shared/Avatar";
import { useAuthStore } from "@/stores/auth.store";
import { X, Search, Users, Loader2, MessageCircle } from "lucide-react";
import { CreateGroupModal } from "./CreateGroupModal";
import toast from "react-hot-toast";
import { CommunityUser, Conversation } from "@/types/community.types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CreateDiscussionProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (conversationId: number) => void;
}

// ─── Helper pour obtenir les données utilisateur ────────────────────────────

interface UserData {
  id: number;
  firstname: string;
  lastname: string;
  avatar?: string | null;
  headline?: string | null;
  email?: string;
}

function extractUserData(item: any): UserData {
  const userData = item.follower || item;
  return {
    id: userData.id,
    firstname: userData.firstname || "",
    lastname: userData.lastname || "",
    avatar: userData.avatar,
    headline: userData.headline,
    email: userData.email,
  };
}

// ─── Composant principal ──────────────────────────────────────────────────────

export function CreateDiscussion({
  isOpen,
  onClose,
  onSuccess,
}: CreateDiscussionProps) {
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userAvatars, setUserAvatars] = useState<Record<number, string>>({});
  const [userHeadlines, setUserHeadlines] = useState<Record<number, string>>(
    {},
  );
  const [showCreateGroup, setShowCreateGroup] = useState(false);

  // ✅ Refs pour éviter les dépendances problématiques
  const isMountedRef = useRef(true);
  const usersRef = useRef(users);
  const userAvatarsRef = useRef(userAvatars);

  // ✅ Mettre à jour les refs quand les états changent
  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  useEffect(() => {
    userAvatarsRef.current = userAvatars;
  }, [userAvatars]);

  // ── Nettoyage au démontage ──────────────────────────────────────────────────

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // ── Charger le profil d'un utilisateur ─────────────────────────────────────

  const loadUserProfile = useCallback(async (userId: number) => {
    if (!isMountedRef.current) return;

    // ✅ Utiliser la ref au lieu de l'état
    if (userAvatarsRef.current[userId]) return;

    try {
      const { profileService } =
        await import("@/services/community/profile.service");
      const profile = await profileService.getProfile(userId);

      if (isMountedRef.current) {
        setUserAvatars((prev) => {
          const newState = { ...prev };
          if (profile.avatar) {
            newState[userId] = profile.avatar;
          }
          return newState;
        });

        setUserHeadlines((prev) => {
          const newState = { ...prev };
          if (profile.headline) {
            newState[userId] = profile.headline;
          }
          return newState;
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  }, []); // ✅ Dépendances vides car on utilise les refs

  // ── Charger la liste des utilisateurs ──────────────────────────────────────

  const loadUsers = useCallback(async () => {
    if (!isMountedRef.current) return;
    if (usersRef.current.length > 0) return;

    setUsersLoading(true);
    try {
      const { followService } =
        await import("@/services/community/follow.service");

      const userId = user?.id;
      if (!userId) {
        console.warn("User ID not available");
        return;
      }

      const [followersRes, suggestionsRes] = await Promise.all([
        followService.getFollowers(userId),
        followService.getSuggestions(),
      ]);

      const followersList =
        followersRes?.data?.data ?? followersRes?.data ?? [];
      const suggestionsList =
        suggestionsRes?.data?.data ?? suggestionsRes?.data ?? [];

      const allUsers = [...followersList, ...suggestionsList];
      const seen = new Set<number>();
      const uniqueUsers = allUsers.filter((item: any) => {
        const userData = extractUserData(item);
        if (userData.id === user?.id) return false;
        if (seen.has(userData.id)) return false;
        seen.add(userData.id);
        return true;
      });

      for (const item of uniqueUsers) {
        if (!isMountedRef.current) break;
        const userData = extractUserData(item);
        await loadUserProfile(userData.id);
      }

      if (isMountedRef.current) {
        setUsers(uniqueUsers);
      }
    } catch (error) {
      console.error("Error loading users:", error);
      if (isMountedRef.current) {
        toast.error("Impossible de charger les utilisateurs");
      }
    } finally {
      if (isMountedRef.current) {
        setUsersLoading(false);
      }
    }
  }, [user, loadUserProfile]); // ✅ Ajouter 'user' aux dépendances

  // ── Effet pour charger les utilisateurs à l'ouverture ─────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen && users.length === 0 && !usersLoading && user?.id) {
        loadUsers();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isOpen, users.length, usersLoading, user?.id, loadUsers]);

  // ── Réinitialiser la recherche à la fermeture ─────────────────────────────

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpen) {
        setSearchQuery("");
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [isOpen]);

  // ── Filtrer les utilisateurs ──────────────────────────────────────────────

  const filteredUsers = useCallback(() => {
    return users.filter((item: any) => {
      const userData = extractUserData(item);
      const name = `${userData.firstname} ${userData.lastname}`.toLowerCase();
      return name.includes(searchQuery.toLowerCase());
    });
  }, [users, searchQuery]);

  // ── Démarrer une conversation ─────────────────────────────────────────────

  const handleStartConversation = async (userId: number) => {
    try {
      const { messageService } =
        await import("@/services/community/message.service");
      const conv = await messageService.createOrFindConversation(userId);
      if (onSuccess) onSuccess(conv.id);
      onClose();
      setSearchQuery("");
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Impossible de démarrer la conversation");
    }
  };

  // ── Gestion de la création de groupe ──────────────────────────────────────

  const handleGroupCreated = (conversationId: number) => {
    if (onSuccess) onSuccess(conversationId);
    setShowCreateGroup(false);
    onClose();
  };

  // ─── Rendu ──────────────────────────────────────────────────────────────────

  if (!isOpen) return null;

  const filteredUsersList = filteredUsers();

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      >
        <div
          className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
          style={{
            background: "#f9faf2",
            border: "1px solid rgba(194,201,187,0.5)",
            boxShadow: "0 12px 48px rgba(21,66,18,0.14)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 flex-shrink-0"
            style={{
              background: "rgba(255,255,255,0.85)",
              borderBottom: "1px solid rgba(194,201,187,0.35)",
            }}
          >
            <div className="flex items-center gap-2">
              <MessageCircle size={18} style={{ color: "#154212" }} />
              <h2
                className="font-bold text-base"
                style={{
                  color: "#154212",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Nouvelle discussion
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
              style={{ color: "#72796e" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#e7e9e1")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <X size={17} />
            </button>
          </div>

          <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
            {/* Bouton Créer un groupe */}
            <button
              onClick={() => {
                setShowCreateGroup(true);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl transition-colors"
              style={{
                border: "1px solid rgba(161,212,148,0.7)",
                background: "rgba(188,240,174,0.1)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(188,240,174,0.2)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(188,240,174,0.1)")
              }
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: "#2d5a27" }}
              >
                <Users size={17} style={{ color: "#bcf0ae" }} />
              </div>
              <div className="flex-1 text-left">
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
              <Users size={14} style={{ color: "#72796e" }} />
            </button>

            {/* Séparateur */}
            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div
                  className="w-full border-t"
                  style={{ borderColor: "rgba(194,201,187,0.35)" }}
                ></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span
                  className="px-2"
                  style={{ background: "#f9faf2", color: "#72796e" }}
                >
                  ou discuter avec
                </span>
              </div>
            </div>

            {/* Recherche d'utilisateurs */}
            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: "#72796e" }}
              />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm outline-none"
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
                autoFocus
              />
            </div>

            {/* Liste des utilisateurs */}
            <div className="max-h-96 overflow-y-auto -mx-1 px-1">
              {usersLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2
                    size={22}
                    className="animate-spin"
                    style={{ color: "#154212" }}
                  />
                </div>
              ) : filteredUsersList.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm" style={{ color: "#72796e" }}>
                    {searchQuery
                      ? "Aucun utilisateur trouvé"
                      : "Aucun contact disponible"}
                  </p>
                  {!searchQuery && (
                    <p className="text-xs mt-1" style={{ color: "#72796e" }}>
                      Abonnez-vous à d'autres utilisateurs pour démarrer une
                      conversation
                    </p>
                  )}
                </div>
              ) : (
                filteredUsersList.map((item: any) => {
                  const userData = extractUserData(item);
                  const userId = userData.id;
                  const userAvatar = userAvatars[userId] || userData.avatar;
                  const userHeadline =
                    userHeadlines[userId] || userData.headline;

                  return (
                    <button
                      key={userId}
                      onClick={() => handleStartConversation(userId)}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors text-left"
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
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-semibold truncate"
                          style={{
                            color: "#191c18",
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                          }}
                        >
                          {userData.firstname} {userData.lastname}
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
                      <MessageCircle size={14} style={{ color: "#72796e" }} />
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création de groupe */}
      <CreateGroupModal
        isOpen={showCreateGroup}
        onClose={() => setShowCreateGroup(false)}
        onSuccess={handleGroupCreated}
      />
    </>
  );
}

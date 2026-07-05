/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { Avatar } from "../shared/Avatar";
import { useFollowers } from "@/hooks/community/useFollow";
import { useAuthStore } from "@/stores/auth.store";
import { useCreateGroup } from "@/hooks/community/useMessage";
import { X, Search, Users, Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (conversationId: number) => void;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const { user } = useAuthStore();
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());
  const [selectedUsersData, setSelectedUsersData] = useState<any[]>([]);

  const { data: followersData, isLoading: followersLoading } = useFollowers(user?.id);
  const createGroup = useCreateGroup();

  const followers = followersData?.data?.data ?? followersData?.data ?? [];

  const filteredFollowers = followers.filter((item: any) => {
    const followerUser = item.follower || item;
    const name =
      `${followerUser.firstname || ""} ${followerUser.lastname || ""}`.toLowerCase();
    return name.includes(searchQuery.toLowerCase()) && followerUser.id !== user?.id;
  });

  const handleSelectUser = (userData: any) => {
    const followerUser = userData.follower || userData;
    const userId = followerUser.id;
    if (selectedUsers.has(userId)) {
      selectedUsers.delete(userId);
      setSelectedUsers(new Set(selectedUsers));
      setSelectedUsersData(
        selectedUsersData.filter((u) => {
          const uId = u.follower?.id || u.id;
          return uId !== userId;
        })
      );
    } else {
      setSelectedUsers(new Set(Array.from(selectedUsers).concat(userId)));
      setSelectedUsersData([...selectedUsersData, userData]);
    }
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.size < 2) {
      toast.error("Sélectionnez au moins 2 personnes");
      return;
    }
    const participantIds = Array.from(selectedUsers);
    const name = groupName.trim() || `Groupe de ${selectedUsers.size} personnes`;
    try {
      const result = await createGroup.mutateAsync({ participantIds, name });
      if (onSuccess && result?.id) onSuccess(result.id);
      onClose();
      setSelectedUsers(new Set());
      setSelectedUsersData([]);
      setGroupName("");
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.32)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] flex flex-col"
        style={{
          background: "#f9faf2",
          border: "1px solid rgba(194,201,187,0.5)",
          boxShadow: "0 12px 48px rgba(21,66,18,0.14)",
        }}
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
            <Users size={18} style={{ color: "#154212" }} />
            <h2
              className="font-bold text-base"
              style={{
                color: "#154212",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Nouveau groupe
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-colors"
            style={{ color: "#72796e" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#e7e9e1")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-4 flex flex-col gap-3 overflow-y-auto flex-1">
          {/* Nom du groupe */}
          <input
            type="text"
            placeholder="Nom du groupe (optionnel)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="w-full px-4 py-2.5 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(194,201,187,0.6)",
              borderRadius: "12px",
              fontFamily: "'Inter', sans-serif",
              color: "#191c18",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#154212";
              e.target.style.boxShadow = "0 0 0 2px rgba(21,66,18,0.08)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(194,201,187,0.6)";
              e.target.style.boxShadow = "";
            }}
          />

          {/* Membres sélectionnés */}
          {selectedUsersData.length > 0 && (
            <div>
              <p
                className="text-xs font-semibold mb-2"
                style={{
                  color: "#42493e",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Membres sélectionnés ({selectedUsers.size})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedUsersData.map((userData) => {
                  const followerUser = userData.follower || userData;
                  return (
                    <div
                      key={followerUser.id}
                      className="flex items-center gap-1.5 rounded-full px-2.5 py-1"
                      style={{
                        background: "rgba(188,240,174,0.25)",
                        border: "1px solid rgba(161,212,148,0.5)",
                      }}
                    >
                      <span
                        className="text-xs font-medium"
                        style={{ color: "#23501e" }}
                      >
                        {followerUser.firstname}
                      </span>
                      <button
                        onClick={() => handleSelectUser(userData)}
                        className="flex items-center"
                        style={{ color: "#72796e" }}
                      >
                        <X size={11} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recherche */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "#72796e" }}
            />
            <input
              type="text"
              placeholder="Rechercher des abonnés..."
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
              onBlur={(e) => (e.target.style.borderColor = "rgba(194,201,187,0.5)")}
            />
          </div>

          {/* Liste des abonnés */}
          <div className="max-h-56 overflow-y-auto -mx-1 px-1">
            {followersLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 size={22} className="animate-spin" style={{ color: "#154212" }} />
              </div>
            ) : filteredFollowers.length === 0 ? (
              <p className="text-center py-6 text-sm" style={{ color: "#72796e" }}>
                {searchQuery ? "Aucun résultat" : "Aucun abonné"}
              </p>
            ) : (
              filteredFollowers.map((item: any) => {
                const followerUser = item.follower || item;
                const userId = followerUser.id;
                const isSelected = selectedUsers.has(userId);

                return (
                  <button
                    key={userId}
                    onClick={() => handleSelectUser(item)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-colors"
                    style={{
                      background: isSelected ? "rgba(188,240,174,0.15)" : "transparent",
                      borderLeft: isSelected
                        ? "2px solid rgba(161,212,148,0.7)"
                        : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected)
                        e.currentTarget.style.background = "rgba(21,66,18,0.04)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <Avatar
                      src={followerUser.avatar}
                      firstname={followerUser.firstname}
                      size="md"
                    />
                    <div className="flex-1 text-left">
                      <p
                        className="text-sm font-semibold"
                        style={{
                          color: "#191c18",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                        }}
                      >
                        {followerUser.firstname} {followerUser.lastname || ""}
                      </p>
                      {followerUser.headline && (
                        <p className="text-xs" style={{ color: "#72796e" }}>
                          {followerUser.headline}
                        </p>
                      )}
                    </div>
                    {isSelected && (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "#154212" }}
                      >
                        <Check size={11} style={{ color: "#bcf0ae" }} />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{
            borderTop: "1px solid rgba(194,201,187,0.35)",
            background: "rgba(249,250,242,0.9)",
          }}
        >
          <button
            onClick={handleCreateGroup}
            disabled={createGroup.isPending || selectedUsers.size < 2}
            className="w-full py-2.5 font-bold text-sm rounded-xl transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: "#154212",
              color: "#fff",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) e.currentTarget.style.opacity = "0.88";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {createGroup.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={15} className="animate-spin" />
                Création...
              </span>
            ) : (
              "Créer le groupe"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

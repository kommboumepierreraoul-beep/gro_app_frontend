// components/community/posts/PostCardHeader.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Avatar } from "../../shared/Avatar";
import { TimeAgo } from "../../shared/TimeAgo";
import { profileService } from "@/services/community/profile.service";

// Fonction pour obtenir l'URL complète de l'avatar
const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;

  // Si c'est déjà une URL complète
  if (avatar.startsWith("http")) return avatar;

  // Construire l'URL complète
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${apiUrl}${cleanPath}`;
};

interface PostCardHeaderProps {
  author: {
    id: number;
    firstname: string;
    lastname: string;
    avatar?: string | null;
    headline?: string | null;
  };
  createdAt: string;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function PostCardHeader({
  author,
  createdAt,
  isOwner,
  onEdit,
  onDelete,
}: PostCardHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Récupérer le profil complet de l'auteur via profileService
  const { data: fullProfile } = useQuery({
    queryKey: ["userProfile", author.id],
    queryFn: () => profileService.getProfile(author.id),
    enabled: !!author.id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Fusionner les données : priorité au profil complet
  const displayAuthor = {
    id: author.id,
    firstname: fullProfile?.firstname ?? author.firstname,
    lastname: fullProfile?.lastname ?? author.lastname,
    avatar: getAvatarUrl(fullProfile?.avatar ?? author.avatar),
    headline: fullProfile?.headline ?? author.headline,
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-start justify-between px-4 pt-4 pb-3 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${displayAuthor.id}`}>
          <Avatar
            src={displayAuthor.avatar}
            firstname={displayAuthor.firstname}
            size="md"
            className="ring-2 ring-green-300/50 flex-shrink-0"
          />
        </Link>
        <div>
          <Link
            href={`/profile/${displayAuthor.id}`}
            className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            {displayAuthor.firstname} {displayAuthor.lastname}
          </Link>
          <div className="flex items-center gap-1 mt-0.5">
            {displayAuthor.headline && (
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {displayAuthor.headline}
              </p>
            )}
            <span className="text-gray-300 text-xs">·</span>
            <TimeAgo date={createdAt} className="text-gray-400" />
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full transition hover:bg-gray-100"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>

          {showMenu && (
            <div className="absolute right-0 top-10 z-20 min-w-[150px] animate-slideDown rounded-xl border border-gray-100 p-1 shadow-sm">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Pencil className="h-3.5 w-3.5 text-gray-400" />
                Modifier
              </button>

              <div className="mx-1 my-0.5 h-px bg-gray-100" />

              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-400" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

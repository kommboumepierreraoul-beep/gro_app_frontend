/* eslint-disable react/no-unescaped-entities */
// components/announcements/AnnouncementHeader.tsx
"use client";

import Link from "next/link";
import { Pin, Pencil, Trash2, MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/community/shared/Avatar";
import { TimeAgo } from "@/components/community/shared/TimeAgo";
import { useState, useRef, useEffect } from "react";

// Fonction pour l'URL complète
const getFullImageUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiUrl}${cleanPath}`;
};

interface AnnouncementHeaderProps {
  author: {
    id: number;
    firstname: string;
    lastname: string;
    avatar: string | null;
    headline?: string | null;
  };
  createdAt: string;
  isPinned?: boolean;
  isOwner: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function AnnouncementHeader({
  author,
  createdAt,
  isPinned,
  isOwner,
  onEdit,
  onDelete,
}: AnnouncementHeaderProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <Link href={`/profile/${author.id}`}>
          <Avatar
            src={getFullImageUrl(author.avatar)}
            firstname={author.firstname}
            size="lg"
            className="ring-2 ring-green-300/50 flex-shrink-0"
          />
        </Link>
        <div>
          <Link
            href={`/profile/${author.id}`}
            className="font-semibold text-gray-900 hover:text-gray-700 transition-colors"
          >
            {author.firstname} {author.lastname}
          </Link>
          {author.headline && (
            <p className="text-xs text-gray-500 mt-0.5">{author.headline}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <TimeAgo date={createdAt} className="text-gray-400 text-xs" />
            {isPinned && (
              <>
                <span className="text-gray-300 text-xs">·</span>
                <div className="flex items-center gap-1">
                  <Pin className="w-3 h-3 text-emerald-600" />
                  <span className="text-xs text-emerald-600 font-medium">
                    Épinglé
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isOwner && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
          >
            <MoreHorizontal className="w-5 h-5 text-gray-500" />
          </button>

          {showMenu && (
            <div
              className="absolute right-0 top-10 rounded-xl py-1 z-20 min-w-[160px] shadow-lg"
              style={{
                background: "white",
                backdropFilter: "blur(20px)",
                border: "0.5px solid rgba(0,0,0,0.1)",
                boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
              }}
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Pencil className="w-4 h-4" />
                Modifier l'annonce
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete();
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

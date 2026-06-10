/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  UserPlus,
  Heart,
  Briefcase,
  CalendarDays,
  GraduationCap,
  MoreHorizontal,
  ChevronRight,
  Users,
  Megaphone,
  Clock,
} from "lucide-react";
import { followService } from "@/services/community/follow.service";
import { Avatar } from "../shared/Avatar";
import { useFollow } from "@/hooks/community/useFollow";
import { CommunityUser } from "@/types/community.types";
import { useLatestAnnouncements, useLikeAnnouncement } from "@/hooks/community/useAnnouncements";

// Fonction utilitaire pour l'URL de l'avatar
const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;

  if (avatar.startsWith("http://") || avatar.startsWith("https://")) {
    return avatar;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${apiUrl}${cleanPath}`;
};

// Configuration des catégories
const categoryConfig: Record<
  string,
  { icon: React.ReactNode; label: string; color: string; bg: string }
> = {
  job: {
    icon: <Briefcase className="w-3 h-3" />,
    label: "Emploi",
    color: "#2d5a27",
    bg: "rgba(45,90,39,0.12)",
  },
  event: {
    icon: <CalendarDays className="w-3 h-3" />,
    label: "Événement",
    color: "#805533",
    bg: "rgba(128,85,51,0.12)",
  },
  training: {
    icon: <GraduationCap className="w-3 h-3" />,
    label: "Formation",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.12)",
  },
  other: {
    icon: <MoreHorizontal className="w-3 h-3" />,
    label: "Autre",
    color: "#72796e",
    bg: "rgba(114,121,110,0.12)",
  },
};

export function RightSidebar() {
  // Suggestions
  const {
    data: suggestions,
    isLoading: suggestionsLoading,
    error: suggestionsError,
  } = useQuery({
    queryKey: ["suggestions"],
    queryFn: followService.getSuggestions,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Annonces - utilisation du hook corrigé
  const {
    announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useLatestAnnouncements(3);

  const cardStyle = {
    background: "rgba(249,250,242,0.92)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(194,201,187,0.4)",
    borderRadius: "1rem",
    boxShadow: "0 2px 12px rgba(21,66,18,0.04)",
  };

  // État de chargement
  if (
    suggestionsLoading &&
    announcementsLoading &&
    !suggestions &&
    !announcements.length
  ) {
    return (
      <aside className="w-72 hidden xl:block flex-shrink-0 h-[calc(100vh-4rem)] sticky top-20 p-4">
        <div className="sticky top-20 space-y-4">
          <div className="p-4 animate-pulse" style={cardStyle}>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-72 hidden xl:block flex-shrink-0 h-[calc(100vh-4rem)] sticky top-20 p-4">
      <div className="sticky top-20 space-y-4">
        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && !suggestionsError && (
          <div className="p-4" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4" style={{ color: "#2d5a27" }} />
              <h3
                className="text-sm font-bold"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Personnes à suivre
              </h3>
            </div>
            <div className="space-y-3">
              {suggestions.slice(0, 5).map((user: CommunityUser) => (
                <SuggestionItem key={user.id} user={user} />
              ))}
            </div>
            <Link
              href="/community/users"
              className="flex items-center justify-center gap-1 mt-3 text-xs font-semibold transition-colors duration-150 hover:underline"
              style={{ color: "#2d5a27" }}
            >
              <span>Voir plus</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}

        {/* Annonces récentes */}
        {announcements.length > 0 && !announcementsError && (
          <div className="p-4 " style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <Megaphone className="w-4 h-4" style={{ color: "#2d5a27" }} />
              <h3
                className="text-sm font-bold"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Annonces récentes
              </h3>
            </div>
            <div className="space-y-3">
              {announcements.map((announcement: any) => (
                <AnnouncementCard
                  key={announcement.id}
                  announcement={announcement}
                />
              ))}
            </div>
            <Link
              href="/announcements"
              className="flex items-center justify-center gap-1 mt-3 text-xs font-semibold transition-colors duration-150 hover:underline"
              style={{ color: "#2d5a27" }}
            >
              <span>Voir toutes les annonces</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

function SuggestionItem({ user }: { user: CommunityUser }) {
  const { toggle, isLoading } = useFollow(user.id, false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center gap-2">
      <Link href={`/profile/${user.id}`}>
        <Avatar
          src={getAvatarUrl(user.avatar)}
          firstname={user.firstname}
          size="sm"
          className="ring-1 ring-green-300/30 flex-shrink-0"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${user.id}`}
          className="text-xs font-semibold truncate block transition-colors duration-150"
          style={{ color: "#191c18", fontFamily: "'Inter', sans-serif" }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#2d5a27")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.color = "#191c18")
          }
        >
          {user.firstname} {user.lastname}
        </Link>
        {user.headline && (
          <p className="text-[10px] truncate" style={{ color: "#72796e" }}>
            {user.headline}
          </p>
        )}
      </div>
      <button
        onClick={() => toggle.mutate()}
        disabled={isLoading}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="flex items-center gap-1 text-xs font-bold flex-shrink-0 disabled:opacity-50 px-2.5 py-1 rounded-full transition-all duration-150"
        style={{
          background: isHovered ? "rgba(45,90,39,0.2)" : "rgba(45,90,39,0.1)",
          color: "#2d5a27",
          border: "1px solid rgba(45,90,39,0.2)",
        }}
      >
        <UserPlus className="w-3 h-3" />
        {isLoading ? "..." : "Suivre"}
      </button>
    </div>
  );
}

// Composant AnnouncementCard stylisé avec useLikeAnnouncement
function AnnouncementCard({ announcement }: { announcement: any }) {
  const likeMutation = useLikeAnnouncement();
  const [isLiked, setIsLiked] = useState(announcement.is_liked || false);
  const [likesCount, setLikesCount] = useState(announcement.likes_count || 0);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount((prev: number) => (isLiked ? prev - 1 : prev + 1));

    likeMutation.mutate(announcement.id, {
      onError: () => {
        setIsLiked(isLiked);
        setLikesCount(likesCount);
      },
    });
  };

  const category =
    categoryConfig[announcement.category] || categoryConfig.other;
  const isExpired =
    announcement.expires_at && new Date(announcement.expires_at) < new Date();

  return (
    <div
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/announcements/${announcement.id}`} className="block">
        <div className="space-y-1.5">
          {/* Titre avec icône catégorie */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <p
                className="text-xs font-semibold line-clamp-2 transition-colors duration-150"
                style={{
                  color: isHovered ? "#2d5a27" : "#191c18",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {announcement.title}
              </p>
            </div>

            {/* Badge catégorie */}
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: category.bg,
              }}
            >
              <span style={{ color: category.color }}>{category.icon}</span>
              <span
                className="text-[9px] font-semibold"
                style={{ color: category.color }}
              >
                {category.label}
              </span>
            </div>
          </div>

          {/* Stats et actions */}
          <div className="flex items-center justify-between">
            {/* Date d'expiration */}
            {announcement.expires_at && (
              <div className="flex items-center gap-1">
                <Clock
                  className={`w-2.5 h-2.5 ${isExpired ? "text-red-400" : "text-orange-400"}`}
                />
                <span
                  className={`text-[9px] font-medium ${isExpired ? "text-red-400" : "text-orange-400"}`}
                >
                  {isExpired
                    ? "Expiré"
                    : new Date(announcement.expires_at).toLocaleDateString(
                        "fr-FR",
                        {
                          day: "numeric",
                          month: "short",
                        },
                      )}
                </span>
              </div>
            )}

            {/* Bouton like */}
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              className="flex items-center gap-1 text-[10px] transition-all duration-150 disabled:opacity-50 hover:scale-105"
              style={{ color: isLiked ? "#dc2626" : "#72796e" }}
            >
              <Heart
                className="w-3 h-3"
                strokeWidth={1.8}
                fill={isLiked ? "#dc2626" : "none"}
              />
              {likesCount > 0 && (
                <span className="font-medium">{likesCount}</span>
              )}
            </button>
          </div>

          {/* Ligne de séparation */}
          <div
            className="h-px"
            style={{ background: "rgba(194,201,187,0.3)" }}
          />
        </div>
      </Link>
    </div>
  );
}
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
  TrendingUp,
} from "lucide-react";
import { followService } from "@/services/community/follow.service";
import { Avatar } from "../shared/Avatar";
import { useFollow } from "@/hooks/community/useFollow";
import { CommunityUser } from "@/types/community.types";
import {
  useLatestAnnouncements,
  useLikeAnnouncement,
} from "@/hooks/community/useAnnouncements";

// ─── Utilitaire avatar ────────────────────────────────────────────────────────
const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith("http://") || avatar.startsWith("https://"))
    return avatar;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${apiUrl}${cleanPath}`;
};

// ─── Config catégories ────────────────────────────────────────────────────────
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

// ─── Styles partagés ──────────────────────────────────────────────────────────
const cardStyle: React.CSSProperties = {
  background: "rgba(249,250,242,0.96)",
  backdropFilter: "blur(12px)",
  border: "1px solid rgba(194,201,187,0.4)",
  borderRadius: "1rem",
  boxShadow: "0 2px 12px rgba(21,66,18,0.04)",
};

// ─── Composant principal ──────────────────────────────────────────────────────
export function RightSidebar() {
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

  const {
    announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useLatestAnnouncements(3);

  // Skeleton initial
  if (
    suggestionsLoading &&
    announcementsLoading &&
    !suggestions &&
    !announcements.length
  ) {
    return (
      <aside
        className="fixed right-0 top-16 h-[calc(100vh-4rem)] hidden xl:flex flex-col gap-3 p-4 overflow-y-auto w-[280px]"
        style={{ scrollbarWidth: "none" }}
      >
        {[1, 2].map((i) => (
          <div key={i} className="p-4 animate-pulse" style={cardStyle}>
            <div className="h-3 bg-[#e4e9e0] rounded w-1/2 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-10 bg-[#e4e9e0] rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </aside>
    );
  }

  return (
    <aside
      className="fixed right-0 top-16 h-[calc(100vh-4rem)] hidden xl:flex flex-col gap-4 p-4 overflow-y-auto w-[280px]"
      style={{ scrollbarWidth: "none" }}
    >
      {/* ── Suggestions ────────────────────────────────────────────── */}
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
          <div className="space-y-1">
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

      {/* ── Annonces récentes ───────────────────────────────────────── */}
      {announcements.length > 0 && !announcementsError && (
        <div className="p-4" style={cardStyle}>
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
          <div className="space-y-0.5">
            {announcements.map((announcement: any, index: number) => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                isLast={index === announcements.length - 1}
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

      {/* ── Tendances ───────────────────────────────────────────────── */}
      <div className="p-4" style={cardStyle}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color: "#2d5a27" }} />
          <h3
            className="text-sm font-bold"
            style={{
              color: "#191c18",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Tendances
          </h3>
        </div>
        <div className="space-y-2.5">
          {[
            { tag: "#Agroécologie", count: 120 },
            { tag: "#MaraîchageBio", count: 103 },
            { tag: "#AgriTech", count: 86 },
            { tag: "#Compostage", count: 69 },
          ].map(({ tag, count }, i) => (
            <div
              key={tag}
              className="flex items-center justify-between group cursor-pointer py-0.5"
            >
              <div>
                <p
                  className="text-xs font-semibold group-hover:underline transition-colors duration-150"
                  style={{
                    color: "#2d5a27",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {tag}
                </p>
                <p className="text-[10px]" style={{ color: "#72796e" }}>
                  {count.toLocaleString("fr-FR")} publications
                </p>
              </div>
              <span
                className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(45,90,39,0.1)", color: "#2d5a27" }}
              >
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

// ─── SuggestionItem ───────────────────────────────────────────────────────────
function SuggestionItem({ user }: { user: CommunityUser }) {
  const { toggle, isLoading } = useFollow(user.id, false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="flex items-center gap-2 py-1.5 px-1.5 rounded-xl transition-colors duration-150 hover:bg-[rgba(188,240,174,0.15)]">
      <Link href={`/profile/${user.id}`} className="flex-shrink-0">
        <Avatar
          src={getAvatarUrl(user.avatar)}
          firstname={user.firstname}
          size="sm"
          className="ring-1 ring-green-300/30"
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
        className="flex items-center gap-1 text-[11px] font-bold flex-shrink-0 disabled:opacity-50 px-2.5 py-1 rounded-full transition-all duration-150"
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

// ─── AnnouncementCard ─────────────────────────────────────────────────────────
function AnnouncementCard({
  announcement,
  isLast,
}: {
  announcement: any;
  isLast: boolean;
}) {
  const likeMutation = useLikeAnnouncement();
  const [isLiked, setIsLiked] = useState(announcement.is_liked || false);
  const [likesCount, setLikesCount] = useState(announcement.likes_count || 0);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount((prev: number) => (wasLiked ? prev - 1 : prev + 1));
    likeMutation.mutate(announcement.id, {
      onError: () => {
        setIsLiked(wasLiked);
        setLikesCount(announcement.likes_count || 0);
      },
    });
  };

  const category =
    categoryConfig[announcement.category] || categoryConfig.other;
  const isExpired =
    announcement.expires_at && new Date(announcement.expires_at) < new Date();

  return (
    <>
      <div
        className="py-2 px-1.5 rounded-xl transition-colors duration-150"
        style={{
          background: isHovered ? "rgba(188,240,174,0.12)" : "transparent",
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link
          href={`/announcements/${announcement.id}`}
          className="block space-y-1.5"
        >
          {/* Titre + badge catégorie */}
          <div className="flex items-start justify-between gap-2">
            <p
              className="text-xs font-semibold line-clamp-2 flex-1 transition-colors duration-150"
              style={{
                color: isHovered ? "#2d5a27" : "#191c18",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {announcement.title}
            </p>
            <div
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-full flex-shrink-0"
              style={{ background: category.bg }}
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

          {/* Meta : expiration + like */}
          <div className="flex items-center justify-between">
            {announcement.expires_at ? (
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
            ) : (
              <span />
            )}

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
        </Link>
      </div>

      {/* Séparateur entre cards, pas après la dernière */}
      {!isLast && (
        <div
          className="h-px mx-1.5"
          style={{ background: "rgba(194,201,187,0.3)" }}
        />
      )}
    </>
  );
}

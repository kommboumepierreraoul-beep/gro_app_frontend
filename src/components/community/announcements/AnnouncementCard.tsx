"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Clock,
  Pin,
  Briefcase,
  CalendarDays,
  Newspaper,
  GraduationCap,
  MoreHorizontal,
  Film,
} from "lucide-react";

import { Avatar } from "@/components/community/shared/Avatar";
import { TimeAgo } from "@/components/community/shared/TimeAgo";
import { CommentSection } from "@/components/community/feed/CommentSection";

interface AnnouncementCardProps {
  announcement: any;
}

const categoryConfig: Record<
  string,
  {
    label: string;
    color: string;
    bg: string;
    border: string;
    icon: React.ReactNode;
  }
> = {
  job: {
    label: "Offre",
    color: "#059669",
    bg: "rgba(5,150,105,0.08)",
    border: "rgba(5,150,105,0.2)",
    icon: <Briefcase className="w-3 h-3" />,
  },
  event: {
    label: "Événement",
    color: "#d97706",
    bg: "rgba(217,119,6,0.08)",
    border: "rgba(217,119,6,0.2)",
    icon: <CalendarDays className="w-3 h-3" />,
  },
  news: {
    label: "News",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.08)",
    border: "rgba(37,99,235,0.2)",
    icon: <Newspaper className="w-3 h-3" />,
  },
  training: {
    label: "Formation",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.2)",
    icon: <GraduationCap className="w-3 h-3" />,
  },
  other: {
    label: "Autre",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.08)",
    border: "rgba(107,114,128,0.2)",
    icon: <MoreHorizontal className="w-3 h-3" />,
  },
};

export function AnnouncementCard({
  announcement,
}: AnnouncementCardProps) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likes, setLikes] = useState(
    announcement.likes_count || 0
  );
  const [showComments, setShowComments] =
    useState(false);

  const category =
    categoryConfig[announcement.category] ||
    categoryConfig.other;

  const handleLike = () => {
    setLiked(!liked);
    setLikes((prev: number) =>
      liked ? prev - 1 : prev + 1
    );
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: announcement.title,
        text: announcement.content,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(
        window.location.href
      );
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-2xl group"
      style={{
        background:
          "linear-gradient(135deg,#ffffff 0%,#f9fafb 100%)",
        border: "1px solid rgba(0,0,0,0.06)",
        boxShadow:
          "0 4px 10px rgba(0,0,0,0.04)",
      }}
    >
      {/* MEDIA */}
      {announcement.cover_image && (
        <div className="relative h-64 overflow-hidden">
          <img
            src={announcement.cover_image}
            alt={announcement.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <div
              className="flex items-center gap-1 px-3 py-1 rounded-full backdrop-blur-md"
              style={{
                background: category.bg,
                border: `1px solid ${category.border}`,
              }}
            >
              <span style={{ color: category.color }}>
                {category.icon}
              </span>

              <span
                className="text-xs font-semibold"
                style={{ color: category.color }}
              >
                {category.label}
              </span>
            </div>
          </div>

          {/* Pin badge */}
          {announcement.is_pinned && (
            <div className="absolute top-4 right-4">
              <div className="flex items-center gap-1 bg-emerald-500/90 text-white px-3 py-1 rounded-full backdrop-blur-md">
                <Pin className="w-3 h-3" />
                <span className="text-xs font-medium">
                  Épinglé
                </span>
              </div>
            </div>
          )}

          {/* Video icon */}
          {announcement.media_type === "video" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Film className="w-7 h-7 text-white" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* CONTENT */}
      <div className="p-5">
        {/* AUTHOR */}
        <div className="flex items-center gap-3 mb-4">
          <Avatar
            src={announcement.author.avatar}
            firstname={
              announcement.author.firstname
            }
            size="sm"
          />

          <div>
            <p className="font-semibold text-sm text-gray-900">
              {announcement.author.firstname}{" "}
              {announcement.author.lastname}
            </p>

            <TimeAgo
              date={announcement.created_at}
              className="text-xs text-gray-400"
            />
          </div>
        </div>

        {/* TITLE */}
        <Link
          href={`/announcements/${announcement.id}`}
        >
          <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-emerald-600 transition">
            {announcement.title}
          </h2>
        </Link>

        {/* CONTENT */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4">
          {announcement.content}
        </p>

        {/* STATS */}
        <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
          {announcement.views_count > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>
                {announcement.views_count} vues
              </span>
            </div>
          )}

          {announcement.expires_at && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>
                Expire le{" "}
                {new Date(
                  announcement.expires_at
                ).toLocaleDateString("fr-FR")}
              </span>
            </div>
          )}
        </div>

        {/* COUNTERS */}
        <div className="flex items-center justify-between border-t border-b border-gray-100 py-2 mb-3">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
            <span>{likes}</span>
          </div>

          <button
            onClick={() =>
              setShowComments(!showComments)
            }
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            {announcement.comments_count || 0}{" "}
            commentaires
          </button>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center justify-between">
          {/* LIKE */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all ${
              liked
                ? "bg-red-50 text-red-600"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            <Heart
              className="w-4 h-4"
              fill={liked ? "#dc2626" : "none"}
            />
            <span className="text-sm font-medium">
              Aimer
            </span>
          </button>

          {/* COMMENT */}
          <button
            onClick={() =>
              setShowComments(!showComments)
            }
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">
              Commenter
            </span>
          </button>

          {/* SAVE */}
          <button
            onClick={() => setSaved(!saved)}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all"
          >
            <Bookmark
              className="w-4 h-4"
              fill={saved ? "#059669" : "none"}
            />
          </button>

          {/* SHARE */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:bg-gray-100 transition-all"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* COMMENTS */}
        {showComments && (
          <div className="mt-5 pt-4 border-t border-gray-100">
            <CommentSection
              postId={announcement.id}
            />
          </div>
        )}
      </div>
    </div>
  );
}
// components/community/posts/PostCard.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { PostActions } from "../PostActions";
import { CommentSection } from "../CommentSection";
import { PostCardHeader } from "./PostCardHeader";
import { PostContent } from "./PostContent";
import { PostActionsBar } from "./PostActionsBar";
import { DeleteModal } from "./DeleteModal";
import { EditModal } from "./EditModal";
import { MediaViewerModal } from "./MediaViewerModal";
import { useAuthStore } from "@/stores/auth.store";
import { useFeed } from "@/hooks/community/useFeed";
import { Post } from "@/types/community.types";
import { profileService } from "@/services/community/profile.service";

import {
  Megaphone,
  Pin,
  FileText,
  Image as ImageIcon,
  Film,
  Briefcase,
  CalendarDays,
  Newspaper,
  GraduationCap,
  MoreHorizontal,
} from "lucide-react";
import { JSX } from "react/jsx-runtime";

// Configuration des badges pour différents types de posts
const postTypeConfig: Record<
  string,
  { label: string; icon: JSX.Element; color: string; bg: string }
> = {
  announcement: {
    label: "Annonce officielle",
    icon: <Megaphone className="w-3 h-3" />,
    color: "#dc2626",
    bg: "rgba(220,38,38,0.1)",
  },
  pinned: {
    label: "Épinglé",
    icon: <Pin className="w-3 h-3" />,
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
  },
  text: {
    label: "Texte",
    icon: <FileText className="w-3 h-3" />,
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
  },
  image: {
    label: "Photo",
    icon: <ImageIcon className="w-3 h-3" />,
    color: "#3b82f6",
    bg: "rgba(59,130,246,0.1)",
  },
  video: {
    label: "Vidéo",
    icon: <Film className="w-3 h-3" />,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
  },
};

// Configuration des catégories d'annonces
const announcementCategoryConfig: Record<
  string,
  { label: string; icon: JSX.Element; color: string; bg: string }
> = {
  job: {
    label: "Offre d'emploi",
    icon: <Briefcase className="w-3 h-3" />,
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
  },
  event: {
    label: "Événement",
    icon: <CalendarDays className="w-3 h-3" />,
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
  },
  news: {
    label: "Actualité",
    icon: <Newspaper className="w-3 h-3" />,
    color: "#2563eb",
    bg: "rgba(37,99,235,0.1)",
  },
  training: {
    label: "Formation",
    icon: <GraduationCap className="w-3 h-3" />,
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
  },
  other: {
    label: "Autre",
    icon: <MoreHorizontal className="w-3 h-3" />,
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
  },
};

interface PostCardProps {
  post: Post;
  isAnnouncement?: boolean;
  announcementCategory?: string;
  isPinned?: boolean;
}

export function PostCard({
  post,
  isAnnouncement = false,
  announcementCategory = "other",
  isPinned = false,
}: PostCardProps) {
  const { user } = useAuthStore();
  const { deletePost, updatePost } = useFeed();

  const [showComments, setShowComments] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const isOwner = user?.id === post.author?.id;

  // Déterminer le type de post pour l'affichage du badge
  const postType =
    post.type ||
    (post.media_urls?.length
      ? post.media_urls[0].includes(".mp4")
        ? "video"
        : "image"
      : "text");

  const typeConfig = postTypeConfig[postType] || postTypeConfig.text;
  const categoryConfig =
    announcementCategoryConfig[announcementCategory] ||
    announcementCategoryConfig.other;

  const handleDelete = () => {
    deletePost.mutate(post.id, {
      onSuccess: () => setShowDeleteModal(false),
    });
  };

  const handleSave = (content: string) => {
    updatePost.mutate(
      { id: post.id, content },
      { onSuccess: () => setShowEditModal(false) },
    );
  };

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediaViewer(true);
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden mx-auto w-full transition-all duration-300 hover:shadow-lg flex flex-col relative"
        style={{
          background: isAnnouncement
          ? "rgba(254,202,202,0.92)"
            : "rgba(249,250,242,0.92)",
          backdropFilter: "blur(16px)",
          border: isAnnouncement
            ? "1px solid rgba(220,38,38,0.2)"
            : "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Badges en haut à droite */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          {/* Badge épinglé */}
          {isPinned && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm"
              style={{
                background: "rgba(5,150,105,0.95)",
                border: "1px solid rgba(5,150,105,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Pin className="w-3 h-3 text-white" />
              <span className="text-[10px] font-semibold text-white">
                Épinglé
              </span>
            </div>
          )}

          {/* Badge annonce officielle */}
          {isAnnouncement && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm"
              style={{
                background: "rgba(220,38,38,0.95)",
                border: "1px solid rgba(220,38,38,0.3)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Megaphone className="w-3 h-3 text-white" />
              <span className="text-[10px] font-semibold text-white">
                Annonce
              </span>
            </div>
          )}

          {/* Badge catégorie d'annonce */}
          {isAnnouncement && announcementCategory !== "other" && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm"
              style={{
                background: categoryConfig.bg,
                border: `1px solid ${categoryConfig.color}30`,
                backdropFilter: "blur(8px)",
              }}
            >
              <span style={{ color: categoryConfig.color }}>
                {categoryConfig.icon}
              </span>
              <span
                className="text-[10px] font-semibold"
                style={{ color: categoryConfig.color }}
              >
                {/* {categoryConfig.label} */}
              </span>
            </div>
          )}

          {/* Badge type de post */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full backdrop-blur-sm shadow-sm"
            style={{
              background: typeConfig.bg,
              border: `1px solid ${typeConfig.color}30`,
              backdropFilter: "blur(8px)",
            }}
          >
            <span style={{ color: typeConfig.color }}>{typeConfig.icon}</span>
            <span
              className="text-[10px] font-semibold"
              style={{ color: typeConfig.color }}
            >
              {/* {typeConfig.label} */}
            </span>
          </div>
        </div>

        <PostCardHeader
          author={post.author}
          createdAt={post.created_at}
          isOwner={isOwner}
          onEdit={() => setShowEditModal(true)}
          onDelete={() => setShowDeleteModal(true)}
        />

        <PostContent post={post} onMediaClick={handleMediaClick} />

        <div className="flex-shrink-0">
          <PostActionsBar
            likesCount={post.likes_count}
            commentsCount={post.comments_count}
            onCommentsToggle={() => setShowComments((v) => !v)}
          />

          <div
            className="flex items-center"
            style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}
          >
            <PostActions
              post={post}
              onCommentClick={() => setShowComments((v) => !v)}
            />
          </div>

          {showComments && (
            <div
              className="px-4 py-3"
              style={{
                borderTop: "0.5px solid rgba(0,0,0,0.06)",
                background: "rgba(0,0,0,0.02)",
              }}
            >
              <CommentSection postId={post.id} />
            </div>
          )}
        </div>
      </div>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteModal(false)}
          isPending={deletePost.isPending}
        />
      )}

      {showEditModal && (
        <EditModal
          post={post}
          onSave={handleSave}
          onCancel={() => setShowEditModal(false)}
          isPending={updatePost?.isPending ?? false}
        />
      )}

      {showMediaViewer && (
        <MediaViewerModal
          mediaItems={(post.media_urls || []).map((url, index) => ({
            url,
            type: post.media_types?.[index],
            mime_type: post.media_mime_types?.[index],
          }))}
          initialIndex={selectedMediaIndex}
          onClose={() => setShowMediaViewer(false)}
        />
      )}

      <style jsx global>{`
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
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </>
  );
}
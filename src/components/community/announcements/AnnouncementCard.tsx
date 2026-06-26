"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
  Calendar,
  MapPin,
  Clock,
  Bookmark,
  Share2,
  ExternalLink,
  Briefcase,
  CalendarDays,
  Newspaper,
  GraduationCap,
  Pin,
  Compass,
  Eye,
  Users,
  Sparkles,
  Zap,
  ChevronRight,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

import { Avatar } from "../shared/Avatar";
import { useAuthStore } from "@/stores/auth.store";
import { announcementService } from "@/services/community/announcement.service";
import type { Announcement } from "@/types/community.types";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

/* ─────────────────────────── category metadata ─────────────────────────── */

const CATEGORY_META: Record<
  string,
  { label: string; icon: React.ElementType; chipClass: string; color: string; bgClass: string }
> = {
  job: {
    label: "Offre d'emploi",
    icon: Briefcase,
    chipClass: "chip chip--amber",
    color: "#d97706",
    bgClass: "bg-amber-50 border-amber-200",
  },
  event: {
    label: "Événement",
    icon: CalendarDays,
    chipClass: "chip chip--green",
    color: "#059669",
    bgClass: "bg-green-50 border-green-200",
  },
  news: {
    label: "Actualité",
    icon: Newspaper,
    chipClass: "chip chip--stone",
    color: "#6b7280",
    bgClass: "bg-stone-50 border-stone-200",
  },
  training: {
    label: "Formation",
    icon: GraduationCap,
    chipClass: "chip chip--lime",
    color: "#7c3aed",
    bgClass: "bg-purple-50 border-purple-200",
  },
  other: {
    label: "Autre",
    icon: Pin,
    chipClass: "chip chip--gray",
    color: "#6b7280",
    bgClass: "bg-gray-50 border-gray-200",
  },
};

function getCategoryMeta(value: string) {
  return (
    CATEGORY_META[value] ?? {
      label: value,
      icon: Compass,
      chipClass: "chip chip--emerald",
      color: "#059669",
      bgClass: "bg-emerald-50 border-emerald-200",
    }
  );
}

/* ─────────────────────────── helpers ─────────────────────────── */

const getFullMediaUrl = (url?: string | null): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/storage")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${url}`;
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${apiUrl}/${url}`;
};

/* ─────────────────────────── props ─────────────────────────── */

interface AnnouncementCardProps {
  announcement: Announcement;
  viewMode?: "grid" | "list";
  onDelete?: (id: number) => void;
  onEdit?: (announcement: Announcement) => void;
}

/* ─────────────────────────── component ─────────────────────────── */

export function AnnouncementCard({
  announcement,
  viewMode = "grid",
  onDelete,
  onEdit,
}: AnnouncementCardProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(announcement.is_liked || false);
  const [likesCount, setLikesCount] = useState(announcement.likes_count || 0);
  const [saved, setSaved] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = user?.id === announcement.author?.id;
  const meta = getCategoryMeta(announcement.category ?? "other");
  const Icon = meta.icon;

  const timeAgo = formatDistanceToNow(new Date(announcement.created_at), {
    addSuffix: true,
    locale: fr,
  });

  const authorName = announcement.author?.firstname && announcement.author?.lastname
    ? `${announcement.author.firstname} ${announcement.author.lastname}`
    : "Anonyme";

  const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ─── Actions ─── */

  const handleLike = async () => {
    try {
      const result = await announcementService.toggleLike(announcement.id);
      setLiked(result.liked);
      setLikesCount((prev) => (result.liked ? prev + 1 : prev - 1));
    } catch {
      toast.error("Erreur lors du like");
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/announcements/${announcement.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: announcement.title,
          text: announcement.content,
          url,
        });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Lien copié !");
      } catch {
        toast.error("Impossible de copier le lien");
      }
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await announcementService.delete(announcement.id);
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Annonce supprimée");
      if (onDelete) onDelete(announcement.id);
    } catch {
      toast.error("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = () => {
    if (onEdit) onEdit(announcement);
  };

  /* ─────────────────────────── RENDER ─────────────────────────── */

  const renderBadge = () => (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${meta.chipClass}`}>
      <Icon className="h-3 w-3" />
      {meta.label}
    </span>
  );

  const renderExpiryBadge = () => {
    if (!announcement.expires_at) return null;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
        isExpired
          ? "bg-red-50 text-red-600 border border-red-200"
          : "bg-amber-50 text-amber-600 border border-amber-200"
      }`}>
        <Clock className="h-3 w-3" />
        {isExpired ? "Expirée" : "Expire bientôt"}
      </span>
    );
  };

  const renderAuthor = (size: "sm" | "md" = "sm") => {
    const avatarSize = size === "sm" ? "sm" : "md";
    return (
      <Link href={`/community/profile/${announcement.author?.id}`} className="flex-shrink-0">
        <Avatar
          src={announcement.author?.avatar}
          firstname={announcement.author?.firstname}
          size={avatarSize}
          className="ring-2 ring-[#bcf0ae]/30"
        />
      </Link>
    );
  };

  const renderAuthorInfo = () => (
    <div className="min-w-0 flex-1">
      <Link
        href={`/community/profile/${announcement.author?.id}`}
        className="text-sm font-medium text-[#191c18] hover:text-[#154212] transition-colors truncate block"
      >
        {authorName}
      </Link>
      <div className="flex items-center gap-1.5 text-xs text-[#72796e]">
        <Clock className="h-3 w-3" />
        {timeAgo}
        {announcement.location && (
          <>
            <span>·</span>
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{announcement.location}</span>
          </>
        )}
      </div>
    </div>
  );

  const renderMenu = () => (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="w-8 h-8 flex items-center justify-center rounded-full transition hover:bg-[#f9faf2]"
      >
        <MoreHorizontal className="w-4 h-4 text-[#72796e]" />
      </button>
      {menuOpen && (
        <div className="absolute right-0 top-10 z-20 min-w-[160px] rounded-xl border border-[#c2c9bb]/20 bg-white p-1 shadow-lg shadow-[#154212]/10 animate-slide-down">
          <button
            onClick={() => {
              setMenuOpen(false);
              handleEdit();
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium text-[#42493e] transition-colors hover:bg-[#f9faf2]"
          >
            <Pencil className="h-3.5 w-3.5 text-[#72796e]" />
            Modifier
          </button>
          <div className="mx-1 my-0.5 h-px bg-[#c2c9bb]/20" />
          <button
            onClick={() => {
              setMenuOpen(false);
              setShowDeleteConfirm(true);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5 text-red-400" />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );

  const renderActions = () => (
    <div className="flex items-center gap-1">
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          liked
            ? "bg-rose-50 text-rose-500"
            : "text-[#72796e] hover:text-[#191c18] hover:bg-[#f9faf2]"
        }`}
      >
        <Heart className={`h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />
        <span>{likesCount}</span>
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[#72796e] hover:text-[#191c18] hover:bg-[#f9faf2] transition-colors"
      >
        <Share2 className="h-4 w-4" />
      </button>

      <Link
        href={`/announcements/${announcement.id}`}
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-[#72796e] hover:text-[#191c18] hover:bg-[#f9faf2] transition-colors"
      >
        <MessageCircle className="h-4 w-4" />
      </Link>

      <button
        onClick={() => setSaved(!saved)}
        className={`flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors ${
          saved
            ? "text-[#154212]"
            : "text-[#72796e] hover:text-[#191c18] hover:bg-[#f9faf2]"
        }`}
      >
        <Bookmark className={`h-4 w-4 ${saved ? "fill-[#154212]" : ""}`} />
      </button>
    </div>
  );

  /* ─── LIST MODE ─── */
  if (viewMode === "list") {
    return (
      <>
        <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg bg-white border border-[#c2c9bb]/20">
          <div className="flex items-start gap-4 p-4 sm:p-5">
            {renderAuthor("md")}

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {renderBadge()}
                {renderExpiryBadge()}
                {announcement.is_pinned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#eaf3de] text-[#154212] border border-[#bcf0ae]/30">
                    <Pin className="h-3 w-3" />
                    Épinglé
                  </span>
                )}
              </div>

              <Link href={`/announcements/${announcement.id}`}>
                <h3 className="text-base font-semibold text-[#191c18] hover:text-[#154212] transition-colors line-clamp-1">
                  {announcement.title}
                </h3>
              </Link>

              <p className="text-sm text-[#42493e] line-clamp-2 mt-1">
                {announcement.content}
              </p>

              <div className="flex items-center gap-4 mt-2 text-xs text-[#72796e]">
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {announcement.views || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" />
                  {likesCount}
                </span>
                {announcement.expires_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(announcement.expires_at).toLocaleDateString("fr-FR")}
                  </span>
                )}
              </div>
            </div>

            {isOwner && renderMenu()}
          </div>

          <div className="flex items-center justify-between px-4 sm:px-5 py-2 border-t border-[#c2c9bb]/10">
            {renderActions()}
            <Link
              href={`/announcements/${announcement.id}`}
              className="text-xs font-medium text-[#154212] hover:underline flex items-center gap-1"
            >
              Voir détails
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {showDeleteConfirm && (
          <DeleteConfirm
            loading={isDeleting}
            onConfirm={handleDelete}
            onCancel={() => setShowDeleteConfirm(false)}
          />
        )}
      </>
    );
  }

  /* ─── GRID MODE ─── */
  return (
    <>
      <div className="group rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg bg-white border border-[#c2c9bb]/20 flex flex-col h-full">
        {/* Media */}
        <div className="relative h-48 bg-gradient-to-br from-[#154212] to-[#2d6a4f] overflow-hidden">
          {announcement.cover_image ? (
            <img
              src={getFullMediaUrl(announcement.cover_image)}
              alt={announcement.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <Icon className="h-12 w-12 text-white/30" />
            </div>
          )}

          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {renderBadge()}
            {announcement.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#154212]/80 text-white backdrop-blur-sm border border-white/20">
                <Pin className="h-3 w-3" />
                Épinglé
              </span>
            )}
          </div>

          {/* Expiry badge */}
          {announcement.expires_at && (
            <div className="absolute top-3 right-3">
              {renderExpiryBadge()}
            </div>
          )}

          {/* Sauvegarder */}
          <button
            onClick={() => setSaved(!saved)}
            className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-xl transition-all ${
              saved
                ? "bg-[#154212] text-white shadow-sm"
                : "bg-white/20 text-white backdrop-blur-sm hover:bg-white/30"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${saved ? "fill-white" : ""}`} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          {/* Auteur */}
          <div className="flex items-center gap-2.5 mb-3">
            {renderAuthor("sm")}
            {renderAuthorInfo()}
            {isOwner && renderMenu()}
          </div>

          {/* Titre */}
          <Link href={`/announcements/${announcement.id}`}>
            <h3 className="text-base font-semibold text-[#191c18] hover:text-[#154212] transition-colors line-clamp-2 mb-1">
              {announcement.title}
            </h3>
          </Link>

          {/* Contenu */}
          <p className="text-sm text-[#42493e] line-clamp-3 flex-1">
            {announcement.content}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[#72796e]">
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {announcement.views || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {likesCount}
            </span>
            {announcement.expires_at && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(announcement.expires_at).toLocaleDateString("fr-FR")}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#c2c9bb]/10">
            {renderActions()}
            <Link
              href={`/announcements/${announcement.id}`}
              className="text-xs font-medium text-[#154212] hover:underline flex items-center gap-1"
            >
              Lire plus
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDeleteConfirm && (
        <DeleteConfirm
          loading={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}

      <style jsx global>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-down {
          animation: slide-down 0.15s ease-out;
        }
      `}</style>
    </>
  );
}

/* ─────────────────────────── Delete Confirm Modal ─────────────────────────── */

function DeleteConfirm({
  loading,
  onConfirm,
  onCancel,
}: {
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl animate-scale-in">
        <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
          <Trash2 className="h-6 w-6 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#191c18] text-center mb-2">
          Supprimer cette annonce ?
        </h3>
        <p className="text-sm text-[#72796e] text-center mb-6">
          Cette action est irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-[#c2c9bb]/30 rounded-xl text-sm font-medium text-[#42493e] hover:bg-[#f9faf2] transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition-colors"
          >
            {loading ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}
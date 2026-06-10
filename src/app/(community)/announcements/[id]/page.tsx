/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/announcements/[id]/page.tsx
"use client";

import { JSX, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  User,
  Tag,
  Clock,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronRight,
  Megaphone,
  Briefcase,
  CalendarDays,
  Newspaper,
  GraduationCap,
  MoreHorizontal,
  Pin,
  FileText,
  Image as ImageIcon,
  Film,
  Trash2,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementService } from "@/services/community/announcement.service";
import { useAuthStore } from "@/stores/auth.store";
import { Avatar } from "@/components/community/shared/Avatar";
import { TimeAgo } from "@/components/community/shared/TimeAgo";
import toast from "react-hot-toast";
import { EditAnnouncementForm } from "@/components/community/announcements/EditAnnouncementForm";
import { DeleteAnnouncementModal } from "@/components/community/announcements/DeleteAnnouncementModal";
import React from "react";

// Configuration des catégories
const categoryConfig: Record<string, { label: string; color: string; bg: string; icon: JSX.Element }> = {
  job: {
    label: "Offre d'emploi",
    color: "#059669",
    bg: "rgba(5,150,105,0.1)",
    icon: <Briefcase className="w-4 h-4" />,
  },
  event: {
    label: "Événement",
    color: "#d97706",
    bg: "rgba(217,119,6,0.1)",
    icon: <CalendarDays className="w-4 h-4" />,
  },
  news: {
    label: "Actualité",
    color: "#2563eb",
    bg: "rgba(37,99,235,0.1)",
    icon: <Newspaper className="w-4 h-4" />,
  },
  training: {
    label: "Formation",
    color: "#7c3aed",
    bg: "rgba(124,58,237,0.1)",
    icon: <GraduationCap className="w-4 h-4" />,
  },
  other: {
    label: "Autre",
    color: "#6b7280",
    bg: "rgba(107,114,128,0.1)",
    icon: <MoreHorizontal className="w-4 h-4" />,
  },
};

// Fonction pour l'URL complète
const getFullMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiUrl}${cleanPath}`;
};

// Composant pour afficher le média
function AnnouncementMediaDisplay({ coverImage, mediaType, title }: { coverImage?: string | null; mediaType?: string; title: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const mediaUrl = getFullMediaUrl(coverImage);
  const isVideo = mediaType === "video" || (coverImage && ['.mp4', '.webm', '.mov', '.avi', '.mkv'].some(ext => coverImage.toLowerCase().includes(ext)));

  if (!mediaUrl) return null;

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (isVideo) {
    return (
      <div className="relative group rounded-xl overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={mediaUrl}
          className="w-full max-h-[500px] object-contain"
          onClick={togglePlay}
          playsInline
        />
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center transition-all hover:scale-110 opacity-0 group-hover:opacity-100"
        >
          {isPlaying ? (
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Film className="w-6 h-6 text-white ml-1" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="relative group rounded-xl overflow-hidden">
      <img
        src={mediaUrl}
        alt={title}
        className="w-full max-h-[500px] object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
    </div>
  );
}

export default function AnnouncementPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const {
    data: announcement,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["announcement", id],
    queryFn: () => announcementService.getOne(Number(id)),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: () => announcementService.delete(Number(id)),
    onSuccess: () => {
      toast.success("Annonce supprimée avec succès");
      router.push("/announcements");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    },
  });

  const likeMutation = useMutation({
    mutationFn: () => announcementService.toggleLike(Number(id)),
    onMutate: async () => {
      // Optimistic update
      queryClient.setQueryData(["announcement", id], (old: any) => ({
        ...old,
        is_liked: !old?.is_liked,
        likes_count: old?.is_liked ? old.likes_count - 1 : old.likes_count + 1,
      }));
    },
    onSuccess: (result) => {
      queryClient.setQueryData(["announcement", id], (old: any) => ({
        ...old,
        is_liked: result.liked,
        likes_count: result.likes_count,
      }));
      toast.success(result.liked ? "Vous aimez cette annonce" : "Like retiré");
    },
    onError: () => {
      toast.error("Erreur lors du like");
    },
  });

  const isOwner = user?.id === announcement?.author?.id;
  const category = announcement ? categoryConfig[announcement.category] || categoryConfig.other : null;
  const isExpired = announcement?.expires_at && new Date(announcement.expires_at) < new Date();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: announcement?.title,
          text: announcement?.content,
          url: window.location.href,
        });
      } catch (error) {
        console.error("Erreur de partage:", error);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié !");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9faf2" }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" style={{ color: "#154212" }} />
          <p className="text-sm" style={{ color: "#72796e" }}>Chargement de l'annonce...</p>
        </div>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f9faf2" }}>
        <div className="text-center px-8 max-w-md">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(239,68,68,0.1)" }}>
            <Megaphone className="w-10 h-10" style={{ color: "#dc2626" }} />
          </div>
          <h2 className="text-xl font-semibold mb-2" style={{ color: "#154212", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Annonce non trouvée
          </h2>
          <p className="text-sm mb-6" style={{ color: "#72796e" }}>
            L'annonce que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/announcements"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all"
            style={{ background: "#bcf0ae", color: "#23501e" }}
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#f9faf2" }}>
      {/* Header avec retour */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: "rgba(194,201,187,0.35)" }}>
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105"
                style={{ background: "rgba(194,201,187,0.15)", color: "#42493e" }}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" style={{ color: "#2d5a27" }} />
                <h1 className="text-lg font-semibold" style={{ color: "#154212", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Annonce
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleShare}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105"
                style={{ background: "rgba(194,201,187,0.15)", color: "#42493e" }}
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsSaved(!isSaved)}
                className="w-10 h-10 flex items-center justify-center rounded-full transition-all hover:scale-105"
                style={{ background: isSaved ? "rgba(5,150,105,0.2)" : "rgba(194,201,187,0.15)", color: isSaved ? "#059669" : "#42493e" }}
              >
                <Bookmark className="w-4 h-4" fill={isSaved ? "#059669" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Carte principale */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "#ffffff", border: "1px solid rgba(194,201,187,0.25)", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
          {isEditing ? (
            <EditAnnouncementForm
              announcement={announcement}
              onCancel={() => setIsEditing(false)}
              onSuccess={() => {
                setIsEditing(false);
                queryClient.invalidateQueries({ queryKey: ["announcement", id] });
              }}
            />
          ) : (
            <>
              {/* Header auteur */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Link href={`/profile/${announcement.author.id}`}>
                      <Avatar
                        src={getFullMediaUrl(announcement.author.avatar)}
                        firstname={announcement.author.firstname}
                        size="lg"
                        className="ring-2 ring-green-300/50"
                      />
                    </Link>
                    <div>
                      <Link
                        href={`/profile/${announcement.author.id}`}
                        className="font-semibold hover:underline"
                        style={{ color: "#191c18", fontFamily: "'Inter', sans-serif" }}
                      >
                        {announcement.author.firstname} {announcement.author.lastname}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <TimeAgo date={announcement.created_at} className="text-xs" style={{ color: "#72796e" }} />
                        {announcement.is_pinned && (
                          <>
                            <span className="text-xs" style={{ color: "#cbd5e1" }}>·</span>
                            <div className="flex items-center gap-1">
                              <Pin className="w-3 h-3" style={{ color: "#059669" }} />
                              <span className="text-xs font-medium" style={{ color: "#059669" }}>Épinglé</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Badge catégorie */}
                  {category && (
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                      style={{ background: category.bg, border: `1px solid ${category.color}20` }}
                    >
                      <span style={{ color: category.color }}>{category.icon}</span>
                      <span className="text-xs font-semibold" style={{ color: category.color }}>
                        {category.label}
                      </span>
                    </div>
                  )}
                </div>

                {/* Titre */}
                <h1
                  className="text-2xl md:text-3xl font-bold mb-4 leading-tight"
                  style={{ color: "#191c18", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {announcement.title}
                </h1>

                {/* Média */}
                <AnnouncementMediaDisplay
                  coverImage={announcement.cover_image}
                  mediaType={announcement.media_type}
                  title={announcement.title}
                />

                {/* Contenu */}
                <div className="prose max-w-none my-6">
                  <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: "#42493e", fontFamily: "'Inter', sans-serif" }}>
                    {announcement.content}
                  </p>
                </div>

                {/* Statistiques */}
                <div className="flex flex-wrap items-center gap-6 pt-4 border-t" style={{ borderColor: "rgba(194,201,187,0.25)" }}>
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4" style={{ color: "#dc2626" }} />
                    <span className="text-sm" style={{ color: "#72796e" }}>{announcement.likes_count} j'aime</span>
                  </div>
                  {announcement.views_count > 0 && (
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" style={{ color: "#72796e" }} />
                      <span className="text-sm" style={{ color: "#72796e" }}>{announcement.views_count} vues</span>
                    </div>
                  )}
                  {announcement.expires_at && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" style={{ color: isExpired ? "#dc2626" : "#d97706" }} />
                      <span className="text-sm" style={{ color: isExpired ? "#dc2626" : "#d97706" }}>
                        {isExpired ? "Expiré le" : "Expire le"} {new Date(announcement.expires_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 p-6 pt-4 border-t" style={{ borderColor: "rgba(194,201,187,0.25)", background: "rgba(249,250,242,0.5)" }}>
                <button
                  onClick={() => likeMutation.mutate()}
                  disabled={likeMutation.isPending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                    background: announcement.is_liked ? "rgba(220,38,38,0.1)" : "#bcf0ae",
                    color: announcement.is_liked ? "#dc2626" : "#23501e",
                  }}
                >
                  <Heart className="w-5 h-5" fill={announcement.is_liked ? "#dc2626" : "none"} />
                  <span>{announcement.is_liked ? "J'aime" : "J'aime"}</span>
                </button>

                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]"
                  style={{ background: "rgba(194,201,187,0.15)", color: "#42493e" }}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Commenter</span>
                </button>

                {isOwner && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]"
                      style={{ background: "rgba(5,150,105,0.1)", color: "#059669" }}
                    >
                      <FileText className="w-5 h-5" />
                      <span>Modifier</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all hover:scale-[1.02]"
                      style={{ background: "rgba(220,38,38,0.1)", color: "#dc2626" }}
                    >
                      <Trash2 className="w-5 h-5" />
                      <span>Supprimer</span>
                    </button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal de suppression */}
      {showDeleteModal && (
        <DeleteAnnouncementModal
          onConfirm={() => deleteMutation.mutate()}
          onCancel={() => setShowDeleteModal(false)}
          isPending={deleteMutation.isPending}
        />
      )}
    </div>
  );
}


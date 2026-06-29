/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  FileText,
  X,
  Globe,
  Send,
  SmilePlus,
  Crop,
  Check,
  AlertCircle,
  Clock,
  Shield,
  AlertTriangle,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { useCreatePostStore } from "@/stores/createpost.store";
import { useFeed } from "@/hooks/community/useFeed";
import { ImageEditor } from "./ImageEditor";
import { VideoPreview } from "./VideoPreview";
import type { MediaItem } from "./types";
import { Avatar } from "../../shared/Avatar";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import toast from "react-hot-toast";

// Fonction pour obtenir l'URL complète de l'avatar
const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith("http")) return avatar;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${apiUrl}${cleanPath}`;
};

interface PublishingStatus {
  can_publish: boolean;
  blocked_until?: string;
  remaining_time?: string;
  stats?: {
    total_recent: number;
    rejected_count: number;
    rejection_rate: number;
    pending_count: number;
    consecutive_rejected: number;
  };
  reasons?: Array<{
    reason: string;
    type: "permanent" | "temporary";
    action: string;
  }>;
  estimated_wait_time?: string;
}

// ─── MODAL DE BLOCAGE ──────────────────────────────────────────────────────────
interface BlockedModalProps {
  publishingStatus: PublishingStatus;
  onClose: () => void;
  onRetry: () => void;
}

function BlockedModal({
  publishingStatus,
  onClose,
  onRetry,
}: BlockedModalProps) {
  if (!publishingStatus) return null;

  const isPermanent = publishingStatus.reasons?.some(
    (r) => r.type === "permanent",
  );
  const Icon = isPermanent ? Shield : AlertCircle;
  const title = isPermanent
    ? "Compte bloqué"
    : "Publication temporairement bloquée";
  const color = isPermanent ? "text-red-600" : "text-amber-600";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(15,25,12,0.7)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.98)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(194,201,187,0.5)",
          boxShadow: "0 24px 60px rgba(21,66,18,0.25)",
          animation: "groSlideUp 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{
            borderBottom: "1px solid rgba(194,201,187,0.2)",
            background: isPermanent
              ? "rgba(220,38,38,0.08)"
              : "rgba(245,158,11,0.08)",
          }}
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isPermanent
                ? "rgba(220,38,38,0.15)"
                : "rgba(245,158,11,0.15)",
            }}
          >
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            {publishingStatus.remaining_time && (
              <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                Temps restant estimé : {publishingStatus.remaining_time}
              </p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {publishingStatus.reasons && publishingStatus.reasons.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                Raisons du blocage :
              </p>
              <ul className="space-y-2">
                {publishingStatus.reasons.map((reason, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2.5 text-sm text-gray-600"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p>{reason.reason}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {reason.action}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {publishingStatus.stats && (
            <div
              className="rounded-xl p-4"
              style={{
                background: "rgba(249,250,242,0.8)",
                border: "1px solid rgba(194,201,187,0.2)",
              }}
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Statistiques de modération
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {publishingStatus.stats.rejected_count}
                  </p>
                  <p className="text-[10px] text-gray-400">Rejets</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {publishingStatus.stats.pending_count}
                  </p>
                  <p className="text-[10px] text-gray-400">En attente</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-800">
                    {publishingStatus.stats.rejection_rate}%
                  </p>
                  <p className="text-[10px] text-gray-400">Taux rejet</p>
                </div>
              </div>
            </div>
          )}

          {publishingStatus.estimated_wait_time && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                background: "rgba(188,240,174,0.15)",
                border: "1px solid rgba(188,240,174,0.3)",
              }}
            >
              <Clock className="w-4 h-4 text-green-700" />
              <p className="text-sm text-green-800">
                Temps d'attente estimé :{" "}
                <strong>{publishingStatus.estimated_wait_time}</strong>
              </p>
            </div>
          )}

          {isPermanent && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{
                background: "rgba(220,38,38,0.08)",
                border: "1px solid rgba(220,38,38,0.2)",
              }}
            >
              <Shield className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">
                Contactez un administrateur pour résoudre ce problème.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex gap-3 px-6 py-4"
          style={{
            borderTop: "1px solid rgba(194,201,187,0.2)",
            background: "rgba(249,250,242,0.5)",
          }}
        >
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{
              background: "rgba(194,201,187,0.15)",
              color: "#42493e",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.25)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(194,201,187,0.15)";
            }}
          >
            Fermer
          </button>
          {!isPermanent && publishingStatus.can_publish === false && (
            <button
              onClick={onRetry}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-150"
              style={{
                background: "linear-gradient(135deg, #3b6934 0%, #154212 100%)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform =
                  "scale(1.02)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "scale(1)";
              }}
            >
              Vérifier à nouveau
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SKELETON ──────────────────────────────────────────────────────────────────
function CreatePostSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden animate-pulse"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(194,201,187,0.4)",
        boxShadow: "0 2px 12px rgba(21,66,18,0.04)",
      }}
    >
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
        <div className="flex-1 h-10 rounded-full bg-gray-200" />
      </div>

      <div
        className="flex items-center px-2 pb-2"
        style={{ borderTop: "1px solid rgba(194,201,187,0.25)" }}
      >
        <div className="flex flex-1 items-center justify-center gap-2 py-2.5">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <div className="w-20 h-3 rounded bg-gray-200" />
        </div>

        <div
          className="w-px h-4"
          style={{ background: "rgba(194,201,187,0.5)" }}
        />

        <div className="flex flex-1 items-center justify-center gap-2 py-2.5">
          <div className="w-4 h-4 rounded bg-gray-200" />
          <div className="w-14 h-3 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export function CreatePostCard() {
  const { user } = useAuthStore();
  const { createPost } = useFeed();
  const { open, prefillContent, openModal, closeModal, clearPrefill } =
    useCreatePostStore();

  const [content, setContent] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [publishingStatus, setPublishingStatus] =
    useState<PublishingStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Récupérer le profil complet de l'utilisateur
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Simuler un chargement initial pour le skeleton
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  // Construire les données utilisateur pour l'affichage
  const displayUser = {
    id: profile?.id ?? user?.id,
    firstname: profile?.firstname ?? user?.firstname,
    lastname: profile?.lastname ?? user?.lastname,
    avatar: getAvatarUrl(profile?.avatar ?? user?.avatar),
    headline: profile?.headline ?? "Membre de la communauté",
  };

  // ✅ CORRECTION : Prefill depuis l'AI assistant avec setTimeout
  useEffect(() => {
    if (open && prefillContent) {
      const timer = setTimeout(() => {
        setContent(prefillContent);
        clearPrefill();
        textareaRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [open, prefillContent, clearPrefill]);

  // Nettoyage object URLs
  useEffect(() => {
    return () => {
      mediaItems.forEach((item) => {
        URL.revokeObjectURL(item.preview);
        if (item.edited) URL.revokeObjectURL(item.edited);
      });
    };
  }, [mediaItems]);

  // Auto-resize textarea
  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
  }, [content]);

  // Vérifier le statut de publication
  const checkPublishingStatus = useCallback(async () => {
    setIsCheckingStatus(true);
    try {
      const response = await postService.checkPublishingStatus();
      setPublishingStatus(response.data);

      if (!response.data.can_publish) {
        setShowBlockedModal(true);
      } else {
        // Si l'utilisateur peut publier, ouvrir le modal normal
        openModal();
        setTimeout(() => textareaRef.current?.focus(), 80);
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du statut:", error);
      // En cas d'erreur, on ouvre quand même le modal
      openModal();
    } finally {
      setIsCheckingStatus(false);
    }
  }, [openModal]);

  // Re-vérifier le statut
  const handleRetry = useCallback(() => {
    setShowBlockedModal(false);
    setTimeout(() => checkPublishingStatus(), 500);
  }, [checkPublishingStatus]);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const items: MediaItem[] = Array.from(files)
      .slice(0, 4)
      .map((file) => ({
        file,
        preview: URL.createObjectURL(file),
        type: file.type.startsWith("video/") ? "video" : "image",
      }));
    setMediaItems(items);
  }, []);

  const removeMedia = useCallback((i: number) => {
    setMediaItems((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      if (prev[i].edited) URL.revokeObjectURL(prev[i].edited!);
      return prev.filter((_, j) => j !== i);
    });
  }, []);

  const applyEdit = useCallback(
    (blobUrl: string) => {
      if (editingIndex === null) return;
      setMediaItems((prev) =>
        prev.map((item, i) => {
          if (i !== editingIndex) return item;
          if (item.edited) URL.revokeObjectURL(item.edited);
          return { ...item, edited: blobUrl };
        }),
      );
      setEditingIndex(null);
    },
    [editingIndex],
  );

  const handleSubmit = useCallback(async () => {
    const hasContent = content.trim().length > 0;
    const hasMedia = mediaItems.length > 0;
    if (!hasContent && !hasMedia) return;

    const finalFiles: File[] = await Promise.all(
      mediaItems.map(async (item) => {
        if (item.edited) {
          const res = await fetch(item.edited);
          const blob = await res.blob();
          return new File([blob], item.file.name, { type: "image/jpeg" });
        }
        return item.file;
      }),
    );

    const hasVideo = mediaItems.some((m) => m.type === "video");
    const hasPdf = mediaItems.some((m) => m.file.type === "application/pdf");

    const type = !hasMedia
      ? "text"
      : hasVideo
        ? "video"
        : hasPdf
          ? "pdf"
          : "image";

    try {
      await createPost.mutateAsync({
        content: content.trim(),
        type,
        media: finalFiles,
      });
      setContent("");
      mediaItems.forEach((item) => {
        URL.revokeObjectURL(item.preview);
        if (item.edited) URL.revokeObjectURL(item.edited!);
      });
      setMediaItems([]);
      closeModal();
    } catch (err) {
      console.error(err);
    }
  }, [content, mediaItems, createPost, closeModal]);

  const canSubmit =
    (content.trim().length > 0 || mediaItems.length > 0) &&
    !createPost.isPending;
  const remaining = 10000 - content.length;
  const imageItems = mediaItems.filter((m) => m.type === "image");
  const gridCols = imageItems.length === 1 ? "grid-cols-1" : "grid-cols-2";

  // ── AFFICHAGE DU SKELETON ──
  if (isLoading || profileLoading) {
    return <CreatePostSkeleton />;
  }

  // ── RENDU PRINCIPAL ──
  return (
    <>
      {/* ── Trigger card ── */}
      <div
        className="rounded-2xl overflow-hidden transition-all duration-200"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(194,201,187,0.4)",
          boxShadow: "0 2px 12px rgba(21,66,18,0.04)",
        }}
      >
        <div className="flex items-center gap-3 px-4 pt-4 pb-3">
          <Avatar
            src={displayUser.avatar}
            firstname={displayUser.firstname}
            size="md"
          />
          <button
            onClick={checkPublishingStatus}
            disabled={isCheckingStatus}
            className="flex-1 text-left px-4 py-2.5 rounded-full text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              background: "rgba(249,250,242,0.8)",
              border: "1px solid rgba(194,201,187,0.4)",
              color: "#72796e",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) => {
              if (!isCheckingStatus) {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(188,240,174,0.2)";
                (e.currentTarget as HTMLElement).style.borderColor =
                  "rgba(161,212,148,0.5)";
              }
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(249,250,242,0.8)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(194,201,187,0.4)";
            }}
          >
            {isCheckingStatus ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                Vérification...
              </span>
            ) : (
              `Quoi de neuf, ${displayUser.firstname} ?`
            )}
          </button>
        </div>

        <div
          className="flex items-center px-2 pb-2"
          style={{ borderTop: "1px solid rgba(194,201,187,0.25)" }}
        >
          <button
            onClick={() => {
              checkPublishingStatus();
              setTimeout(() => fileRef.current?.click(), 80);
            }}
            className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-150"
            style={{ color: "#42493e" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(188,240,174,0.2)";
              (e.currentTarget as HTMLElement).style.color = "#2d5a27";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#42493e";
            }}
          >
            <ImageIcon className="w-4 h-4" strokeWidth={1.5} />
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Photo / Vidéo
            </span>
          </button>

          <div
            className="w-px h-4"
            style={{ background: "rgba(194,201,187,0.5)" }}
          />

          <button
            onClick={checkPublishingStatus}
            className="flex flex-1 items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-150"
            style={{ color: "#42493e" }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(244,187,146,0.2)";
              (e.currentTarget as HTMLElement).style.color = "#805533";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#42493e";
            }}
          >
            <FileText className="w-4 h-4" strokeWidth={1.5} />
            <span
              className="text-xs font-semibold"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Article
            </span>
          </button>
        </div>
      </div>

      {/* ── Modal de création ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: "rgba(15,25,12,0.6)",
            backdropFilter: "blur(8px)",
          }}
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-hidden flex flex-col max-h-[90vh]"
            style={{
              background: "rgba(249,250,242,0.98)",
              backdropFilter: "blur(24px)",
              border: "1px solid rgba(194,201,187,0.5)",
              boxShadow: "0 24px 60px rgba(21,66,18,0.2)",
              animation: "groSlideUp 0.25s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header modal */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{
                borderBottom: "1px solid rgba(194,201,187,0.35)",
                background:
                  "linear-gradient(135deg, rgba(188,240,174,0.2) 0%, transparent 100%)",
              }}
            >
              <h2
                className="text-sm font-bold"
                style={{
                  color: "#154212",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                Créer une publication
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all duration-150"
                style={{
                  background: "rgba(194,201,187,0.3)",
                  color: "#42493e",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(194,201,187,0.5)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(194,201,187,0.3)")
                }
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body modal */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {/* Auteur */}
              <div className="flex items-center gap-3">
                <Avatar
                  src={displayUser.avatar}
                  firstname={displayUser.firstname}
                  size="md"
                />
                <div>
                  <p
                    className="text-sm font-semibold"
                    style={{
                      color: "#191c18",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {displayUser.firstname} {displayUser.lastname}
                  </p>
                  <div
                    className="mt-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5"
                    style={{
                      background: "rgba(45,90,39,0.1)",
                      border: "1px solid rgba(45,90,39,0.2)",
                    }}
                  >
                    <Globe
                      className="w-3 h-3"
                      style={{ color: "#2d5a27" }}
                      strokeWidth={1.5}
                    />
                    <span
                      className="text-[10px] font-semibold"
                      style={{ color: "#2d5a27" }}
                    >
                      Public
                    </span>
                  </div>
                </div>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Quoi de neuf, ${displayUser.firstname} ?`}
                autoFocus
                rows={3}
                maxLength={10000}
                className="w-full resize-none outline-none text-sm leading-relaxed min-h-[88px] bg-transparent"
                style={{ color: "#191c18", fontFamily: "'Inter', sans-serif" }}
              />

              {/* Médias */}
              {mediaItems.length > 0 && (
                <div className="space-y-2">
                  {/* Images en grille */}
                  {imageItems.length > 0 && (
                    <div className={`grid gap-1.5 ${gridCols}`}>
                      {mediaItems.map((item, i) => {
                        if (item.type !== "image") return null;
                        const displaySrc = item.edited ?? item.preview;
                        return (
                          <div
                            key={i}
                            className={`relative rounded-xl overflow-hidden group ${
                              imageItems.length === 3 && i === 0
                                ? "col-span-2"
                                : ""
                            }`}
                            style={{
                              aspectRatio:
                                imageItems.length === 1 ? "16/9" : "1/1",
                              border: "1px solid rgba(194,201,187,0.4)",
                            }}
                          >
                            <Image
                              src={displaySrc}
                              alt=""
                              fill
                              className="object-cover"
                              unoptimized
                            />

                            {item.edited && (
                              <div
                                className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(45,90,39,0.8)",
                                  backdropFilter: "blur(4px)",
                                }}
                              >
                                <Check
                                  className="w-2.5 h-2.5"
                                  style={{ color: "#bcf0ae" }}
                                />
                                <span
                                  className="text-[9px] font-semibold"
                                  style={{ color: "#bcf0ae" }}
                                >
                                  Modifié
                                </span>
                              </div>
                            )}

                            {/* Overlay hover : bouton crop */}
                            <div
                              className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                              style={{ background: "rgba(0,0,0,0.35)" }}
                            >
                              <button
                                onClick={() => setEditingIndex(i)}
                                className="w-8 h-8 flex items-center justify-center rounded-full"
                                style={{
                                  background: "rgba(255,255,255,0.9)",
                                  color: "#154212",
                                }}
                                title="Modifier l'image"
                              >
                                <Crop className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Bouton supprimer */}
                            <button
                              onClick={() => removeMedia(i)}
                              className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-white z-10 opacity-0 group-hover:opacity-100 transition-all"
                              style={{ background: "rgba(15,25,12,0.65)" }}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Vidéos */}
                  {mediaItems.map((item, i) =>
                    item.type === "video" ? (
                      <VideoPreview
                        key={i}
                        src={item.preview}
                        onRemove={() => removeMedia(i)}
                      />
                    ) : null,
                  )}
                </div>
              )}
            </div>

            {/* Footer modal */}
            <div
              className="flex items-center justify-between px-5 py-3.5"
              style={{
                borderTop: "1px solid rgba(194,201,187,0.35)",
                background:
                  "linear-gradient(135deg, transparent 0%, rgba(188,240,174,0.1) 100%)",
              }}
            >
              <div className="flex items-center gap-1">
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150"
                  style={{ color: "#42493e" }}
                  title="Ajouter photo ou vidéo"
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(188,240,174,0.3)";
                    (e.currentTarget as HTMLElement).style.color = "#2d5a27";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#42493e";
                  }}
                >
                  <ImageIcon className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-150"
                  style={{ color: "#42493e" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(244,187,146,0.3)";
                    (e.currentTarget as HTMLElement).style.color = "#805533";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.color = "#42493e";
                  }}
                >
                  <SmilePlus className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
              </div>

              <div className="flex items-center gap-3">
                {content.length > 0 && (
                  <span
                    className="text-xs tabular-nums"
                    style={{
                      color: remaining <= 50 ? "#ba1a1a" : "#72796e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {remaining}
                  </span>
                )}
                <button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold transition-all duration-200"
                  style={
                    canSubmit
                      ? {
                          background:
                            "linear-gradient(135deg, #3b6934 0%, #154212 100%)",
                          color: "#bcf0ae",
                          boxShadow: "0 4px 12px rgba(21,66,18,0.3)",
                          fontFamily: "'Inter', sans-serif",
                        }
                      : {
                          background: "rgba(194,201,187,0.35)",
                          color: "#72796e",
                          cursor: "not-allowed",
                          fontFamily: "'Inter', sans-serif",
                        }
                  }
                >
                  <Send className="w-3.5 h-3.5" strokeWidth={2} />
                  {createPost.isPending ? "Publication..." : "Publier"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de blocage ── */}
      {showBlockedModal && publishingStatus && (
        <BlockedModal
          publishingStatus={publishingStatus}
          onClose={() => setShowBlockedModal(false)}
          onRetry={handleRetry}
        />
      )}

      {/* ── Éditeur d'image (portal) ── */}
      {editingIndex !== null && mediaItems[editingIndex] && (
        <ImageEditor
          src={
            mediaItems[editingIndex].edited ?? mediaItems[editingIndex].preview
          }
          onConfirm={applyEdit}
          onCancel={() => setEditingIndex(null)}
        />
      )}

      <input
        ref={fileRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleFiles(e.target.files)}
        className="hidden"
      />

      <style jsx global>{`
        @keyframes groSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}

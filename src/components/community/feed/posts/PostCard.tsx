/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Share,
  Copy,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ImageIcon,
  Loader2,
} from "lucide-react";

import { Avatar } from "@/components/community/shared/Avatar";
import { TimeAgo } from "@/components/community/shared/TimeAgo";
import { PostActions } from "../PostActions";
import { CommentSection } from "../CommentSection";
import { Post } from "@/types/community.types";
import { useAuthStore } from "@/stores/auth.store";
import { useFeed } from "@/hooks/community/useFeed";
import toast from "react-hot-toast";

/* ─── Helpers ─── */
const getFullMediaUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  if (url.startsWith("/storage")) return `${apiUrl}${url}`;
  if (url.startsWith("/uploads")) return `${apiUrl}${url}`;
  return `${apiUrl}/${url}`;
};

const isVideoFile = (url: string): boolean =>
  [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"].some((ext) =>
    url.toLowerCase().includes(ext),
  );

const getMediaType = (url: string, mimeType?: string): "image" | "video" => {
  if (mimeType?.startsWith("video/")) return "video";
  if (isVideoFile(url)) return "video";
  return "image";
};

/* ─── ExpandableText ─── */
const LINE_CLAMP = 4;

function ExpandableText({ content }: { content: string }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [needsClamp, setNeedsClamp] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    el.style.webkitLineClamp = "unset";
    el.style.display = "block";
    const fullHeight = el.scrollHeight;

    el.style.webkitLineClamp = String(LINE_CLAMP);
    el.style.display = "-webkit-box";
    const clampedHeight = el.clientHeight;

    setNeedsClamp(fullHeight > clampedHeight + 2);
  }, [content]);

  if (!content) return null;

  return (
    <div className="pb-3">
      <div
        ref={innerRef}
        className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words overflow-hidden"
        style={
          isExpanded
            ? { display: "block" }
            : {
                display: "-webkit-box",
                WebkitLineClamp: LINE_CLAMP,
                WebkitBoxOrient: "vertical",
              }
        }
      >
        {content}
      </div>

      {needsClamp && (
        <button
          onClick={() => setIsExpanded((v) => !v)}
          className="mt-1.5 text-xs font-semibold text-green-950 hover:text-green-800 transition-colors"
          aria-label={isExpanded ? "Voir moins" : "Voir plus"}
        >
          {isExpanded ? "Voir moins" : "Voir plus"}
        </button>
      )}
    </div>
  );
}

/* ─── VideoPlayer ─── */
function VideoPlayer({
  src,
  poster,
  autoPlay = false,
  onPlay,
  onPause,
}: {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [autoPlay]);

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      onPause?.();
    } else {
      videoRef.current.play();
      onPlay?.();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    setVolume(v);
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(cur);
    setProgress((cur / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const t = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = t;
    setCurrentTime(t);
  };

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)}:${Math.floor(s % 60)
      .toString()
      .padStart(2, "0")}`;

  const handleFullscreen = () => videoRef.current?.requestFullscreen?.();

  const showControlsTemporarily = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (!isHovering) setShowControls(false);
    }, 2000);
  };

  return (
    <div
      className="relative group rounded-xl overflow-hidden bg-black"
      onMouseEnter={() => {
        setIsHovering(true);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
      }}
      onMouseMove={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        src={getFullMediaUrl(src)}
        poster={poster ? getFullMediaUrl(poster) : undefined}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        playsInline
      />

      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${
          showControls || !isPlaying
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-white text-xs tabular-nums">
            {formatTime(currentTime)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleSeek}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(to right, white 0%, white ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`,
            }}
          />
          <span className="text-white text-xs tabular-nums">
            {formatTime(duration)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition"
            aria-label={isPlaying ? "Mettre en pause" : "Lire"}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>
          <div className="flex items-center gap-2 group/volume">
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition"
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? (
                <VolumeX className="w-4 h-4 text-white" />
              ) : (
                <Volume2 className="w-4 h-4 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white opacity-0 group-hover/volume:opacity-100 transition-opacity"
              aria-label="Volume"
            />
          </div>
          <button
            onClick={handleFullscreen}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition ml-auto"
            aria-label="Plein écran"
          >
            <Maximize className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-md flex items-center justify-center transition hover:scale-110"
          aria-label="Lire la vidéo"
        >
          <Play className="w-7 h-7 text-white ml-1" />
        </button>
      )}
    </div>
  );
}

/* ─── MediaGrid ─── */
function MediaGrid({
  mediaItems,
  onMediaClick,
}: {
  mediaItems: Array<{ url: string; type?: string; mime_type?: string }>;
  onMediaClick: (index: number) => void;
}) {
  const mediaCount = mediaItems.length;
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  let gridClass = "";
  let mediaHeight = "";
  if (mediaCount === 1) {
    gridClass = "grid-cols-1";
    mediaHeight = "max-h-[400px]";
  } else if (mediaCount === 2) {
    gridClass = "grid-cols-2";
    mediaHeight = "h-[250px] md:h-[300px]";
  } else if (mediaCount === 3) {
    gridClass = "grid-cols-2";
    mediaHeight = "h-[200px] md:h-[250px]";
  } else if (mediaCount === 4) {
    gridClass = "grid-cols-2";
    mediaHeight = "h-[200px] md:h-[220px]";
  } else {
    gridClass = "grid-cols-3";
    mediaHeight = "h-[150px] md:h-[180px]";
  }

  const getImageLayout = (index: number) =>
    mediaCount === 3 && index === 0 ? "col-span-2" : "";

  const displayMedia = mediaCount > 6 ? mediaItems.slice(0, 5) : mediaItems;
  const remainingMedia = mediaCount - 5;

  const renderMediaItem = (item: (typeof mediaItems)[0], index: number) => {
    const mediaType = getMediaType(item.url, item.mime_type);
    const layout = getImageLayout(index);
    const fullUrl = getFullMediaUrl(item.url);

    if (mediaType === "video") {
      return (
        <div
          key={index}
          className={`relative cursor-pointer overflow-hidden rounded-xl bg-black ${layout} ${mediaHeight}`}
          onClick={() => onMediaClick(index)}
        >
          <VideoPlayer src={item.url} autoPlay={false} />
        </div>
      );
    }

    return (
      <div
        key={index}
        className={`relative bg-gray-100 cursor-pointer overflow-hidden rounded-xl group/image ${layout} ${mediaHeight}`}
        onClick={() => onMediaClick(index)}
      >
        {!imageErrors[index] ? (
          <div className="relative w-full h-full">
            <img
              src={fullUrl}
              alt={`Média ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
              onError={() => setImageErrors((p) => ({ ...p, [index]: true }))}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <ZoomIn className="w-8 h-8 text-white/80" />
            </div>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-gray-400">Image non disponible</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="pb-3">
      <div className={`grid ${gridClass} gap-2`}>
        {displayMedia.map((item, i) => renderMediaItem(item, i))}
        {remainingMedia > 0 && (
          <div
            className={`relative bg-gray-900/80 cursor-pointer overflow-hidden rounded-xl flex items-center justify-center ${mediaHeight}`}
            onClick={() => onMediaClick(5)}
          >
            <div className="text-center">
              <p className="text-white text-2xl font-bold">+{remainingMedia}</p>
              <p className="text-white/60 text-xs">médias supplémentaires</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── MediaViewerModal ─── */
function MediaViewerModal({
  mediaItems,
  initialIndex,
  onClose,
}: {
  mediaItems: Array<{ url: string; type?: string; mime_type?: string }>;
  initialIndex: number;
  onClose: () => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const currentMedia = mediaItems[currentIndex];
  const currentUrl = getFullMediaUrl(currentMedia.url);
  const isVideo =
    getMediaType(currentMedia.url, currentMedia.mime_type) === "video";

  const handleNext = () => {
    setCurrentIndex((p) => (p + 1) % mediaItems.length);
    setZoom(1);
    setRotation(0);
    setImgError(false);
  };
  const handlePrev = () => {
    setCurrentIndex((p) => (p - 1 + mediaItems.length) % mediaItems.length);
    setZoom(1);
    setRotation(0);
    setImgError(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(currentUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download =
        currentMedia.url.split("/").pop() || `media-${currentIndex + 1}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(currentUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Lien copié !");
    } catch {
      toast.error("Impossible de copier le lien");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "Média partagé", url: currentUrl });
      } catch {}
    } else handleCopyLink();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visionneuse de médias"
    >
      <div
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
          <span className="text-sm text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
            {currentIndex + 1} / {mediaItems.length}
          </span>
          <div className="flex items-center gap-2">
            {!isVideo && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
                  aria-label="Zoom arrière"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
                  aria-label="Zoom avant"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
                  aria-label="Rotation"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <div className="w-px h-6 bg-white/20" />
              </>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center disabled:opacity-50"
              aria-label="Télécharger"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={handleCopyLink}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
              aria-label="Copier le lien"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
              aria-label="Partager"
            >
              <Share className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-white/20" />
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
              aria-label="Fermer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          {isVideo ? (
            <div className="w-full max-w-5xl">
              <VideoPlayer src={currentMedia.url} autoPlay={true} />
            </div>
          ) : !imgError ? (
            <div
              className="transition-all duration-300"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                maxWidth: "90vw",
                maxHeight: "90vh",
              }}
            >
              <img
                src={currentUrl}
                alt={`Média ${currentIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onError={() => setImgError(true)}
              />
            </div>
          ) : (
            <div className="text-center text-white/60">
              <p className="text-lg mb-2">Média non disponible</p>
              <p className="text-sm">Le média n'a pas pu être chargé</p>
            </div>
          )}
        </div>

        {mediaItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
              aria-label="Précédent"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
              aria-label="Suivant"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-2">
              {mediaItems.map((item, idx) => {
                const isVid =
                  getMediaType(item.url, item.mime_type) === "video";
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setZoom(1);
                      setRotation(0);
                      setImgError(false);
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all flex-shrink-0 ${idx === currentIndex ? "ring-2 ring-green-950 scale-110" : "opacity-60 hover:opacity-100"}`}
                    aria-label={`Aller au média ${idx + 1}`}
                  >
                    {isVid ? (
                      <div className="w-full h-full bg-black flex items-center justify-center">
                        <Play className="w-4 h-4 text-white/60" />
                      </div>
                    ) : (
                      <img
                        src={getFullMediaUrl(item.url)}
                        alt={`Miniature ${idx + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://placehold.co/48x48?text=Error";
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── DeleteModal ─── */
function DeleteModal({
  onConfirm,
  onCancel,
  isPending,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Confirmation de suppression"
    >
      <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Supprimer le post
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Êtes-vous sûr de vouloir supprimer ce post ? Cette action est
          irréversible.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            aria-label="Annuler la suppression"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition"
            aria-label="Confirmer la suppression"
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── EditModal ─── */
function EditModal({
  post,
  onSave,
  onCancel,
  isPending,
}: {
  post: Post;
  onSave: (data: { content: string; media?: File[]; removeMedia?: string[] }) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [content, setContent] = useState(post?.content || "");
  const [newMedia, setNewMedia] = useState<File[]>([]);
  const [existingMedia, setExistingMedia] = useState<Array<{ url: string }>>(
    (post?.media_urls || []).map((url) => ({ url }))
  );
  const [mediaToRemove, setMediaToRemove] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onCancel]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const textarea = document.querySelector("textarea");
    if (textarea) {
      setTimeout(() => textarea.focus(), 100);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles: File[] = [];
    const invalidFiles: string[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push(`${file.name} (trop lourd, max 5Mo)`);
        return;
      }
      if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
        invalidFiles.push(`${file.name} (format non supporté)`);
        return;
      }
      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      toast.error(`Fichiers ignorés : ${invalidFiles.join(", ")}`);
    }

    if (validFiles.length > 0) {
      setNewMedia((prev) => [...prev, ...validFiles]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveNewMedia = (index: number) => {
    setNewMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingMedia = (url: string) => {
    setMediaToRemove((prev) => [...prev, url]);
    setExistingMedia((prev) => prev.filter((item) => item.url !== url));
  };

  const handleSave = () => {
    const trimmedContent = content?.trim() || "";
    
    if (!trimmedContent || trimmedContent === "undefined") {
      toast.error("Le contenu est obligatoire");
      return;
    }

    onSave({
      content: trimmedContent,
      media: newMedia.length > 0 ? newMedia : undefined,
      removeMedia: mediaToRemove.length > 0 ? mediaToRemove : undefined,
    });
  };

  useEffect(() => {
    return () => {
      newMedia.forEach((file) => {
        const preview = URL.createObjectURL(file);
        URL.revokeObjectURL(preview);
      });
    };
  }, [newMedia]);

  const totalMediaCount = existingMedia.length + newMedia.length;
  const maxMedia = 10;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Modifier le post"
    >
      <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Modifier le post
        </h3>

        <div className="mt-4">
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">
            Contenu *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-green-950/20 focus:border-green-950"
            rows={4}
            placeholder="Que voulez-vous dire ?"
            maxLength={20000}
          />
          <div className="mt-1 text-xs text-gray-400 text-right">
            {content.length} / 20000 caractères
          </div>
        </div>

        {existingMedia.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Médias existants ({existingMedia.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {existingMedia.map((item, index) => {
                const isVideo = getMediaType(item.url);
                const fullUrl = getFullMediaUrl(item.url);
                return (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square"
                  >
                    {isVideo === "video" ? (
                      <video
                        src={fullUrl}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={fullUrl}
                        alt={`Média ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Erreur de chargement de l'image:", fullUrl);
                          e.currentTarget.src = "https://placehold.co/200x200?text=Erreur";
                        }}
                      />
                    )}
                    <button
                      onClick={() => handleRemoveExistingMedia(item.url)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                      aria-label="Supprimer ce média"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1.5 py-0.5 truncate">
                      Média {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {newMedia.length > 0 && (
          <div className="mt-4">
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Nouveaux médias ({newMedia.length})
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {newMedia.map((file, index) => {
                const preview = URL.createObjectURL(file);
                return (
                  <div
                    key={index}
                    className="relative group rounded-lg overflow-hidden border-2 border-green-400 aspect-square"
                  >
                    {file.type.startsWith("video/") ? (
                      <video
                        src={preview}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <img
                        src={preview}
                        alt={`Nouveau média ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => handleRemoveNewMedia(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white hover:bg-red-600 transition flex items-center justify-center opacity-0 group-hover:opacity-100"
                      aria-label="Supprimer ce nouveau média"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-xs px-1.5 py-0.5 truncate">
                      Nouveau
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {totalMediaCount < maxMedia && (
          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-green-950 hover:text-green-950 transition flex items-center justify-center gap-2"
              type="button"
            >
              <ImageIcon className="w-4 h-4" />
              Ajouter des médias ({totalMediaCount}/{maxMedia})
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {mediaToRemove.length > 0 && (
          <div className="mt-2 text-xs text-red-500">
            {mediaToRemove.length} média(s) seront supprimés
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
            type="button"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isPending || !content?.trim() || content?.trim() === "undefined"}
            className="flex-1 px-4 py-2 bg-green-950 hover:bg-green-900 disabled:opacity-50 rounded-xl text-sm font-medium text-white transition flex items-center justify-center gap-2"
            type="button"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              "Enregistrer"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── PostCard ─── */
export function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();
  const { deletePost, updatePost, updatePostLoading } = useFeed();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = user?.id === post.author?.id;

  const mediaItems = (post.media_urls || []).map((url, index) => ({
    url
  }));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDelete = () =>
    deletePost.mutate(post.id, { onSuccess: () => setShowDeleteModal(false) });

  // ✅ Correction : handleSave prend un objet avec content, media, removeMedia
  const handleSave = (data: { content: string; media?: File[]; removeMedia?: string[] }) => {
    if (!updatePost) {
      toast.error("Erreur: service de mise à jour non disponible");
      return;
    }
    
    const contentToSend = data?.content?.trim() || "";
    
    if (!contentToSend || contentToSend === "undefined") {
      toast.error("Le contenu ne peut pas être vide");
      return;
    }
    
    // ✅ Appel correct avec id et data
    updatePost(
      { 
        id: post.id, 
        data: {
          content: contentToSend,
          media: data.media,
          removeMedia: data.removeMedia,
        }
      },
      {
        onSuccess: () => {
          setShowEditModal(false);
          toast.success("Post mis à jour !");
        },
        onError: (error: any) => {
          toast.error(error?.message || "Erreur lors de la mise à jour");
        },
      }
    );
  };

  const handleMediaClick = (index: number) => {
    setSelectedMediaIndex(index);
    setShowMediaViewer(true);
  };

  return (
    <>
      <div
        className="rounded-2xl overflow-hidden mx-auto w-full transition-all duration-300 hover:shadow-lg flex flex-col"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          border: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${post.author?.id}`}>
              <Avatar
                src={post.author.avatar}
                firstname={post.author?.firstname}
                size="md"
                className="ring-2 ring-green-300/50 flex-shrink-0"
              />
            </Link>
            <div>
              <Link
                href={`/profile/${post.author?.id}`}
                className="text-sm font-semibold text-gray-900 hover:text-gray-700 transition-colors"
              >
                {post.author?.firstname} {post.author?.lastname}
              </Link>
              <div className="flex items-center gap-1 mt-0.5">
                {post.author?.headline && (
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                    {post.author.headline}
                  </p>
                )}
                <span className="text-gray-300 text-xs">·</span>
                <TimeAgo date={post.created_at} className="text-gray-400" />
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu((v) => !v)}
                className="w-8 h-8 flex items-center justify-center rounded-full transition hover:bg-gray-100"
                aria-label="Menu"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>
              {showMenu && (
                <div className="absolute right-0 top-10 z-20 min-w-[150px] animate-slideDown rounded-xl border border-gray-100 bg-white p-1 shadow-sm">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowEditModal(true);
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
                      setShowDeleteModal(true);
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

        {/* Content */}
        <div className="flex-1 px-4">
          {post.content && <ExpandableText content={post.content} />}
          {mediaItems.length > 0 && (
            <MediaGrid
              mediaItems={mediaItems}
              onMediaClick={handleMediaClick}
            />
          )}

          {post.shared_post && (
            <div
              className="mb-3 rounded-xl p-3 cursor-pointer hover:bg-gray-50 transition"
              style={{
                background: "rgba(0,0,0,0.02)",
                border: "0.5px solid rgba(0,0,0,0.06)",
              }}
              onClick={() =>
                (window.location.href = `/community/post/${post.shared_post?.id}`)
              }
            >
              <div className="flex items-center gap-2 mb-2">
                <Avatar
                  src={post.shared_post.author?.avatar}
                  firstname={post.shared_post.author?.firstname}
                  size="xs"
                  className="ring-1 ring-green-300/30 flex-shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    {post.shared_post.author?.firstname}{" "}
                    {post.shared_post.author?.lastname}
                  </p>
                  <TimeAgo
                    date={post.shared_post.created_at}
                    className="text-gray-400 text-xs"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed break-words">
                {post.shared_post.content}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0">
          {(post.likes_count > 0 || post.comments_count > 0) && (
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}
            >
              {post.likes_count > 0 && (
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>{post.likes_count} j&apos;aime</span>
                </div>
              )}
              {post.comments_count > 0 && (
                <button
                  onClick={() => setShowComments((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition ml-auto"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>
                    {post.comments_count} commentaire
                    {post.comments_count > 1 ? "s" : ""}
                  </span>
                </button>
              )}
            </div>
          )}

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
          isPending={updatePostLoading || false}
        />
      )}
      {showMediaViewer && (
        <MediaViewerModal
          mediaItems={mediaItems}
          initialIndex={selectedMediaIndex}
          onClose={() => setShowMediaViewer(false)}
        />
      )}

      <style jsx global>{`
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
        .animate-slideDown {
          animation: slideDown 0.15s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.2s ease-out;
        }
      `}</style>
    </>
  );
}
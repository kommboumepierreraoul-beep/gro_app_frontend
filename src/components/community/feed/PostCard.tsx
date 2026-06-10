"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
  Globe,
  X,
  Check,
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
} from "lucide-react";

import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { PostActions } from "./PostActions";
import { CommentSection } from "./CommentSection";
import { Post } from "@/types/community.types";
import { useAuthStore } from "@/stores/auth.store";
import { useFeed } from "@/hooks/community/useFeed";
import toast from "react-hot-toast";

// Fonction utilitaire pour obtenir l'URL complète de l'image/vidéo
const getFullMediaUrl = (url: string): string => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/storage")) {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    return `${apiUrl}${url}`;
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  return `${apiUrl}/${url}`;
};

// Détecter si un fichier est une vidéo
const isVideoFile = (url: string): boolean => {
  const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some((ext) => lowerUrl.includes(ext));
};

// Détecter le type de média à partir de l'URL ou du MIME
const getMediaType = (url: string, mimeType?: string): "image" | "video" => {
  if (mimeType?.startsWith("video/")) return "video";
  if (isVideoFile(url)) return "video";
  return "image";
};

/* ─── Video Player Component ─── */
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
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Auto-play blocked:", err);
        setIsPlaying(false);
      });
    }
  }, [autoPlay]);

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
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const dur = videoRef.current.duration;
    setCurrentTime(current);
    setProgress((current / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    videoRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleFullscreen = () => {
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

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
        if (!showControlsTemporarily) setShowControls(false);
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

      {/* Custom Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${
          showControls || !isPlaying
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {/* Progress Bar */}
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
            className="flex-1 h-1 rounded-full bg-white/30 appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:cursor-pointer"
            style={{
              background: `linear-gradient(to right, white 0%, white ${progress}%, rgba(255,255,255,0.3) ${progress}%, rgba(255,255,255,0.3) 100%)`,
            }}
          />
          <span className="text-white text-xs tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition"
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
              className="w-20 h-1 rounded-full bg-white/30 appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white
                [&::-webkit-slider-thumb]:cursor-pointer opacity-0 group-hover/volume:opacity-100 transition-opacity"
            />
          </div>

          <button
            onClick={handleFullscreen}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition ml-auto"
          >
            <Maximize className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Central Play Button (visible when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white/30 hover:bg-white/40 backdrop-blur-md flex items-center justify-center transition transform hover:scale-110"
        >
          <Play className="w-7 h-7 text-white ml-1" />
        </button>
      )}
    </div>
  );
}

/* ─── Media Grid Component with Video Support ─── */
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
  } else if (mediaCount >= 5) {
    gridClass = "grid-cols-3";
    mediaHeight = "h-[150px] md:h-[180px]";
  }

  const getImageLayout = (index: number) => {
    if (mediaCount === 3 && index === 0) return "col-span-2";
    return "";
  };

  const displayMedia = mediaCount > 6 ? mediaItems.slice(0, 5) : mediaItems;
  const remainingMedia = mediaCount - 5;

  // Grouper les médias par type pour un meilleur affichage
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
          <VideoPlayer
            src={item.url}
            autoPlay={false}
            onPlay={() => console.log("Video playing")}
            onPause={() => console.log("Video paused")}
          />
        </div>
      );
    }

    // Image
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
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
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

/* ─── Modal Viewer with Video Support ─── */
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
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const currentMedia = mediaItems[currentIndex];
  const currentUrl = getFullMediaUrl(currentMedia.url);
  const isVideo =
    getMediaType(currentMedia.url, currentMedia.mime_type) === "video";

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
    setZoom(1);
    setRotation(0);
    setImgError(false);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + mediaItems.length) % mediaItems.length,
    );
    setZoom(1);
    setRotation(0);
    setImgError(false);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(currentUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const fileName =
        currentMedia.url.split("/").pop() || `media-${currentIndex + 1}`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erreur lors du téléchargement:", error);
      window.open(currentUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast.success("Lien copié dans le presse-papier !");
    } catch (error) {
      console.error("Erreur lors de la copie:", error);
      toast.error("Impossible de copier le lien");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Média partagé",
          url: currentUrl,
        });
      } catch (error) {
        console.error("Erreur de partage:", error);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.95)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Controls */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/80 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {mediaItems.length}
            </span>
            <span className="text-xs text-white/60 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {isVideo ? "🎬 Vidéo" : "🖼️ Image"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isVideo && (
              <>
                <button
                  onClick={() => setZoom((z) => Math.max(z - 0.25, 0.5))}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
                >
                  <ZoomOut className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setZoom((z) => Math.min(z + 0.25, 3))}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
                >
                  <ZoomIn className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
                >
                  <RotateCw className="w-4 h-4 mx-auto" />
                </button>
                <div className="w-px h-6 bg-white/20" />
              </>
            )}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all disabled:opacity-50"
            >
              {isDownloading ? (
                <div className="w-4 h-4 mx-auto border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4 mx-auto" />
              )}
            </button>
            <button
              onClick={handleCopyLink}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
            >
              <Copy className="w-4 h-4 mx-auto" />
            </button>
            <button
              onClick={handleShare}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
            >
              <Share className="w-4 h-4 mx-auto" />
            </button>
            <div className="w-px h-6 bg-white/20" />
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all"
            >
              <X className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>

        {/* Media Content */}
        <div className="flex-1 flex items-center justify-center overflow-hidden p-4">
          {isVideo ? (
            <div className="w-full max-w-5xl">
              <VideoPlayer
                src={currentMedia.url}
                autoPlay={true}
                onPlay={() => console.log("Video playing in modal")}
                onPause={() => console.log("Video paused in modal")}
              />
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
              <p className="text-lg mb-2">❌ Média non disponible</p>
              <p className="text-sm">Le média n'a pas pu être chargé</p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 transition-all flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Thumbnails */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0">
            <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-2">
              {mediaItems.map((item, idx) => {
                const isVideoItem =
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
                    className={`relative w-12 h-12 rounded-lg overflow-hidden transition-all flex-shrink-0 ${
                      idx === currentIndex
                        ? "ring-2 ring-emerald-500 scale-110"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    {isVideoItem ? (
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

// Le reste des modals (DeleteModal, EditModal) reste identique...
// DeleteModal et EditModal sont les mêmes que dans votre code original

/* ─── PostCard Principal (modifié) ─── */
export function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();
  const { deletePost, updatePost } = useFeed();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMediaViewer, setShowMediaViewer] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const isOwner = user?.id === post.author?.id;

  // Transformer media_urls en tableau d'objets avec métadonnées
  const mediaItems = (post.media_urls || []).map((url, index) => ({
    url,
    type: post.media_types?.[index] || (isVideoFile(url) ? "video" : "image"),
    mime_type: post.media_mime_types?.[index],
  }));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
        className="rounded-2xl overflow-hidden mx-auto w-full bg-white/80 transition-all duration-300 hover:shadow-lg flex flex-col"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          border: "0.5px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        }}
      >
        {/* Header (identique) */}
        <div className="flex items-start justify-between px-4 pt-4 pb-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href={`/community/profile/${post.author?.id}`}>
              <Avatar
                src={post.author?.avatar}
                firstname={post.author?.firstname}
                size="md"
                className="ring-2 ring-green-300/50 flex-shrink-0"
              />
            </Link>
            <div>
              <Link
                href={`/community/profile/${post.author?.id}`}
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
              >
                <MoreHorizontal className="w-4 h-4 text-gray-500" />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-10 rounded-2xl py-1 z-20 min-w-[150px] animate-slideDown"
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
                      setShowEditModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition rounded-xl"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition rounded-xl"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="flex-1 overflow-y-auto px-4">
          {post.content && (
            <div className="pb-3">
              <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
                {post.content}
              </p>
            </div>
          )}

          {/* Médias avec support vidéo */}
          {mediaItems.length > 0 && (
            <MediaGrid
              mediaItems={mediaItems}
              onMediaClick={handleMediaClick}
            />
          )}

          {/* Post partagé (identique) */}
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

        {/* Compteurs et actions (identique) */}
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

      {/* Modals */}
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
          mediaItems={mediaItems}
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

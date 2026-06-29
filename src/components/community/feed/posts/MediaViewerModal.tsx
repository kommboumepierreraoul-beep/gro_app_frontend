// components/community/posts/MediaViewerModal.tsx
import { useState } from "react";
import {
  X,
  Download,
  Copy,
  Share,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";
import { VideoPlayer } from "./VideoPlayer";
import { getFullMediaUrl, getMediaType } from "../shared/utils";
import toast from "react-hot-toast";

interface MediaItem {
  url: string;
  type?: string;
  mime_type?: string;
}

interface MediaViewerModalProps {
  mediaItems: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export function MediaViewerModal({
  mediaItems,
  initialIndex,
  onClose,
}: MediaViewerModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [imgError, setImgError] = useState(false);

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

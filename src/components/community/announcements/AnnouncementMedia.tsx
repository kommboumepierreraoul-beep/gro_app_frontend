// components/announcements/AnnouncementMedia.tsx
"use client";

import { useState } from "react";
import { Play, Pause, Volume2, VolumeX, Maximize, X } from "lucide-react";

// Fonction pour l'URL complète
const getFullMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (url.startsWith("http")) return url;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = url.startsWith("/") ? url : `/${url}`;
  return `${apiUrl}${cleanPath}`;
};

interface AnnouncementMediaProps {
  coverImage: string | null;
  mediaType: string | null;
  title: string;
}

export function AnnouncementMedia({
  coverImage,
  mediaType,
  title,
}: AnnouncementMediaProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!coverImage) return null;

  const mediaUrl = getFullMediaUrl(coverImage);
  const isVideo = mediaType === "video";

  if (isVideo) {
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

    const toggleMute = () => {
      if (videoRef.current) {
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
      }
    };

    const handleFullscreen = () => {
      if (videoRef.current) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen();
        }
      }
    };

    return (
      <div
        className="relative rounded-xl overflow-hidden mb-6 group bg-black"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        <video
          ref={videoRef}
          src={mediaUrl}
          poster={mediaUrl}
          className="w-full max-h-[500px] object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onClick={togglePlay}
          playsInline
        />

        {/* Contrôles vidéo personnalisés */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 transition-opacity duration-300 ${
            showControls ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="flex items-center justify-center gap-4">
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

            <button
              onClick={handleFullscreen}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition"
            >
              <Maximize className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>

        {/* Bouton play central */}
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

  // Image
  return (
    <div className="rounded-xl overflow-hidden mb-6 group">
      <img
        src={mediaUrl}
        alt={title}
        className="w-full h-auto object-cover max-h-[500px] transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
}

// Ajouter l'import manquant
import { useRef } from "react";

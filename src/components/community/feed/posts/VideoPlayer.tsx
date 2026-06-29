// components/community/posts/VideoPlayer.tsx
"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Loader2,
} from "lucide-react";

import { getFullMediaUrl, formatTime } from "../shared/utils";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
  fit?: "contain" | "cover";
}

export function VideoPlayer({
  src,
  poster,
  autoPlay = true,
  onPlay,
  onPause,
  className = "",
  fit = "cover",
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMoveRef = useRef(0);

  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false); // autoplay sans son
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showControls, setShowControls] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Autoplay
  useEffect(() => {
    const video = videoRef.current;

    if (!video || !autoPlay) return;

    video.muted = false;

    video
      .play()
      .then(() => {
        setIsPlaying(true);
      })
      .catch(() => {
        setIsPlaying(false);
      });
  }, [autoPlay]);

  const togglePlay = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
        onPlay?.();
      } else {
        video.pause();
        onPause?.();
      }
    } catch (error) {
      console.error("Video play error:", error);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);

    // remettre le volume si unmute
    if (!video.muted && video.volume === 0) {
      video.volume = volume || 0.5;
    }
  };

  const handleVolumeChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newVolume = parseFloat(e.target.value);

    setVolume(newVolume);

    const video = videoRef.current;

    if (!video) return;

    video.volume = newVolume;

    if (newVolume > 0) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;

    if (!video) return;

    const current = video.currentTime;
    const dur = video.duration || 0;

    setCurrentTime(current);
    setProgress(dur ? (current / dur) * 100 : 0);
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;

    if (!video) return;

    setDuration(video.duration || 0);
  };

  const handleSeek = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const video = videoRef.current;

    if (!video) return;

    const seekTime =
      (parseFloat(e.target.value) / 100) * duration;

    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleFullscreen = () => {
    const video = videoRef.current as any;

    if (!video) return;

    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitEnterFullscreen) {
      video.webkitEnterFullscreen();
    }
  };

  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (!isHovering) {
        setShowControls(false);
      }
    }, 2000);
  }, [isHovering]);

  // throttle mouse move
  const handleMouseMove = () => {
    const now = Date.now();

    if (now - lastMoveRef.current > 200) {
      showControlsTemporarily();
      lastMoveRef.current = now;
    }
  };

  return (
    <div
      className={`relative group rounded-xl overflow-hidden bg-black ${className}`}
      onMouseEnter={() => {
        setIsHovering(true);
        setShowControls(true);
      }}
      onMouseLeave={() => {
        setIsHovering(false);
        setShowControls(false);
      }}
      onMouseMove={handleMouseMove}
      onTouchStart={() => setShowControls(true)}
    >
      {/* Loading */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>
      )}

      {/* Error */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black text-white text-sm">
          Impossible de charger la vidéo
        </div>
      )}

      <video
        ref={videoRef}
        src={getFullMediaUrl(src)}
        poster={poster ? getFullMediaUrl(poster) : undefined}
        className={`w-full h-full object-${fit} cursor-pointer`}
        autoPlay={autoPlay}
        muted={isMuted}
        playsInline
        loop
        preload="metadata"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 transition-opacity duration-300 ${
          showControls || !isPlaying
            ? "opacity-100"
            : "opacity-0"
        }`}
      >
        {/* Progress */}
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
            aria-label="Video progress"
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-3
            [&::-webkit-slider-thumb]:h-3
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white"
            style={{
              background: `linear-gradient(
                to right,
                white 0%,
                white ${progress}%,
                rgba(255,255,255,0.3) ${progress}%,
                rgba(255,255,255,0.3) 100%
              )`,
            }}
          />

          <span className="text-white text-xs tabular-nums">
            {duration ? formatTime(duration) : "0:00"}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-3">
          {/* Play */}
          <button
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
            title={isPlaying ? "Pause" : "Play"}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-white" />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5" />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 group/volume">
            <button
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
              title={isMuted ? "Unmute" : "Mute"}
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
              aria-label="Volume"
              className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300
              h-1 rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white"
            />
          </div>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            aria-label="Fullscreen"
            title="Fullscreen"
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition ml-auto"
          >
            <Maximize className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Central Play */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          aria-label="Play video"
          title="Play video"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-14 h-14 rounded-full bg-white/30 hover:bg-white/40
          backdrop-blur-md flex items-center justify-center
          transition hover:scale-110"
        >
          <Play className="w-7 h-7 text-white ml-1" />
        </button>
      )}
    </div>
  );
}
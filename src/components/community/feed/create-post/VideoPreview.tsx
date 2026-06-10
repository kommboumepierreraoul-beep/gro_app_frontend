"use client";

import { X, Video } from "lucide-react";

interface VideoPreviewProps {
  src: string;
  onRemove: () => void;
}

export function VideoPreview({ src, onRemove }: VideoPreviewProps) {
  return (
    <div
      className="relative rounded-xl overflow-hidden"
      style={{
        border: "1px solid rgba(194,201,187,0.4)",
        background: "#0f0f0f",
      }}
    >
      {/* Badge vidéo */}
      <div
        className="absolute top-2 left-2 z-10 flex items-center gap-1 px-2 py-0.5 rounded-full"
        style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      >
        <Video className="w-3 h-3" style={{ color: "#bcf0ae" }} />
        <span
          className="text-[10px] font-semibold"
          style={{ color: "#bcf0ae" }}
        >
          Vidéo
        </span>
      </div>

      <video
        src={src}
        controls
        preload="metadata"
        className="w-full rounded-xl"
        style={{ maxHeight: "280px", display: "block" }}
      />

      <button
        onClick={onRemove}
        className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-white z-10"
        style={{ background: "rgba(15,25,12,0.65)" }}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

/* eslint-disable react/no-unescaped-entities */
// components/announcements/LikeButton.tsx
"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { useLikeAnnouncement } from "@/hooks/community/useAnnouncements";

interface LikeButtonProps {
  announcementId: number;
  initialIsLiked: boolean;
  initialLikesCount: number;
}

export function LikeButton({
  announcementId,
  initialIsLiked,
  initialLikesCount,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const toggleLike = useLikeAnnouncement();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));

    toggleLike.mutate(announcementId, {
      onError: () => {
        setIsLiked(isLiked);
        setLikesCount(likesCount);
      },
    });
  };

  const buttonStyle = {
    background: isLiked ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.05)",
    color: isLiked ? "#dc2626" : "#4b5563",
  };

  return (
    <button
      onClick={handleLike}
      disabled={toggleLike.isPending}
      className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-150"
      style={buttonStyle}
    >
      <Heart className="w-5 h-5" fill={isLiked ? "#dc2626" : "none"} />
      <span>J'aime</span>
      {likesCount > 0 && <span className="ml-1">({likesCount})</span>}
    </button>
  );
}

// components/community/posts/PostActionsBar.tsx
import { Heart, MessageCircle } from "lucide-react";

interface PostActionsBarProps {
  likesCount: number;
  commentsCount: number;
  onCommentsToggle: () => void;
}

export function PostActionsBar({
  likesCount,
  commentsCount,
  onCommentsToggle,
}: PostActionsBarProps) {
  if (likesCount === 0 && commentsCount === 0) return null;

  return (
    <div
      className="flex items-center justify-between px-4 py-2"
      style={{ borderTop: "0.5px solid rgba(0,0,0,0.06)" }}
    >
      {likesCount > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
          <span>{likesCount} j&apos;aime</span>
        </div>
      )}
      {commentsCount > 0 && (
        <button
          onClick={onCommentsToggle}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition ml-auto"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>
            {commentsCount} commentaire
            {commentsCount > 1 ? "s" : ""}
          </span>
        </button>
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { ThumbsUp, MessageCircle, Repeat2 } from "lucide-react";

import { Post } from "@/types/community.types";
import { useFeed } from "@/hooks/community/useFeed";
import { ShareModal } from "./ShareModal";

interface PostActionsProps {
  post: Post;
  onCommentClick: () => void;
}

export function PostActions({ post, onCommentClick }: PostActionsProps) {
  const { likePost } = useFeed();
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1 pt-2 border-t border-gray-50">
        {/* Like */}
        <button
          onClick={() => likePost.mutate(post.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium transition ${
            post.is_liked
              ? "text-blue-600 bg-blue-50 hover:bg-blue-100"
              : "text-gray-500 hover:bg-gray-50"
          }`}
        >
          <ThumbsUp
            size={18}
            className={`transition-transform ${
              post.is_liked ? "fill-blue-600 scale-110" : ""
            }`}
          />

          <span>
            {post.likes_count > 0 ? post.likes_count : ""} J&apos;aime
          </span>
        </button>

        {/* Commentaire */}
        <button
          onClick={onCommentClick}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
        >
          <MessageCircle size={18} />

          <span>
            {post.comments_count > 0 ? post.comments_count : ""} Commenter
          </span>
        </button>

        {/* Partage */}
        <button
          onClick={() => setShareOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition"
        >
          <Repeat2 size={18} />

          <span>{post.shares_count > 0 ? post.shares_count : ""} Partager</span>
        </button>
      </div>

      {shareOpen && (
        <ShareModal post={post} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}

/* eslint-disable react/no-unescaped-entities */
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

  const btnBase: React.CSSProperties = {
    display: "flex",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: "'Inter', sans-serif",
    transition: "all 0.15s ease",
    cursor: "pointer",
    border: "none",
    background: "transparent",
  };

  return (
    <>
      <div className="flex items-center w-full gap-1 p-1.5">
        {/* Like */}
        <button
          onClick={() => likePost.mutate(post.id)}
          style={{
            ...btnBase,
            color: post.is_liked ? "#ba1a1a" : "#42493e",
            background: post.is_liked
              ? "rgba(186,26,26,0.08)"
              : "transparent",
          }}
          onMouseEnter={(e) => {
            if (!post.is_liked)
              (e.currentTarget as HTMLElement).style.background =
                "rgba(186,26,26,0.06)";
          }}
          onMouseLeave={(e) => {
            if (!post.is_liked)
              (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        >
          <ThumbsUp
            size={16}
            style={{
              fill: post.is_liked ? "#ba1a1a" : "none",
              transition: "all 0.2s",
            }}
          />
          <span>
            {post.likes_count > 0 && (
              <span className="mr-1">{post.likes_count}</span>
            )}
            J'aime
          </span>
        </button>

        {/* Commenter */}
        <button
          onClick={onCommentClick}
          style={{ ...btnBase, color: "#42493e" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(188,240,174,0.25)";
            (e.currentTarget as HTMLElement).style.color = "#2d5a27";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#42493e";
          }}
        >
          <MessageCircle size={16} />
          <span>
            {post.comments_count > 0 && (
              <span className="mr-1">{post.comments_count}</span>
            )}
            Commenter
          </span>
        </button>

        {/* Partager */}
        <button
          onClick={() => setShareOpen(true)}
          style={{ ...btnBase, color: "#42493e" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background =
              "rgba(188,240,174,0.25)";
            (e.currentTarget as HTMLElement).style.color = "#2d5a27";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "#42493e";
          }}
        >
          <Repeat2 size={16} />
          <span>
            {post.shares_count > 0 && (
              <span className="mr-1">{post.shares_count}</span>
            )}
            Partager
          </span>
        </button>
      </div>

      {shareOpen && (
        <ShareModal post={post} onClose={() => setShareOpen(false)} />
      )}
    </>
  );
}
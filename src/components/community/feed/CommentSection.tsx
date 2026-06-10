"use client";

import { useState } from "react";
import {
  Send,
  X,
  Heart,
  Reply,
  Trash2,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
} from "lucide-react";

import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { useAuthStore } from "@/stores/auth.store";
import { useComments } from "@/hooks/community/useComment";
import { Comment } from "@/types/community.types";

export function CommentSection({ postId }: { postId: number }) {
  const { user } = useAuthStore();
  const { comments, isLoading, addComment, deleteComment, likeComment } =
    useComments(postId);

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(
    null,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await addComment.mutateAsync({ content: text, parentId: replyTo?.id });
    setText("");
    setReplyTo(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3 animate-pulse">
            <div
              className="w-10 h-10 rounded-full flex-shrink-0"
              style={{ background: "rgba(188,240,174,0.4)" }}
            />
            <div className="flex-1 space-y-2">
              <div
                className="h-3 rounded-full w-1/3"
                style={{ background: "rgba(188,240,174,0.3)" }}
              />
              <div
                className="h-2 rounded-full w-3/4"
                style={{ background: "rgba(194,201,187,0.25)" }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="flex items-start gap-3">
        <Avatar
          src={user?.avatar}
          firstname={user?.firstname}
          size="sm"
          className="flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          {replyTo && (
            <div
              className="flex items-center gap-2 mb-2 text-xs rounded-full px-3 py-1.5 inline-flex"
              style={{ background: "rgba(45,90,39,0.08)", color: "#2d5a27" }}
            >
              <Reply size={12} />
              <span style={{ fontFamily: "'Inter', sans-serif" }}>
                Réponse à {replyTo.name}
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="ml-1 transition-opacity hover:opacity-60"
                style={{ color: "#72796e" }}
              >
                <X size={12} />
              </button>
            </div>
          )}
          <div
            className="flex items-center gap-2 rounded-full px-4 py-2 transition-all duration-150"
            style={{
              background: "rgba(249,250,242,0.8)",
              border: "1px solid rgba(194,201,187,0.45)",
            }}
            onFocusCapture={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(45,90,39,0.4)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 0 0 3px rgba(188,240,174,0.2)";
            }}
            onBlurCapture={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(194,201,187,0.45)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                replyTo
                  ? `Répondre à ${replyTo.name}...`
                  : "Écrire un commentaire..."
              }
              className="flex-1 bg-transparent outline-none text-sm"
              style={{
                color: "#191c18",
                fontFamily: "'Inter', sans-serif",
              }}
            />
            <button
              type="submit"
              disabled={!text.trim() || addComment.isPending}
              className="transition-all duration-200 disabled:opacity-30"
              style={{ color: "#2d5a27" }}
            >
              {addComment.isPending ? (
                <div
                  className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
                  style={{
                    borderColor: "rgba(45,90,39,0.3)",
                    borderTopColor: "transparent",
                  }}
                />
              ) : (
                <Send size={17} />
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Liste des commentaires */}
      <div className="space-y-4 max-h-[500px] overflow-y-auto gro-scrollbar pr-1">
        {comments.map((comment: Comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onReply={() =>
              setReplyTo({ id: comment.id, name: comment.author.firstname })
            }
            onDelete={() => deleteComment.mutate(comment.id)}
            onLike={() => likeComment.mutate(comment.id)}
            currentUserId={user?.id}
          />
        ))}

        {comments.length === 0 && (
          <div className="text-center py-8">
            <p
              className="text-sm"
              style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            >
              Aucun commentaire pour le moment
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "#c2c9bb", fontFamily: "'Inter', sans-serif" }}
            >
              Soyez le premier à commenter !
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        .gro-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .gro-scrollbar::-webkit-scrollbar-track {
          background: rgba(194, 201, 187, 0.15);
          border-radius: 10px;
        }
        .gro-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 90, 39, 0.25);
          border-radius: 10px;
        }
        .gro-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(45, 90, 39, 0.4);
        }
      `}</style>
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  onDelete,
  onLike,
  currentUserId,
}: {
  comment: Comment;
  onReply: () => void;
  onDelete: () => void;
  onLike: () => void;
  currentUserId?: number;
}) {
  const [showReplies, setShowReplies] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = currentUserId === comment.author.id;

  return (
    <div className="flex gap-3 group">
      <Avatar
        src={comment.author.avatar}
        firstname={comment.author.firstname}
        size="sm"
        className="flex-shrink-0"
      />

      <div className="flex-1 min-w-0">
        {/* Bulle */}
        <div
          className="rounded-2xl rounded-tl-md px-4 py-2.5"
          style={{
            background: "rgba(249,250,242,0.8)",
            border: "1px solid rgba(194,201,187,0.35)",
          }}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <p
                className="text-sm font-semibold"
                style={{
                  color: "#191c18",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {comment.author.firstname} {comment.author.lastname}
              </p>
              {comment.author.headline && (
                <span
                  className="text-xs hidden sm:inline"
                  style={{ color: "#72796e" }}
                >
                  · {comment.author.headline}
                </span>
              )}
            </div>

            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full"
                  style={{ color: "#72796e" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(194,201,187,0.3)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
                >
                  <MoreHorizontal size={14} />
                </button>

                {showMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMenu(false)}
                    />
                    <div
                      className="absolute right-0 top-5 z-20 rounded-xl py-1 min-w-[120px]"
                      style={{
                        background: "rgba(249,250,242,0.98)",
                        border: "1px solid rgba(194,201,187,0.45)",
                        boxShadow: "0 8px 24px rgba(21,66,18,0.1)",
                        animation: "groSlideDown 0.15s ease-out",
                      }}
                    >
                      <button
                        onClick={() => {
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-all duration-150"
                        style={{ color: "#ba1a1a" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "rgba(186,26,26,0.06)")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLElement).style.background =
                            "transparent")
                        }
                      >
                        <Trash2 size={12} />
                        Supprimer
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <p
            className="text-sm mt-1 leading-relaxed break-words"
            style={{ color: "#42493e", fontFamily: "'Inter', sans-serif" }}
          >
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1 ml-2 flex-wrap">
          <button
            onClick={onLike}
            className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-150"
            style={{
              color: comment.is_liked ? "#ba1a1a" : "#72796e",
              fontFamily: "'Inter', sans-serif",
            }}
          >
            <Heart
              size={12}
              style={{
                fill: comment.is_liked ? "#ba1a1a" : "none",
                transition: "all 0.2s",
              }}
            />
            <span>
              {comment.likes_count > 0 && `${comment.likes_count} `}
              J'aime
            </span>
          </button>

          <button
            onClick={onReply}
            className="flex items-center gap-1.5 text-xs font-semibold transition-all duration-150"
            style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#2d5a27")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.color = "#72796e")
            }
          >
            <Reply size={12} />
            Répondre
          </button>

          <TimeAgo
            date={comment.created_at}
            className="text-xs"
            style={{ color: "#c2c9bb" }}
          />
        </div>

        {/* Toggle réponses */}
        {comment.replies && comment.replies.length > 0 && (
          <button
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1.5 text-xs font-semibold ml-1 mt-2 transition-all duration-150"
            style={{ color: "#2d5a27", fontFamily: "'Inter', sans-serif" }}
          >
            {showReplies ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            <span>
              {showReplies
                ? "Masquer les réponses"
                : `Voir ${comment.replies.length} réponse${comment.replies.length > 1 ? "s" : ""}`}
            </span>
          </button>
        )}

        {/* Réponses */}
        {showReplies &&
          comment.replies?.map((reply) => (
            <div
              key={reply.id}
              className="flex gap-3 mt-3 ml-4 pl-2"
              style={{ borderLeft: "2px solid rgba(194,201,187,0.4)" }}
            >
              <Avatar
                src={reply.author.avatar}
                firstname={reply.author.firstname}
                size="xs"
                className="flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div
                  className="rounded-2xl rounded-tl-md px-3 py-2"
                  style={{
                    background: "rgba(249,250,242,0.6)",
                    border: "1px solid rgba(194,201,187,0.3)",
                  }}
                >
                  <p
                    className="text-xs font-semibold"
                    style={{
                      color: "#191c18",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {reply.author.firstname} {reply.author.lastname}
                  </p>
                  <p
                    className="text-xs mt-0.5 break-words"
                    style={{
                      color: "#42493e",
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    {reply.content}
                  </p>
                </div>
                <div className="flex items-center gap-3 mt-1 ml-1">
                  <TimeAgo
                    date={reply.created_at}
                    className="text-xs"
                    style={{ color: "#c2c9bb" }}
                  />
                  {currentUserId === reply.author.id && (
                    <button
                      className="text-xs font-semibold transition-colors"
                      style={{
                        color: "#ba1a1a",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      onClick={() => console.log("Delete reply", reply.id)}
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
      </div>

      <style jsx>{`
        @keyframes groSlideDown {
          from {
            opacity: 0;
            transform: translateY(-6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

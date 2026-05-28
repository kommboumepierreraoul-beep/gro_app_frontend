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
} from "lucide-react";

import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { useAuthStore } from "@/store/auth.store";
import { useComments } from "@/hooks/community/useComment";
import { Comment } from "@/types/community.types";

export function CommentSection({ postId }: { postId: number }) {
  const { user } = useAuthStore();

  const { comments, isLoading, addComment, deleteComment, likeComment } =
    useComments(postId);

  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    await addComment.mutateAsync({
      content: text,
      parentId: replyTo?.id,
    });

    setText("");
    setReplyTo(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex gap-3 p-3 animate-pulse"
          >
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />

            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-2 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 mt-3">
      {/* Champ de saisie */}
      <form
        onSubmit={handleSubmit}
        className="flex items-start gap-2"
      >
        <Avatar
          src={user?.avatar}
          firstname={user?.firstname}
          size="sm"
        />

        <div className="flex-1">
          {replyTo && (
            <div className="flex items-center gap-2 mb-2 text-xs text-blue-600">
              <Reply size={14} />

              <span>Réponse à {replyTo.name}</span>

              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={14} />
              </button>
            </div>
          )}

          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder={
                replyTo
                  ? `Répondre à ${replyTo.name}...`
                  : "Écrire un commentaire..."
              }
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
            />

            <button
              type="submit"
              disabled={!text.trim() || addComment.isPending}
              className="text-blue-600 disabled:opacity-30 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </form>

      {/* Liste commentaires */}
      {comments.map((comment: Comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onReply={() =>
            setReplyTo({
              id: comment.id,
              name: comment.author.firstname,
            })
          }
          onDelete={() => deleteComment.mutate(comment.id)}
          onLike={() => likeComment.mutate(comment.id)}
          currentUserId={user?.id}
        />
      ))}
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

  return (
    <div className="flex gap-2">
      <Avatar
        src={comment.author.avatar}
        firstname={comment.author.firstname}
        size="sm"
      />

      <div className="flex-1">
        <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
          <p className="text-xs font-semibold text-gray-900">
            {comment.author.firstname}{" "}
            {comment.author.lastname}
          </p>

          <p className="text-sm text-gray-800 mt-0.5">
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-1 ml-1 flex-wrap">
          <button
            onClick={onLike}
            className={`flex items-center gap-1 text-xs font-semibold transition ${
              comment.is_liked
                ? "text-blue-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Heart
              size={13}
              className={
                comment.is_liked
                  ? "fill-blue-600"
                  : ""
              }
            />

            <span>
              J&apos;aime{" "}
              {comment.likes_count > 0 &&
                `(${comment.likes_count})`}
            </span>
          </button>

          <button
            onClick={onReply}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-600 transition"
          >
            <Reply size={13} />
            Répondre
          </button>

          <TimeAgo date={comment.created_at} />

          {currentUserId === comment.author.id && (
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition"
            >
              <Trash2 size={13} />
              Supprimer
            </button>
          )}
        </div>

        {/* Bouton réponses */}
        {comment.replies &&
          comment.replies.length > 0 && (
            <button
              onClick={() =>
                setShowReplies(!showReplies)
              }
              className="flex items-center gap-1 text-xs text-blue-600 ml-1 mt-2 hover:underline"
            >
              {showReplies ? (
                <ChevronUp size={14} />
              ) : (
                <ChevronDown size={14} />
              )}

              <span>
                {showReplies
                  ? "Masquer les réponses"
                  : `Voir ${comment.replies.length} réponse(s)`}
              </span>
            </button>
          )}

        {/* Réponses */}
        {showReplies &&
          comment.replies?.map((reply) => (
            <div
              key={reply.id}
              className="flex gap-2 mt-3 ml-2"
            >
              <Avatar
                src={reply.author.avatar}
                firstname={reply.author.firstname}
                size="xs"
              />

              <div className="flex-1">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2">
                  <p className="text-xs font-semibold text-gray-900">
                    {reply.author.firstname}{" "}
                    {reply.author.lastname}
                  </p>

                  <p className="text-sm text-gray-800 mt-0.5">
                    {reply.content}
                  </p>
                </div>

                <TimeAgo
                  date={reply.created_at}
                  className="ml-1 mt-1"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
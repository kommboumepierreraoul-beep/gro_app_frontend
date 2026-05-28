"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Heart,
  MessageCircle,
} from "lucide-react";

import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { PostActions } from "./PostActions";
import { CommentSection } from "./CommentSection";
import { Post } from "@/types/community.types";
import { useAuthStore } from "@/store/auth.store";
import { useFeed } from "@/hooks/community/useFeed";

export function PostCard({ post }: { post: Post }) {
  const { user } = useAuthStore();
  const { deletePost } = useFeed();

  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.id === post.author.id;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.author.id}`}>
            <Avatar
              src={post.author.avatar}
              firstname={post.author.firstname}
              size="md"
            />
          </Link>

          <div>
            <Link
              href={`/profile/${post.author.id}`}
              className="font-semibold text-sm text-gray-900 hover:text-blue-600 transition block"
            >
              {post.author.firstname} {post.author.lastname}
            </Link>

            <div className="flex items-center gap-1">
              {post.author.headline && (
                <p className="text-xs text-gray-400">{post.author.headline}</p>
              )}

              <span className="text-gray-300 text-xs">·</span>

              <TimeAgo date={post.created_at} />
            </div>
          </div>
        </div>

        {/* Menu contextuel */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500"
            >
              <MoreHorizontal size={18} />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-2xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                <button className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition">
                  <Pencil size={16} />
                  Modifier
                </button>

                <button
                  onClick={() => {
                    deletePost.mutate(post.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <Trash2 size={16} />
                  Supprimer
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Contenu */}
      <div className="px-4 pb-3">
        <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>
      </div>

      {/* Médias */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div
          className={`grid gap-0.5 ${
            post.media_urls.length > 1 ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {post.media_urls.map((url, i) => (
            <div key={i} className="relative aspect-video bg-gray-100">
              <Image src={url} alt="" fill className="object-cover" />
            </div>
          ))}
        </div>
      )}

      {/* Post partagé */}
      {post.shared_post && (
        <div className="mx-4 mb-3 border border-gray-200 rounded-xl p-3 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <Avatar
              src={post.shared_post.author.avatar}
              firstname={post.shared_post.author.firstname}
              size="xs"
            />

            <div>
              <p className="text-xs font-semibold text-gray-800">
                {post.shared_post.author.firstname}{" "}
                {post.shared_post.author.lastname}
              </p>

              <TimeAgo date={post.shared_post.created_at} />
            </div>
          </div>

          <p className="text-sm text-gray-700 line-clamp-3">
            {post.shared_post.content}
          </p>
        </div>
      )}

      {/* Compteurs */}
      {(post.likes_count > 0 || post.comments_count > 0) && (
        <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-500 border-t border-gray-50">
          {post.likes_count > 0 && (
            <div className="flex items-center gap-1">
              <Heart size={14} className="fill-red-500 text-red-500" />

              <span>{post.likes_count} j&apos;aime</span>
            </div>
          )}

          {post.comments_count > 0 && (
            <button
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1 hover:text-gray-700 transition"
            >
              <MessageCircle size={14} />

              <span>{post.comments_count} commentaire(s)</span>
            </button>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 pb-2">
        <PostActions
          post={post}
          onCommentClick={() => setShowComments(!showComments)}
        />
      </div>

      {/* Section commentaires */}
      {showComments && (
        <div className="px-4 pb-4 border-t border-gray-50 pt-3">
          <CommentSection postId={post.id} />
        </div>
      )}
    </div>
  );
}

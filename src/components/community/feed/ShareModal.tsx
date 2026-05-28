"use client";
import { useState } from "react";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { Post } from "@/types/community.types";
import { postService } from "@/services/community/post.service";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import toast from "react-hot-toast";

interface ShareModalProps {
  post: Post;
  onClose: () => void;
}

export function ShareModal({ post, onClose }: ShareModalProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      await postService.sharePost(post.id, text);
      queryClient.invalidateQueries({ queryKey: ["feed"] });
      toast.success("Publication partagée !");
      onClose();
    } catch {
      toast.error("Erreur lors du partage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Partager la publication</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} firstname={user?.firstname} size="md" />
            <div>
              <p className="text-sm font-semibold text-gray-900">
                {user?.firstname} {user?.lastname}
              </p>
              <p className="text-xs text-gray-400">Partage public</p>
            </div>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Dites quelque chose à propos de cette publication..."
            rows={3}
            className="w-full resize-none outline-none text-sm text-gray-800 placeholder-gray-300"
          />

          {/* Aperçu du post original */}
          <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
            <div className="flex items-center gap-2 mb-2">
              <Avatar
                src={post.author.avatar}
                firstname={post.author.firstname}
                size="xs"
              />
              <div>
                <p className="text-xs font-semibold text-gray-800">
                  {post.author.firstname} {post.author.lastname}
                </p>
                <TimeAgo date={post.created_at} />
              </div>
            </div>
            <p className="text-sm text-gray-700 line-clamp-3">{post.content}</p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleShare}
            disabled={loading}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition text-sm"
          >
            {loading ? "Partage..." : "Partager maintenant"}
          </button>
        </div>
      </div>
    </div>
  );
}

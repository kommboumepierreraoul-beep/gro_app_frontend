// components/community/posts/PostContent.tsx
import Link from "next/link";
import { Avatar } from "../../shared/Avatar";
import { TimeAgo } from "../../shared/TimeAgo";
import { MediaGrid } from "./MediaGrid";
import { getFullMediaUrl, isVideoFile } from "../shared/utils";
import { Post } from "@/types/community.types";

interface PostContentProps {
  post: Post;
  onMediaClick: (index: number) => void;
}

export function PostContent({ post, onMediaClick }: PostContentProps) {
  const mediaItems = (post.media_urls || []).map((url, index) => ({
    url,
    type: post.media_types?.[index] || (isVideoFile(url) ? "video" : "image"),
    mime_type: post.media_mime_types?.[index],
  }));

  return (
    <div className="flex-1 overflow-y-auto px-4">
      {post.content && (
        <div className="pb-3">
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed break-words">
            {post.content}
          </p>
        </div>
      )}

      {mediaItems.length > 0 && (
        <MediaGrid mediaItems={mediaItems} onMediaClick={onMediaClick} />
      )}

      {post.shared_post && (
        <div
          className="mb-3 rounded-xl p-3 cursor-pointer hover:bg-gray-50 transition"
          style={{
            background: "rgba(0,0,0,0.02)",
            border: "0.5px solid rgba(0,0,0,0.06)",
          }}
          onClick={() =>
            (window.location.href = `/community/post/${post.shared_post?.id}`)
          }
        >
          <div className="flex items-center gap-2 mb-2">
            <Avatar
              src={post.shared_post.author?.avatar}
              firstname={post.shared_post.author?.firstname}
              size="xs"
              className="ring-1 ring-green-300/30 flex-shrink-0"
            />
            <div>
              <p className="text-xs font-semibold text-gray-700">
                {post.shared_post.author?.firstname}{" "}
                {post.shared_post.author?.lastname}
              </p>
              <TimeAgo
                date={post.shared_post.created_at}
                className="text-gray-400 text-xs"
              />
            </div>
          </div>
          <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed break-words">
            {post.shared_post.content}
          </p>
        </div>
      )}
    </div>
  );
}

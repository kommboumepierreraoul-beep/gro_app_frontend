"use client";
import InfiniteScroll from "react-infinite-scroll-component";
import { Leaf, Sparkles } from "lucide-react";
import { PostCard } from "./posts/PostCard";
import { CreatePostCard } from "./create-post/CreatePostCard";
import { useFeed } from "@/hooks/community/useFeed";

function PostSkeleton() {
  return (
    <div
      className="rounded-2xl p-4 animate-pulse"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(194,201,187,0.35)",
      }}
    >
      <div className="flex gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full flex-shrink-0"
          style={{ background: "rgba(188,240,174,0.4)" }}
        />
        <div className="flex-1 space-y-2 pt-1">
          <div
            className="h-3 rounded-full w-1/3"
            style={{ background: "rgba(188,240,174,0.35)" }}
          />
          <div
            className="h-2 rounded-full w-1/4"
            style={{ background: "rgba(194,201,187,0.3)" }}
          />
        </div>
      </div>
      <div className="space-y-2">
        <div
          className="h-3 rounded-full"
          style={{ background: "rgba(194,201,187,0.25)" }}
        />
        <div
          className="h-3 rounded-full w-5/6"
          style={{ background: "rgba(194,201,187,0.2)" }}
        />
        <div
          className="h-3 rounded-full w-3/4"
          style={{ background: "rgba(194,201,187,0.15)" }}
        />
      </div>
    </div>
  );
}

export function Feed() {
  const { posts, isLoading, hasNextPage, fetchNextPage } = useFeed();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <CreatePostCard />
        {[1, 2, 3].map((i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3 bg-white/80">
      <CreatePostCard />

      {posts.length === 0 ? (
        <div
          className="rounded-2xl p-12 text-center"
          style={{
            background: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(194,201,187,0.35)",
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
            style={{
              background:
                "linear-gradient(135deg, rgba(188,240,174,0.4) 0%, rgba(244,187,146,0.2) 100%)",
            }}
          >
            <Leaf
              className="w-5 h-5"
              style={{ color: "#2d5a27" }}
              strokeWidth={1.5}
            />
          </div>
          <p
            className="font-semibold"
            style={{
              color: "#191c18",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Votre fil est vide
          </p>
          <p className="text-sm mt-1" style={{ color: "#72796e" }}>
            Suivez des personnes pour voir leurs publications ici.
          </p>
        </div>
      ) : (
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={
            <div className="space-y-3 pt-1">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          }
          endMessage={
            <div className="flex flex-col items-center gap-2 py-8">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(188,240,174,0.4) 0%, rgba(244,187,146,0.2) 100%)",
                }}
              >
                <Sparkles
                  className="w-4 h-4"
                  style={{ color: "#805533" }}
                  strokeWidth={1.5}
                />
              </div>
              <p
                className="text-sm font-semibold"
                style={{ color: "#42493e", fontFamily: "'Inter', sans-serif" }}
              >
                Vous êtes à jour !
              </p>
              <p
                className="text-xs text-center max-w-[220px]"
                style={{ color: "#72796e" }}
              >
                De nouvelles publications apparaîtront ici dès que la communauté
                partage du contenu.
              </p>
            </div>
          }
          className="space-y-3"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </InfiniteScroll>
      )}
    </div>
  );
}

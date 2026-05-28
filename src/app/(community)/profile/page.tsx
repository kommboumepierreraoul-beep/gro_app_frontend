/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import { ProfileHeader } from "@/components/community/profile/ProfileHeader";
import { PostCard } from "@/components/community/feed/PostCard";

export default function MyProfilePage() {
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
  });

  const { data: postsData, isLoading: loadingPosts } = useQuery({
    queryKey: ["userPosts", profile?.id],
    queryFn: () => postService.getPost(profile!.id),
    enabled: !!profile?.id,
  });

  // ✅ SAFE DATA (IMPORTANT FIX)
  const posts = Array.isArray(postsData?.data) ? postsData.data : [];

  if (loadingProfile) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl h-64 animate-pulse" />
        <div className="bg-white rounded-2xl h-32 animate-pulse" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-4">
      {/* HEADER PROFILE */}
      <ProfileHeader profile={profile} />

      {/* POSTS SECTION */}
      <div>
        <h2 className="text-sm font-bold text-gray-700 mb-3 px-1">
          Publications
        </h2>

        {loadingPosts ? (
          <div className="bg-white rounded-2xl h-32 animate-pulse" />
        ) : posts.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-400 shadow-sm border border-gray-100">
            <p className="text-3xl mb-2">📝</p>
            <p className="text-sm">Aucune publication pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post: any) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

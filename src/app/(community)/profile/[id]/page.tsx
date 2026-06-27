/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";

import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";

import { ProfileHeader } from "@/components/community/profile/ProfileHeader";
import { PostCard } from "@/components/community/feed/PostCard";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);

  // PROFILE
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileService.getProfile(userId),
    enabled: !!userId,
  });

  // POSTS
  const { data: posts = [] } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      const res = await postService.getPost(userId);

      // 🔥 NORMALISATION SAFE (évite ton erreur map)
      return (
        res?.data?.data ??
        res?.data?.posts ??
        res?.data ??
        []
      );
    },
    enabled: !!profile,
  });

  // LOADING PROFILE
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl h-64 animate-pulse" />
    );
  }

  // ERROR / NOT FOUND
  if (isError || !profile) {
    return (
      <p className="text-center text-gray-400 py-10">
        Utilisateur introuvable.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {/* HEADER PROFIL */}
      <ProfileHeader profile={profile} />

      {/* POSTS */}
      <div className="space-y-4">
        {Array.isArray(posts) && posts.length > 0 ? (
          posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))
        ) : (
          <p className="text-center text-gray-400 py-6">
            Aucun post pour cet utilisateur.
          </p>
        )}
      </div>
    </div>
  );
}
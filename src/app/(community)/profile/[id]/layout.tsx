/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";

import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";

import { ProfileHeader } from "@/components/community/profile/ProfileHeader";
import { PostCard } from "@/components/community/feed/posts/PostCard";
import { FileText, Share2, Heart } from "lucide-react";

type TabType = "publications" | "partages" | "likes";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);

  const [activeTab, setActiveTab] = useState<TabType>("publications");

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

  // PUBLICATIONS
  const { data: postsData } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      const res = await postService.getPost(userId);
      return res?.data?.data ?? res?.data?.posts ?? res?.data ?? [];
    },
    enabled: !!profile && activeTab === "publications",
  });

  // SHARED
  const { data: sharedData } = useQuery({
    queryKey: ["userSharedPosts", userId],
    queryFn: () => postService.getUserSharedPosts(userId),
    enabled: !!profile && activeTab === "partages",
  });

  // LIKES
  const { data: likedData } = useQuery({
    queryKey: ["userLikedPosts", userId],
    queryFn: () => postService.getUserLikedPosts(userId),
    enabled: !!profile && activeTab === "likes",
  });

  // SAFE DATA EXTRACTION
  const posts = Array.isArray(postsData?.data)
    ? postsData.data
    : Array.isArray(postsData)
      ? postsData
      : [];
  const shared = Array.isArray(sharedData?.data)
    ? sharedData.data
    : Array.isArray(sharedData)
      ? sharedData
      : [];
  const liked = Array.isArray(likedData?.data)
    ? likedData.data
    : Array.isArray(likedData)
      ? likedData
      : [];

  // LOADING PROFILE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-4">
            <div className="h-64 bg-white animate-pulse rounded-2xl shadow-sm border border-gray-100" />
          </div>
        </div>
      </div>
    );
  }

  // ERROR / NOT FOUND
  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-400">Utilisateur introuvable.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "publications", label: "Publications", icon: FileText },
    { id: "partages", label: "Partages", icon: Share2 },
    { id: "likes", label: "J'aime", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4">
          {/* HEADER PROFIL */}
          <ProfileHeader profile={profile} />

          {/* TABS & CONTENT */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* TABS */}
            <div className="flex gap-2 border-b border-gray-100 px-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 py-3 px-4 border-b-2 transition whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-green-950 text-green-950"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-sm font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* CONTENT */}
            <div className="p-4 sm:p-6">
              {/* PUBLICATIONS */}
              {activeTab === "publications" && (
                <div className="divide-y divide-gray-100">
                  {posts.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      Aucune publication
                    </p>
                  ) : (
                    posts.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {/* PARTAGES */}
              {activeTab === "partages" && (
                <div className="divide-y divide-gray-100">
                  {shared.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      Aucun partage
                    </p>
                  ) : (
                    shared.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {/* LIKES */}
              {activeTab === "likes" && (
                <div className="divide-y divide-gray-100">
                  {liked.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">Aucun like</p>
                  ) : (
                    liked.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

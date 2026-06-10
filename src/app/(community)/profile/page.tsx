/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { MessageCircle, Users, FileText, Share2, Heart } from "lucide-react";

import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import { followService } from "@/services/community/follow.service";
import { messageService } from "@/services/community/message.service";

import { ProfileHeader } from "@/components/community/profile/ProfileHeader";
import { PostCard } from "@/components/community/feed/PostCard";
import { Avatar } from "@/components/community/shared/Avatar";

type TabType = "publications" | "partages" | "likes" | "abonnes";

interface Follower {
  id: number;
  follower_id: number;
  following_id: number;
  follower?: {
    id: number;
    firstname: string;
    lastname: string;
    avatar: string | null;
    email: string;
    profile?: {
      avatar_url?: string;
      headline?: string;
    };
  };
}

export default function MyProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("publications");
  const [selectedFollowers, setSelectedFollowers] = useState<number[]>([]);

  /* ---------------- PROFILE ---------------- */
  const { data: profile, isLoading } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
  });

  /* ---------------- POSTS ---------------- */
  const { data: postsData } = useQuery({
    queryKey: ["userPosts", profile?.id],
    queryFn: () => postService.getUserPosts(profile!.id),
    enabled: !!profile?.id && activeTab === "publications",
  });

  /* ---------------- SHARED ---------------- */
  const { data: sharedData } = useQuery({
    queryKey: ["userSharedPosts", profile?.id],
    queryFn: () => postService.getUserSharedPosts(profile!.id),
    enabled: !!profile?.id && activeTab === "partages",
  });

  /* ---------------- LIKES ---------------- */
  const { data: likedData } = useQuery({
    queryKey: ["userLikedPosts", profile?.id],
    queryFn: () => postService.getUserLikedPosts(profile!.id),
    enabled: !!profile?.id && activeTab === "likes",
  });

  /* ---------------- FOLLOWERS ---------------- */
  const { data: followersData, isLoading: loadingFollowers } = useQuery({
    queryKey: ["followers", profile?.id],
    queryFn: () => followService.getFollowers(profile!.id),
    enabled: !!profile?.id && activeTab === "abonnes",
  });

  /* ---------------- SAFE DATA EXTRACTION ---------------- */
  const posts = Array.isArray(postsData?.data) ? postsData.data : [];
  const shared = Array.isArray(sharedData?.data) ? sharedData.data : [];
  const liked = Array.isArray(likedData?.data) ? likedData.data : [];

  // 🔥 CORRECTION IMPORTANTE: Extraire correctement les followers
  let followers: Follower[] = [];

  if (followersData?.data) {
    if (Array.isArray(followersData.data)) {
      followers = followersData.data;
    } else if (
      followersData.data.data &&
      Array.isArray(followersData.data.data)
    ) {
      followers = followersData.data.data;
    } else if (
      followersData.data.followers &&
      Array.isArray(followersData.data.followers)
    ) {
      followers = followersData.data.followers;
    }
  }

  console.log("Followers extraits:", followers);

  /* ---------------- ACTIONS ---------------- */
  const handleStartConversation = async (follower: any) => {
    try {
      const userId = follower.follower_id || follower.id;
      const conversation =
        await messageService.createOrFindConversation(userId);
      router.push(`/community/messages/${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSelectFollower = (id: number) => {
    setSelectedFollowers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleCreateGroup = async () => {
    if (selectedFollowers.length < 1) return;

    const name = window.prompt("Nom du groupe :");
    if (!name) return;

    try {
      const conversation = await messageService.createGroupConversation(
        selectedFollowers,
        name,
      );

      setSelectedFollowers([]);
      router.push(`/community/messages/${conversation.id}`);
    } catch (error) {
      alert("Impossible de créer le groupe.");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-64 bg-white animate-pulse rounded-2xl" />
      </div>
    );
  }

  if (!profile) return null;

  const tabs = [
    { id: "publications", label: "Publications", icon: FileText },
    { id: "partages", label: "Partages", icon: Share2 },
    { id: "likes", label: "J'aime", icon: Heart },
    { id: "abonnes", label: "Abonnés", icon: Users },
  ];

  return (
    <div className="space-y-4">
      <ProfileHeader profile={profile} />

      {/* TABS */}
      <div className="flex gap-2 border-b bg-white px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 transition ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
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
      <div className="bg-white rounded-2xl shadow-sm">
        {/* POSTS */}
        {activeTab === "publications" && (
          <div className="divide-y divide-gray-100">
            {posts.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                Aucune publication
              </p>
            ) : (
              posts.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {/* SHARED */}
        {activeTab === "partages" && (
          <div className="divide-y divide-gray-100">
            {shared.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun partage</p>
            ) : (
              shared.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {/* LIKES */}
        {activeTab === "likes" && (
          <div className="divide-y divide-gray-100">
            {liked.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun like</p>
            ) : (
              liked.map((post: any) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}

        {/* FOLLOWERS - CORRIGÉ */}
        {activeTab === "abonnes" && (
          <div className="p-4">
            {loadingFollowers ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : followers.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Aucun abonné</p>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">
                      {followers.length}
                    </span>{" "}
                    abonné(s)
                  </p>

                  <button
                    onClick={handleCreateGroup}
                    disabled={selectedFollowers.length < 1}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition"
                  >
                    Créer un groupe ({selectedFollowers.length})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {followers.map((follower: any) => {
                    // Extraire les données du follower
                    const userData = follower.follower || follower;
                    const userId = follower.follower_id || follower.id;
                    const userName = userData?.firstname || "Utilisateur";
                    const userLastname = userData?.lastname || "";
                    const userAvatar =
                      userData?.avatar || userData?.profile?.avatar_url;
                    const userHeadline = userData?.profile?.headline;

                    return (
                      <div
                        key={follower.id}
                        className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedFollowers.includes(userId)}
                            onChange={() => toggleSelectFollower(userId)}
                            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />

                          <Avatar
                            src={userAvatar}
                            firstname={userName}
                            size="md"
                          />

                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {userName} {userLastname}
                            </p>
                            {userHeadline && (
                              <p className="text-xs text-gray-500">
                                {userHeadline}
                              </p>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartConversation(follower)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition rounded-full hover:bg-blue-50"
                          title="Envoyer un message"
                        >
                          <MessageCircle size={18} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

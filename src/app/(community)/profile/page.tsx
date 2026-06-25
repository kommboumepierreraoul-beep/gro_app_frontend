/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  MessageCircle,
  Users,
  FileText,
  Share2,
  Heart,
  MapPin,
  Link2,
  Briefcase,
  CheckCircle,
  Edit2,
  UserPlus,
} from "lucide-react";

import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import { followService } from "@/services/community/follow.service";
import { messageService } from "@/services/community/message.service";

import { ProfileHeader } from "@/components/community/profile/ProfileHeader";
import { PostCard } from "@/components/community/feed/posts/PostCard";
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
  const [bannerError, setBannerError] = useState(false);

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

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-4">
          <div className="h-64  animate-pulse rounded-2xl shadow-sm border border-gray-100" />
          <div className="h-12  animate-pulse rounded-2xl shadow-sm border border-gray-100" />
        </div>
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
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4">
          {/* ─── PROFILE CARD ─── */}
          <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Banner */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary to-tertiary">
              {(profile as any)?.banner && !bannerError ? (
                <img
                  src={(profile as any).banner}
                  alt="Bannière"
                  className="w-full h-full object-cover"
                  onError={() => setBannerError(true)}
                />
              ) : null}
            </div>

            {/* Avatar + identity */}
            <div className="px-4 sm:px-6 pb-5">
              {/* Avatar row */}
              <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
                <div className="relative">
                  <Avatar
                    src={profile?.avatar ?? null}
                    firstname={profile?.firstname}
                    size="xl"
                    className="ring-4 ring-white shadow-lg"
                  />
                </div>
                <button
                  onClick={() => router.push("/settings/profile")}
                  className="flex items-center gap-2 px-4 py-2 bg-green-950 hover:bg-green-900 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
                >
                  <Edit2 size={14} />
                  Modifier
                </button>
              </div>

              {/* Name + headline */}
              <h1 className="text-lg font-semibold text-gray-900">
                {profile.firstname} {profile.lastname}
              </h1>
              {(profile as any)?.headline && (
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="flex-shrink-0" />
                  {(profile as any).headline}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {(profile as any)?.location && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <MapPin size={12} />
                    {(profile as any).location}
                  </span>
                )}
                {(profile as any)?.website && (
                  <a
                    href={(profile as any).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Link2 size={12} />
                    {(profile as any).website.replace(/^https?:\/\//, "")}
                  </a>
                )}
              </div>

              {/* Bio */}
              {(profile as any)?.bio && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {(profile as any).bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                {[
                  {
                    label: "Publications",
                    value: (profile as any)?.posts_count ?? 0,
                  },
                  {
                    label: "Abonnés",
                    value: (profile as any)?.followers_count ?? 0,
                  },
                  {
                    label: "Abonnements",
                    value: (profile as any)?.following_count ?? 0,
                  },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-base font-semibold text-gray-900">
                      {value}
                    </p>
                    <p className="text-xs text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ─── TABS + CONTENT ─── */}
          <div className="rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                      activeTab === tab.id
                        ? "border-green-950 text-green-950"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 gap-2">
              {/* PUBLICATIONS */}
              {activeTab === "publications" && (
                <div className="divide-y ">
                  {posts.length === 0 ? (
                    <EmptyState label="Aucune publication" />
                  ) : (
                    posts.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {/* PARTAGES */}
              {activeTab === "partages" && (
                <div className="divide-y divide-gray-100 gap-2">
                  {shared.length === 0 ? (
                    <EmptyState label="Aucun partage" />
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
                    <EmptyState label="Aucun like" />
                  ) : (
                    liked.map((post: any) => (
                      <PostCard key={post.id} post={post} />
                    ))
                  )}
                </div>
              )}

              {/* ABONNÉS */}
              {activeTab === "abonnes" && (
                <div>
                  {loadingFollowers ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-950 border-t-transparent" />
                    </div>
                  ) : followers.length === 0 ? (
                    <EmptyState label="Aucun abonné" />
                  ) : (
                    <>
                      {/* Toolbar */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                        <p className="text-sm text-gray-500">
                          <span className="font-semibold text-gray-900">
                            {followers.length}
                          </span>{" "}
                          abonné(s)
                        </p>
                        <button
                          onClick={handleCreateGroup}
                          disabled={selectedFollowers.length < 1}
                          className="w-full sm:w-auto px-4 py-2 bg-green-950 hover:bg-green-900 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
                        >
                          Créer un groupe ({selectedFollowers.length})
                        </button>
                      </div>

                      {/* Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {followers.map((follower: any) => {
                          const userData = follower.follower || follower;
                          const userId = follower.follower_id || follower.id;
                          const userName = userData?.firstname || "Utilisateur";
                          const userLast = userData?.lastname || "";
                          const userAvatar =
                            userData?.avatar || userData?.profile?.avatar_url;
                          const userHead = userData?.profile?.headline;

                          return (
                            <div
                              key={follower.id}
                              className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={selectedFollowers.includes(userId)}
                                  onChange={() => toggleSelectFollower(userId)}
                                  className="w-4 h-4 rounded border-gray-300 accent-green-950"
                                />
                                <Avatar
                                  src={userAvatar}
                                  firstname={userName}
                                  size="md"
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">
                                    {userName} {userLast}
                                  </p>
                                  {userHead && (
                                    <p className="text-xs text-gray-400 truncate">
                                      {userHead}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <button
                                onClick={() =>
                                  handleStartConversation(follower)
                                }
                                className="p-2 rounded-full text-gray-400 hover:text-green-950 hover:bg-green-50 transition-colors flex-shrink-0"
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

          {/* ─── INFO BOX ─── */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-start gap-3">
              <CheckCircle
                size={16}
                className="text-primary flex-shrink-0 mt-0.5"
              />
              <p className="text-xs text-gray-500">
                Votre profil est visible par tous les membres de la communauté.
                Assurez-vous que les informations partagées sont conformes à nos
                conditions d'utilisation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared empty state ─── */
function EmptyState({ label }: { label: string }) {
  return <p className="text-gray-400 text-sm text-center py-10">{label}</p>;
}

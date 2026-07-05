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
      router.push(`/messages?id=${conversation.id}`);
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
      router.push(`/messages?id=${conversation.id}`);
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
          <div className="overflow-hidden rounded-2xl border border-[#c2c9bb]/30 bg-white shadow-sm">
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push("/messages")}
                    className="flex h-10 items-center gap-2 rounded-xl border border-[#c2c9bb]/35 bg-[#f3f4ed] px-3 text-sm font-semibold text-[#42493e] shadow-sm transition-colors hover:bg-[#e8eadf]"
                  >
                    <MessageCircle size={15} />
                    <span className="hidden sm:inline">Messages</span>
                  </button>
                  <button
                    onClick={() => router.push("/settings/profile")}
                    className="flex h-10 items-center gap-2 rounded-xl bg-[#31452d] px-4 text-sm font-semibold text-[#f3f7ee] shadow-sm transition-colors hover:bg-[#243420]"
                  >
                    <Edit2 size={14} />
                    Modifier
                  </button>
                </div>
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
          <div className="overflow-hidden rounded-2xl border border-[#c2c9bb]/30 bg-white shadow-sm">
            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-[#c2c9bb]/25 bg-[#f9faf2]/70 px-3">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 border-b-2 px-3 py-3.5 text-sm font-semibold whitespace-nowrap transition-all ${
                      activeTab === tab.id
                        ? "border-[#31452d] text-[#31452d]"
                        : "border-transparent text-[#72796e] hover:bg-[#f3f4ed] hover:text-[#191c18]"
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
                      <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-[#c2c9bb]/30 bg-[#f9faf2] p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-[#72796e]">
                          <span className="font-semibold text-[#191c18]">
                            {followers.length}
                          </span>{" "}
                          abonné(s)
                        </p>
                        <button
                          onClick={handleCreateGroup}
                          disabled={selectedFollowers.length < 1}
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#31452d] px-4 py-2.5 text-sm font-semibold text-[#f3f7ee] transition-colors hover:bg-[#243420] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                        >
                          Créer un groupe ({selectedFollowers.length})
                        </button>
                      </div>

                      {/* Grid */}
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                              className={`rounded-2xl border p-3 transition-all ${
                                selectedFollowers.includes(userId)
                                  ? "border-[#31452d]/30 bg-[#f3f4ed] shadow-sm"
                                  : "border-[#c2c9bb]/30 bg-white hover:border-[#31452d]/25 hover:bg-[#fbfcf7]"
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={selectedFollowers.includes(userId)}
                                  onChange={() => toggleSelectFollower(userId)}
                                  className="mt-2 h-4 w-4 rounded border-[#c2c9bb] accent-[#31452d]"
                                />
                                <button
                                  onClick={() => router.push(`/profile/${userId}`)}
                                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                                >
                                  <Avatar
                                    src={userAvatar}
                                    firstname={userName}
                                    size="md"
                                  />
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-[#191c18]">
                                      {userName} {userLast}
                                    </p>
                                    {userHead && (
                                      <p className="truncate text-xs text-[#72796e]">
                                        {userHead}
                                      </p>
                                    )}
                                  </div>
                                </button>
                              </div>
                              <div className="mt-3 flex items-center gap-2 pl-7">
                                <button
                                  onClick={() => handleStartConversation(follower)}
                                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#31452d] px-3 py-2 text-xs font-semibold text-[#f3f7ee] transition-colors hover:bg-[#243420]"
                                >
                                  <MessageCircle size={15} />
                                  Conversation
                                </button>
                                <button
                                  onClick={() => toggleSelectFollower(userId)}
                                  className="rounded-xl border border-[#c2c9bb]/40 bg-white px-3 py-2 text-xs font-semibold text-[#42493e] transition-colors hover:bg-[#f3f4ed]"
                                >
                                  {selectedFollowers.includes(userId)
                                    ? "Retirer"
                                    : "Groupe"}
                                </button>
                              </div>
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

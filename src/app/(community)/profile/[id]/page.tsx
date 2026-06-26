/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, use } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  FileText,
  Share2,
  Heart,
  MapPin,
  Link2,
  Briefcase,
  MessageCircle,
  UserPlus,
  UserCheck,
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle,
} from "lucide-react";

import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import { followService } from "@/services/community/follow.service";
import { messageService } from "@/services/community/message.service";

import { PostCard } from "@/components/community/feed/posts/PostCard";
import { Avatar } from "@/components/community/shared/Avatar";

type TabType = "publications" | "partages" | "likes";

export default function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const userId = Number(id);
  const router = useRouter();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>("publications");
  const [bannerError, setBannerError] = useState(false);

  /* ---------------- PROFILE ---------------- */
  const {
    data: profile,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["profile", userId],
    queryFn: () => profileService.getProfile(userId),
    enabled: !!userId,
  });

  /* ---------------- FOLLOW STATE ---------------- */
  const { data: followData } = useQuery({
    queryKey: ["followStatus", userId],
    queryFn: () => followService.getFollowing(userId),
    enabled: !!userId,
  });
  const isFollowing = followData?.is_following ?? false;

  const followMutation = useMutation({
    mutationFn: () =>
      isFollowing
        ? followService.unfollowUser(userId)
        : followService.followUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["followStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });

  /* ---------------- POSTS ---------------- */
  const { data: postsData } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      const res = await postService.getPost(userId);
      return res?.data?.data ?? res?.data?.posts ?? res?.data ?? [];
    },
    enabled: !!profile && activeTab === "publications",
  });

  /* ---------------- SHARED ---------------- */
  const { data: sharedData } = useQuery({
    queryKey: ["userSharedPosts", userId],
    queryFn: () => postService.getUserSharedPosts(userId),
    enabled: !!profile && activeTab === "partages",
  });

  /* ---------------- LIKES ---------------- */
  const { data: likedData } = useQuery({
    queryKey: ["userLikedPosts", userId],
    queryFn: () => postService.getUserLikedPosts(userId),
    enabled: !!profile && activeTab === "likes",
  });

  /* ---------------- SAFE DATA EXTRACTION ---------------- */
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

  /* ---------------- MESSAGE ---------------- */
  const handleMessage = async () => {
    try {
      const conversation =
        await messageService.createOrFindConversation(userId);
      router.push(`/community/messages/${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="space-y-4">
            <div className="h-8 w-32 bg-gray-200 rounded-xl animate-pulse" />
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 sm:h-40 bg-gradient-to-r from-gray-200 to-gray-100 animate-pulse" />
              <div className="px-4 sm:px-6 pb-5">
                <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-full ring-4 ring-white animate-pulse" />
                  <div className="flex gap-2">
                    <div className="w-20 h-9 bg-gray-200 rounded-xl animate-pulse" />
                    <div className="w-20 h-9 bg-gray-200 rounded-xl animate-pulse" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="flex gap-6 pt-2">
                    <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                    <div className="h-10 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- ERROR ---------------- */
  if (isError || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Utilisateur introuvable
            </h3>
            <p className="text-sm text-gray-500">
              L'utilisateur que vous recherchez n'existe pas ou a été supprimé.
            </p>
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
          {/* Back button - style édité */}
          <div className="mb-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-100 shadow-sm hover:bg-gray-50 transition-colors text-sm font-medium text-gray-600"
            >
              <ArrowLeft size={16} />
              Retour
            </button>
          </div>

          {/* ─── PROFILE CARD ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Banner - style édité */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-primary to-tertiary cursor-pointer group">
              {(profile as any)?.banner && !bannerError ? (
                <img
                  src={(profile as any).banner}
                  alt="Bannière"
                  className="w-full h-full object-cover"
                  onError={() => setBannerError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-green-700 to-green-800">
                  <span className="text-white/40 text-xs sm:text-sm font-medium">
                    {profile.firstname} {profile.lastname}
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <span className="text-white text-xs sm:text-sm font-semibold flex items-center gap-2 bg-black/50 px-4 py-2 rounded-full">
                  <Users size={14} />
                  Profil public
                </span>
              </div>
            </div>

            {/* Avatar + identity - style édité */}
            <div className="px-4 sm:px-6 pb-5">
              {/* Avatar row */}
              <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
                <Avatar
                  src={profile?.avatar ?? null}
                  firstname={profile?.firstname}
                  size="xl"
                  className="ring-4 ring-white shadow-lg"
                />

                {/* CTA buttons - style édité */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => followMutation.mutate()}
                    disabled={followMutation.isPending}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-colors shadow-sm ${
                      isFollowing
                        ? "bg-gray-100 hover:bg-gray-200 text-gray-700"
                        : "bg-green-950 hover:bg-green-900 text-white"
                    }`}
                  >
                    {followMutation.isPending ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isFollowing ? (
                      <UserCheck size={14} />
                    ) : (
                      <UserPlus size={14} />
                    )}
                    {isFollowing ? "Abonné" : "Suivre"}
                  </button>

                  <button
                    onClick={handleMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold rounded-xl transition-colors shadow-sm"
                  >
                    <MessageCircle size={14} />
                    Message
                  </button>
                </div>
              </div>

              {/* Name + headline - style édité */}
              <h1 className="text-lg font-semibold text-gray-900">
                {profile.firstname} {profile.lastname}
              </h1>
              {(profile as any)?.headline && (
                <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <Briefcase size={13} className="flex-shrink-0" />
                  {(profile as any).headline}
                </p>
              )}

              {/* Meta - style édité */}
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
                {(profile as any)?.created_at && (
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={12} />
                    Membre depuis{" "}
                    {new Date((profile as any).created_at).toLocaleDateString(
                      "fr-FR",
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                )}
              </div>

              {/* Bio - style édité */}
              {(profile as any)?.bio && (
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  {(profile as any).bio}
                </p>
              )}

              {/* Stats - style édité */}
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

              {/* Message informatif - style édité */}
              <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-start gap-2">
                  <CheckCircle
                    size={14}
                    className="text-primary flex-shrink-0 mt-0.5"
                  />
                  <p className="text-xs text-gray-500">
                    Profil public - Tous les membres peuvent voir ces
                    informations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── TABS + CONTENT ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Tabs - style édité */}
            <div className="flex border-b border-gray-100 px-4 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 py-3 px-4 border-b-2 transition-colors whitespace-nowrap text-sm font-medium ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Icon size={16} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content - style édité */}
            <div className="p-4 sm:p-6">
              {/* PUBLICATIONS */}
              {activeTab === "publications" && (
                <div className="divide-y divide-gray-100">
                  {posts.length === 0 ? (
                    <EmptyState
                      icon={<FileText size={32} className="text-gray-400" />}
                      title="Aucune publication"
                      description="Cet utilisateur n'a pas encore publié de contenu."
                    />
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
                    <EmptyState
                      icon={<Share2 size={32} className="text-gray-400" />}
                      title="Aucun partage"
                      description="Cet utilisateur n'a pas encore partagé de contenu."
                    />
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
                    <EmptyState
                      icon={<Heart size={32} className="text-gray-400" />}
                      title="Aucun like"
                      description="Cet utilisateur n'a pas encore aimé de contenu."
                    />
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

/* ─── Empty state amélioré ─── */
function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

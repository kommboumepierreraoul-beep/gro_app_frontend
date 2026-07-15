/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, use } from "react";
import { useQuery } from "@tanstack/react-query";
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
  Shield,
  Award,
  Edit3,
  Camera,
  MoreHorizontal,
  User,
} from "lucide-react";

import { profileService } from "@/services/community/profile.service";
import { postService } from "@/services/community/post.service";
import { messageService } from "@/services/community/message.service";
import { useFollow } from "@/hooks/community/useFollow";

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

  const {
    toggle: followMutation,
    isLoading: followLoading,
    isFollowing,
  } = useFollow(userId, Boolean(profile?.is_following));

  /* ---------------- POSTS ---------------- */
  const { data: postsData } = useQuery({
    queryKey: ["userPosts", userId],
    queryFn: async () => {
      const res = await postService.getUserPosts(userId);
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
      router.push(`/messages?id=${conversation.id}`);
    } catch (error) {
      console.error(error);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f9faf2]">
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
      <div className="min-h-screen bg-[#f9faf2]">
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
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="space-y-4">
          {/* ─── BACK BUTTON ─── */}
          <div className="mb-2">
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#c2c9bb]/30 shadow-sm hover:shadow-md hover:bg-[#f3f4ed] transition-all duration-200 text-sm font-medium text-[#42493e]"
            >
              <ArrowLeft size={16} strokeWidth={1.8} />
              Retour
            </button>
          </div>

          {/* ─── PROFILE CARD ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/20 overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Banner */}
            <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#154212] via-[#2d5a27] to-[#805533] cursor-pointer group">
              {(profile as any)?.banner && !bannerError ? (
                <img
                  src={(profile as any).banner}
                  alt="Bannière"
                  className="w-full h-full object-cover"
                  onError={() => setBannerError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-[#154212] via-[#2d5a27] to-[#805533]">
                  <span className="text-white/30 text-xs sm:text-sm font-medium tracking-wider uppercase">
                    {profile.firstname} {profile.lastname}
                  </span>
                </div>
              )}

              {/* Badge de statut */}
              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className="px-3 py-1.5 text-[10px] font-semibold text-white/90 bg-black/40 backdrop-blur-sm rounded-full flex items-center gap-1.5">
                  <Shield size={12} strokeWidth={2} />
                  Profil public
                </span>
              </div>
            </div>

            {/* Avatar + Identity */}
            <div className="px-4 sm:px-6 pb-5">
              {/* Avatar row */}
              <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
                <div className="relative">
                  <Avatar
                    src={profile?.avatar ?? null}
                    firstname={profile?.firstname}
                    size="xl"
                    className="ring-4 ring-white shadow-lg hover:ring-[#bcf0ae]/50 transition-all duration-300"
                  />
                  {(profile as any)?.is_verified && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#3b6934] rounded-full flex items-center justify-center border-2 border-white">
                      <CheckCircle
                        size={14}
                        className="text-[#bcf0ae]"
                        strokeWidth={2.5}
                      />
                    </div>
                  )}
                </div>

                {/* CTA buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => followMutation.mutate()}
                    disabled={followLoading}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-95 ${
                      isFollowing
                        ? "bg-[#f3f4ed] hover:bg-[#e7e9e1] text-[#42493e] border border-[#c2c9bb]/30"
                        : "bg-[#154212] hover:bg-[#2d5a27] text-[#bcf0ae] shadow-md hover:shadow-lg"
                    }`}
                  >
                    {followLoading ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : isFollowing ? (
                      <UserCheck size={14} strokeWidth={2} />
                    ) : (
                      <UserPlus size={14} strokeWidth={2} />
                    )}
                    {isFollowing ? "Abonné" : "Suivre"}
                  </button>

                  <button
                    onClick={handleMessage}
                    className="flex items-center gap-2 px-4 py-2 bg-[#f3f4ed] hover:bg-[#e7e9e1] text-[#42493e] text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm active:scale-95 border border-[#c2c9bb]/20"
                  >
                    <MessageCircle size={14} strokeWidth={1.8} />
                    <span className="hidden sm:inline">Message</span>
                  </button>

                  <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#f3f4ed] hover:bg-[#e7e9e1] transition-all duration-200 border border-[#c2c9bb]/20">
                    <MoreHorizontal
                      size={18}
                      strokeWidth={1.8}
                      className="text-[#72796e]"
                    />
                  </button>
                </div>
              </div>

              {/* Name + headline */}
              <h1 className="text-xl font-bold text-[#191c18] flex items-center gap-2">
                {profile.firstname} {profile.lastname}
                {(profile as any)?.role === "admin" && (
                  <span className="px-2 py-0.5 text-[9px] font-bold bg-[#805533] text-white rounded-full">
                    Admin
                  </span>
                )}
              </h1>
              {(profile as any)?.headline && (
                <p className="text-sm text-[#72796e] mt-0.5 flex items-center gap-1.5">
                  <Briefcase
                    size={13}
                    className="flex-shrink-0 text-[#72796e]"
                    strokeWidth={1.8}
                  />
                  {(profile as any).headline}
                </p>
              )}

              {/* Meta */}
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                {(profile as any)?.location && (
                  <span className="flex items-center gap-1 text-xs text-[#72796e]">
                    <MapPin
                      size={12}
                      className="text-[#72796e]"
                      strokeWidth={1.8}
                    />
                    {(profile as any).location}
                  </span>
                )}
                {(profile as any)?.website && (
                  <a
                    href={(profile as any).website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#2d5a27] hover:text-[#154212] transition-colors"
                  >
                    <Link2 size={12} strokeWidth={1.8} />
                    {(profile as any).website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                {(profile as any)?.created_at && (
                  <span className="flex items-center gap-1 text-xs text-[#72796e]">
                    <Calendar size={12} strokeWidth={1.8} />
                    Membre depuis{" "}
                    {new Date((profile as any).created_at).toLocaleDateString(
                      "fr-FR",
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                )}
              </div>

              {/* Bio */}
              {(profile as any)?.bio && (
                <p className="mt-3 text-sm text-[#42493e] leading-relaxed bg-[#f9faf2] p-3 rounded-xl border border-[#c2c9bb]/10">
                  {(profile as any).bio}
                </p>
              )}

              {/* Stats */}
              <div className="flex gap-8 mt-4 pt-4 border-t border-[#c2c9bb]/20">
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
                  <div
                    key={label}
                    className="group cursor-pointer hover:bg-[#f3f4ed] px-3 py-1.5 rounded-xl transition-colors -mx-3"
                  >
                    <p className="text-lg font-bold text-[#191c18] group-hover:text-[#154212] transition-colors">
                      {value}
                    </p>
                    <p className="text-xs text-[#72796e]">{label}</p>
                  </div>
                ))}
              </div>

              {/* Badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1.5 text-xs font-medium bg-[#eaf3de] text-[#154212] rounded-full flex items-center gap-1.5">
                  <Award size={12} strokeWidth={2} />
                  Membre actif
                </span>
                <span className="px-3 py-1.5 text-xs font-medium bg-[#f3f4ed] text-[#42493e] rounded-full flex items-center gap-1.5">
                  <CheckCircle size={12} strokeWidth={2} />
                  Compte vérifié
                </span>
              </div>

              {/* Message informatif */}
              <div className="mt-4 p-3 bg-[#f9faf2] rounded-xl border border-[#c2c9bb]/10">
                <div className="flex items-start gap-2">
                  <CheckCircle
                    size={14}
                    className="text-[#154212] flex-shrink-0 mt-0.5"
                    strokeWidth={2}
                  />
                  <p className="text-xs text-[#72796e]">
                    Profil public - Tous les membres peuvent voir ces
                    informations.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ─── TABS + CONTENT ─── */}
          <div className="bg-white rounded-2xl shadow-sm border border-[#c2c9bb]/20 overflow-hidden hover:shadow-md transition-shadow duration-300">
            {/* Tabs */}
            <div className="flex border-b border-[#c2c9bb]/20 px-4 overflow-x-auto bg-[#f9faf2]/50">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                const counts = {
                  publications: posts.length,
                  partages: shared.length,
                  likes: liked.length,
                };
                const count = counts[tab.id as keyof typeof counts] || 0;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 py-3.5 px-4 border-b-2 transition-all duration-200 whitespace-nowrap text-sm font-medium ${
                      isActive
                        ? "border-[#154212] text-[#154212]"
                        : "border-transparent text-[#72796e] hover:text-[#191c18] hover:bg-[#f3f4ed]/50"
                    }`}
                  >
                    <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                    {tab.label}
                    {count > 0 && (
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                          isActive
                            ? "bg-[#154212] text-[#bcf0ae]"
                            : "bg-[#f3f4ed] text-[#72796e]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* PUBLICATIONS */}
              {activeTab === "publications" && (
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <EmptyState
                      icon={
                        <FileText
                          size={32}
                          className="text-[#c2c9bb]"
                          strokeWidth={1.5}
                        />
                      }
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
                <div className="space-y-4">
                  {shared.length === 0 ? (
                    <EmptyState
                      icon={
                        <Share2
                          size={32}
                          className="text-[#c2c9bb]"
                          strokeWidth={1.5}
                        />
                      }
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
                <div className="space-y-4">
                  {liked.length === 0 ? (
                    <EmptyState
                      icon={
                        <Heart
                          size={32}
                          className="text-[#c2c9bb]"
                          strokeWidth={1.5}
                        />
                      }
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

/* ─── Empty state ─── */
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
      <div className="w-16 h-16 bg-[#f3f4ed] rounded-full flex items-center justify-center mb-4 border border-[#c2c9bb]/20">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-[#42493e] mb-1">{title}</h3>
      <p className="text-sm text-[#72796e] max-w-sm">{description}</p>
    </div>
  );
}

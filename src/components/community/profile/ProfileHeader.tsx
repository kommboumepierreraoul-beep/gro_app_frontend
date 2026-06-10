/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Image from "next/image";
import { Avatar } from "../shared/Avatar";
import { CommunityUser } from "@/types/community.types";
import { FollowButton } from "./FollowButton";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";

export function ProfileHeader({ profile }: { profile: CommunityUser }) {
  const { user } = useAuthStore();
  const isMe = user?.id === profile.id;
  const [bannerError, setBannerError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Bannière - CORRIGÉE */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
        {(profile as any).banner && !bannerError ? (
          <img
            src={(profile as any).banner}
            alt="Bannière"
            className="w-full h-full object-cover"
            onError={() => setBannerError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-white/50 text-sm">Aucune bannière</span>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Avatar + bouton */}
        <div className="flex items-end justify-between -mt-10 mb-4">
          <Avatar
            src={profile.avatar}
            firstname={profile.firstname}
            size="xl"
            className="ring-4 ring-white shadow-lg"
          />

          {isMe ? (
            <Link
              href="/settings/profile"
              className="px-4 py-2 rounded-xl border-2 border-gray-300 text-sm font-semibold text-gray-700 hover:border-gray-400 transition"
            >
              Modifier le profil
            </Link>
          ) : (
            <FollowButton
              userId={profile.id}
              isFollowing={profile.is_following}
            />
          )}
        </div>

        {/* Infos */}
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-gray-900">
            {profile.firstname} {profile.lastname}
          </h1>
          {(profile as any).headline && (
            <p className="text-gray-600 text-sm">{(profile as any).headline}</p>
          )}
          <div className="flex flex-wrap gap-3 text-xs text-gray-400 pt-1">
            {(profile as any).location && (
              <span className="flex items-center gap-1">
                📍 {(profile as any).location}
              </span>
            )}
            {(profile as any).website && (
              <a
                href={(profile as any).website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-blue-500 hover:underline"
              >
                🔗 {(profile as any).website}
              </a>
            )}
          </div>
          {(profile as any).bio && (
            <p className="text-sm text-gray-600 mt-2 leading-relaxed">
              {(profile as any).bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-6 mt-4 pt-4 border-t border-gray-50">
          {[
            { label: "Publications", value: profile.posts_count },
            { label: "Abonnés", value: profile.followers_count },
            { label: "Abonnements", value: profile.following_count },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

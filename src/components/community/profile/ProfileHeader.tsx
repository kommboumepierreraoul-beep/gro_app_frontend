/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import Image from "next/image";
import { Avatar } from "../shared/Avatar";
import { CommunityUser } from "@/types/community.types";
import { FollowButton } from "./FollowButton";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import {
  MapPin,
  Link2,
  Calendar,
  Briefcase,
  Edit3,
  Shield,
  Award,
  Users,
  FileText,
  UserPlus,
  CheckCircle,
  Camera,
} from "lucide-react";

export function ProfileHeader({ profile }: { profile: CommunityUser }) {
  const { user } = useAuthStore();
  const isMe = user?.id === profile.id;
  const [bannerError, setBannerError] = useState(false);

  return (
    <div className=" rounded-2xl shadow-sm border border-[#c2c9bb]/20 overflow-hidden hover:shadow-md transition-shadow duration-300">
      {/* Bannière */}
      <div className="relative h-32 sm:h-40 bg-gradient-to-r from-[#154212] via-[#2d5a27] to-[#805533] cursor-pointer group">
        {(profile as any).banner && !bannerError ? (
          <img
            src={(profile as any).banner}
            alt="Bannière"
            className="w-full h-full object-cover"
            onError={() => setBannerError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-r from-[#154212] via-[#2d5a27] to-[#805533]">
            <span className="text-white/20 text-xs sm:text-sm font-medium tracking-wider uppercase">
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

        {/* Icône caméra au survol */}
        {isMe && (
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
            <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
              <Camera size={16} className="text-white" strokeWidth={1.8} />
              <span className="text-white text-sm font-medium">
                Changer la bannière
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 sm:px-6 pb-5">
        {/* Avatar + bouton */}
        <div className="flex items-end justify-between -mt-10 sm:-mt-12 mb-3">
          <div className="relative">
            <Avatar
              src={profile.avatar}
              firstname={profile.firstname}
              size="xl"
              className="ring-4 ring-white shadow-lg hover:ring-[#bcf0ae]/50 transition-all duration-300"
            />
            {/* Badge de vérification */}
            {(profile as any).is_verified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#3b6934] rounded-full flex items-center justify-center border-2 border-white">
                <CheckCircle
                  size={14}
                  className="text-[#bcf0ae]"
                  strokeWidth={2.5}
                />
              </div>
            )}
          </div>

          {isMe ? (
            <Link
              href="/settings/profile"
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-[#f3f4ed] hover:bg-[#e7e9e1] text-[#42493e] transition-all duration-200 shadow-sm active:scale-95 border border-[#c2c9bb]/20"
            >
              <Edit3 size={14} strokeWidth={2} />
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
          <h1 className="text-xl font-bold text-[#191c18] flex items-center gap-2">
            {profile.firstname} {profile.lastname}
            {(profile as any).role === "admin" && (
              <span className="px-2 py-0.5 text-[9px] font-bold bg-[#805533] text-white rounded-full">
                Admin
              </span>
            )}
          </h1>

          {(profile as any).headline && (
            <p className="text-sm text-[#72796e] flex items-center gap-1.5">
              <Briefcase
                size={13}
                className="text-[#72796e]"
                strokeWidth={1.8}
              />
              {(profile as any).headline}
            </p>
          )}

          {/* Meta */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
            {(profile as any).location && (
              <span className="flex items-center gap-1 text-xs text-[#72796e]">
                <MapPin
                  size={12}
                  className="text-[#72796e]"
                  strokeWidth={1.8}
                />
                {(profile as any).location}
              </span>
            )}
            {(profile as any).website && (
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
            {(profile as any).created_at && (
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
          {(profile as any).bio && (
            <p className="mt-3 text-sm text-[#42493e] leading-relaxed bg-[#f9faf2] p-3 rounded-xl border border-[#c2c9bb]/10">
              {(profile as any).bio}
            </p>
          )}
        </div>

        {/* Stats */}
        <div className="flex gap-8 mt-4 pt-4 border-t border-[#c2c9bb]/20">
          {[
            {
              label: "Publications",
              value: profile.posts_count,
              icon: FileText,
            },
            { label: "Abonnés", value: profile.followers_count, icon: Users },
            {
              label: "Abonnements",
              value: profile.following_count,
              icon: UserPlus,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="group cursor-pointer hover:bg-[#f3f4ed] px-3 py-1.5 rounded-xl transition-colors -mx-3"
            >
              <p className="text-lg font-bold text-[#191c18] group-hover:text-[#154212] transition-colors">
                {stat.value}
              </p>
              <div className="flex items-center gap-1.5">
                <stat.icon
                  size={12}
                  className="text-[#72796e]"
                  strokeWidth={1.8}
                />
                <p className="text-xs text-[#72796e]">{stat.label}</p>
              </div>
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
      </div>
    </div>
  );
}

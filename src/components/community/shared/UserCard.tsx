/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { Avatar } from "./Avatar";
import { CommunityUser } from "@/types/community.types";
import { Users, MapPin, Briefcase } from "lucide-react";

interface UserCardProps {
  user: CommunityUser;
  extra?: React.ReactNode;
  variant?: "default" | "compact" | "detailed";
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
}

export function UserCard({
  user,
  extra,
  variant = "default",
  size = "md",
  showBadge = false,
}: UserCardProps) {
  const sizeClasses = {
    sm: {
      avatar: "sm",
      text: "text-xs",
      subtext: "text-[10px]",
      gap: "gap-2",
      padding: "p-2",
    },
    md: {
      avatar: "md",
      text: "text-sm",
      subtext: "text-xs",
      gap: "gap-3",
      padding: "p-3",
    },
    lg: {
      avatar: "lg",
      text: "text-base",
      subtext: "text-sm",
      gap: "gap-4",
      padding: "p-4",
    },
  };

  const isFollowing = user.is_following ?? false;

  return (
    <div
      className={`
        group flex items-center 
        ${sizeClasses[size].gap}
        ${sizeClasses[size].padding}
        rounded-2xl transition-all duration-200
        hover:bg-[#f3f4ed] hover:shadow-sm
        ${variant === "detailed" ? "border border-[#c2c9bb]/20" : ""}
        ${variant === "compact" ? "hover:bg-transparent" : ""}
      `}
    >
      {/* Avatar avec badge */}
      <div className="relative flex-shrink-0">
        <Link href={`/profile/${user.id}`}>
          <Avatar
            src={user.avatar}
            firstname={user.firstname}
            size={sizeClasses[size].avatar as any}
            className={`
              ring-2 ring-transparent transition-all duration-200
              group-hover:ring-[#bcf0ae]/30
              ${variant === "detailed" ? "ring-2 ring-[#bcf0ae]/20" : ""}
            `}
          />
        </Link>

        {/* Badge de statut (en ligne) */}
        {showBadge && user.is_me && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#154212] rounded-full border-2 border-white" />
        )}
        {showBadge && isFollowing && !user.is_me && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-[#bcf0ae] rounded-full border-2 border-white" />
        )}
      </div>

      {/* Informations */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/profile/${user.id}`}
            className={`
              font-semibold 
              ${sizeClasses[size].text}
              text-[#191c18]
              hover:text-[#2d5a27] transition-colors duration-200
              truncate block
            `}
          >
            {user.firstname} {user.lastname}
          </Link>

          {/* Badge "Vous" */}
          {user.is_me && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#bcf0ae]/30 text-[#154212] flex-shrink-0">
              Vous
            </span>
          )}

          {/* Badge rôle */}
          {user.role === "admin" && (
            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[#805533]/15 text-[#805533] flex-shrink-0">
              Admin
            </span>
          )}
        </div>

        {/* Headline avec icône */}
        {user.headline && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className={`text-[#72796e] ${sizeClasses[size].subtext} truncate`}
            >
              {user.headline}
            </span>
          </div>
        )}

        {/* Statistiques (version détaillée) */}
        {variant === "detailed" && (
          <div className="flex items-center gap-3 mt-1.5">
            {user.followers_count !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-[#72796e]" strokeWidth={1.5} />
                <span className="text-[10px] text-[#72796e]">
                  {user.followers_count} abonné
                  {user.followers_count > 1 ? "s" : ""}
                </span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#72796e]" strokeWidth={1.5} />
                <span className="text-[10px] text-[#72796e] truncate max-w-[80px]">
                  {user.location}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Extra (bouton follow, etc.) */}
      {extra && <div className="flex-shrink-0">{extra}</div>}
    </div>
  );
}

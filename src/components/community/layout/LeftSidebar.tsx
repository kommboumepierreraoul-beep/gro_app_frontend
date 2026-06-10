// components/community/LeftSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  MessageCircle,
  Bell,
  Megaphone,
  Users,
  Settings,
  Bot,
  Target,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { Avatar } from "../shared/Avatar";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/community/profile.service";
import { useCommunityStore } from "@/stores/community.store";

export function LeftSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const unreadNotifs = useCommunityStore((s) => s.unreadNotifs);
  const unreadMsgs = useCommunityStore((s) => s.unreadMessages);

  // Configuration optimisée pour le profil
  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
  });

  const getAvatarUrl = () => {
    if (!profile?.avatar && !user?.avatar) return undefined;

    const avatar = profile?.avatar ?? user?.avatar;

    if (avatar?.startsWith("http")) return avatar;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const cleanPath = avatar?.startsWith("/") ? avatar : `/${avatar}`;
    return `${apiUrl}${cleanPath}`;
  };

  const displayUser = {
    id: profile?.id ?? user?.id,
    firstname: profile?.firstname ?? user?.firstname,
    lastname: profile?.lastname ?? user?.lastname,
    avatar: getAvatarUrl(),
    headline: profile?.headline ?? "Membre de la communauté",
  };

  const mainLinks = [
    { href: "/community", icon: Home, label: "Fil d'actualité" },
    { href: "/community/feed", icon: FileText, label: "Feed" },
    {
      href: "/messages",
      icon: MessageCircle,
      label: "Messages",
      badge: unreadMsgs,
    },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      badge: unreadNotifs,
    },
    {
      href: "/announcements",
      icon: Megaphone,
      label: "Annonces",
    },
    {
      href: "/chat-ai",
      icon: Bot,
      label: "Assistant IA",
    },
    {
      href: "/missions",
      icon: Target,
      label: "Missions",
    },
  ];

  const secondaryLinks = [
    { href: "/users", icon: Users, label: "Communauté" },
    { href: "/settings", icon: Settings, label: "Paramètres" },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <aside
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 w-72 flex flex-col"
      style={{
        background: "rgba(249,250,242,0.92)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(194,201,187,0.4)",
        boxShadow: "4px 0 24px rgba(21,66,18,0.04)",
      }}
    >
      {/* Header profil */}
      <div
        className="px-4 pt-5 pb-4"
        style={{ borderBottom: "1px solid rgba(194,201,187,0.35)" }}
      >
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl p-3 transition-all duration-200"
          style={{
            background:
              "linear-gradient(135deg, rgba(188,240,174,0.35) 0%, rgba(244,187,146,0.2) 100%)",
            border: "1px solid rgba(161,212,148,0.3)",
          }}
        >
          <Avatar
            src={displayUser.avatar}
            firstname={displayUser.firstname}
            size="md"
            className="ring-2 ring-green-300/50"
          />
          <div className="min-w-0 flex-1">
            <p
              className="text-sm font-semibold truncate"
              style={{
                color: "#191c18",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              {displayUser.firstname} {displayUser.lastname}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: "#72796e" }}>
              {displayUser.headline}
            </p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <SectionLabel label="Navigation" />

        <div className="space-y-0.5">
          {mainLinks.map(({ href, icon: Icon, label, badge }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              active={isActive(href)}
              badge={badge}
              icon={
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive(href) ? 2.2 : 1.8}
                />
              }
            />
          ))}
        </div>

        <div
          className="my-4 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(194,201,187,0.6), transparent)",
          }}
        />

        <SectionLabel label="Espace utilisateur" />

        <div className="space-y-0.5">
          {secondaryLinks.map(({ href, icon: Icon, label }) => (
            <NavLink
              key={href}
              href={href}
              label={label}
              active={isActive(href)}
              icon={
                <Icon
                  className="w-5 h-5"
                  strokeWidth={isActive(href) ? 2.2 : 1.8}
                />
              }
            />
          ))}
        </div>
      </nav>
    </aside>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p
      className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[0.18em]"
      style={{ color: "#72796e", fontFamily: "'Inter', sans-serif" }}
    >
      {label}
    </p>
  );
}

function NavLink({
  href,
  label,
  icon,
  active,
  badge,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className="group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all duration-200"
      style={
        active
          ? {
              background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
              color: "#bcf0ae",
              boxShadow: "0 4px 12px rgba(21,66,18,0.25)",
            }
          : {
              color: "#42493e",
            }
      }
      onMouseEnter={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(188,240,174,0.25)";
          (e.currentTarget as HTMLElement).style.color = "#154212";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          (e.currentTarget as HTMLElement).style.background = "transparent";
          (e.currentTarget as HTMLElement).style.color = "#42493e";
        }
      }}
    >
      <span className="relative z-10">{icon}</span>

      <span
        className="relative z-10 text-sm font-medium flex-1"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </span>

      {badge && badge > 0 ? (
        <span
          className="relative z-10 min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            background: active ? "rgba(188,240,174,0.25)" : "#ba1a1a",
            color: active ? "#bcf0ae" : "#ffffff",
            border: active ? "1px solid rgba(188,240,174,0.4)" : "none",
          }}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

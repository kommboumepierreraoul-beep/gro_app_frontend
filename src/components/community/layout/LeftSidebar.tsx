// components/community/LeftSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  Bell,
  Megaphone,
  Users,
  Settings,
  Bot,
  Target,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useAuthStore } from "@/stores/auth.store";
import { Avatar } from "../shared/Avatar";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/community/profile.service";
import { useCommunityStore } from "@/stores/community.store";

interface LeftSidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export function LeftSidebar({
  isCollapsed = false,
  onToggle,
}: LeftSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const unreadNotifs = useCommunityStore((s) => s.unreadNotifs);
  const unreadMsgs = useCommunityStore((s) => s.unreadMessages);

  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: false,
    retry: 1,
  });

  const getAvatarUrl = () => {
    const avatar = profile?.avatar ?? user?.avatar;
    if (!avatar) return undefined;
    if (avatar.startsWith("http")) return avatar;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
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
    { href: "/announcements", icon: Megaphone, label: "Annonces" },
    { href: "/chat-ai", icon: Bot, label: "AgriPulse IA" },
    { href: "/missions", icon: Target, label: "Missions" },
  ];

  const secondaryLinks = [
    { href: "/users", icon: Users, label: "Communauté" },
    { href: "/support", icon: HelpCircle, label: "Aide & Support" },
    { href: "/settings", icon: Settings, label: "Paramètres" },
  ];

  const isActive = (href: string) => pathname === href;

  const sidebarBase: React.CSSProperties = {
    background: "rgba(249,250,242,0.96)",
    backdropFilter: "blur(16px)",
    borderRight: "1px solid rgba(194,201,187,0.4)",
    boxShadow: "4px 0 24px rgba(21,66,18,0.04)",
    transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
  };

  // ─── Version RÉDUITE ───────────────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <aside
        className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col items-center"
        style={{
          ...sidebarBase,
          width: "60px", // Largeur fixe pour la version réduite
        }}
      >
        {/* Toggle */}
        <button
          onClick={onToggle}
          aria-label="Agrandir le menu"
          className="mt-3 w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-[#eaf3de]"
          style={{ color: "#72796e" }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="mt-4">
          <Link
            href="/profile"
            className="block w-10 h-10 rounded-xl overflow-hidden ring-2 ring-[#bcf0ae]/30 hover:ring-[#bcf0ae]/60 transition-all"
          >
            <Avatar
              src={displayUser.avatar}
              firstname={displayUser.firstname}
              size="sm"
              className="w-full h-full"
            />
          </Link>
        </div>

        {/* Liens principaux */}
        <nav className="flex-1 flex flex-col w-full px-2 py-4 overflow-y-auto">
          <div className="space-y-1 flex-1">
            {mainLinks.map(({ href, icon: Icon, label, badge }) => (
              <IconLink
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

          {/* Séparateur */}
          <div className="my-2 border-t border-[#c2c9bb]/30" />

          {/* Liens secondaires en BAS */}
          <div className="space-y-1">
            {secondaryLinks.map(({ href, icon: Icon, label }) => (
              <IconLink
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

  // ─── Version ÉTENDUE ───────────────────────────────────────────────────────
  return (
    <aside
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 flex flex-col"
      style={{
        ...sidebarBase,
        width: "220px", // Largeur fixe pour la version étendue
      }}
    >
      {/* Toggle */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#c2c9bb]/10">
        {/* Logo / marque discrète */}
        <span
          className="text-[11px] font-black tracking-widest uppercase"
          style={{
            color: "#2d5a27",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          GRO
        </span>
        <button
          onClick={onToggle}
          aria-label="Réduire le menu"
          className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-[#eaf3de]"
          style={{ color: "#72796e" }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Profil */}
      <div className="px-3 pt-3 pb-4">
        <Link
          href="/profile"
          className="flex items-center gap-3 rounded-2xl p-3 transition-all duration-200 hover:shadow-sm"
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
            className="ring-2 ring-[#bcf0ae]/50 flex-shrink-0"
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

      {/* Navigation principale — flex-1 pour pousser le bas vers le bas */}
      <nav className="flex-1 flex flex-col px-3 py-2 overflow-y-auto min-h-0">
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

        {/* Pousse les liens secondaires vers le bas */}
        <div className="flex-1" />

        {/* Séparateur */}
        <div
          className="my-3 h-px"
          style={{
            background:
              "linear-gradient(to right, transparent, rgba(194,201,187,0.6), transparent)",
          }}
        />

        {/* Liens secondaires épinglés en BAS */}
        <SectionLabel label="Espace utilisateur" />
        <div className="space-y-0.5 pb-2">
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

// ─── Sous-composants ──────────────────────────────────────────────────────────

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
      className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200"
      style={
        active
          ? {
              background: "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
              color: "#bcf0ae",
              boxShadow: "0 4px 12px rgba(21,66,18,0.25)",
            }
          : { color: "#42493e" }
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
      <span className="flex-shrink-0">{icon}</span>
      <span
        className="text-sm font-medium flex-1"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {label}
      </span>
      {badge && badge > 0 ? (
        <span
          className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold"
          style={{
            background: active ? "rgba(188,240,174,0.25)" : "#ba1a1a",
            color: active ? "#bcf0ae" : "#ffffff",
            border: active ? "1px solid rgba(188,240,174,0.4)" : "none",
          }}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}

function IconLink({
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
      title={label}
      className="relative flex items-center justify-center w-full h-10 rounded-xl transition-all duration-200"
      style={
        active
          ? {
              background: "#154212",
              color: "#bcf0ae",
              boxShadow: "0 4px 12px rgba(21,66,18,0.25)",
            }
          : { color: "#42493e" }
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
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[9px] font-bold bg-red-500 text-white">
          {badge > 9 ? "9+" : badge}
        </span>
      )}
    </Link>
  );
}

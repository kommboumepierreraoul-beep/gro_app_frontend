"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import {
  Search as SearchIcon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Bell,
  Crown,
  HelpCircle,
  Sparkles,
  X,
  Megaphone,
} from "lucide-react";

import { Avatar } from "../shared/Avatar";
import { LanguageToggle } from "@/components/ui/LanguageToggle";
import { Search } from "@/components/ui/Search";
import { useI18n } from "@/i18n/LanguageProvider";
import { useAuthStore } from "@/stores/auth.store";
import { useCommunityStore } from "@/stores/community.store";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/community/profile.service";
import { PushNotificationModal } from "@/components/marketplace/PushNotificationModal";
import { openFirstRunGuide } from "@/components/onboarding/FirstRunGuide";
import api from "@/lib/axios";
import Image from "next/image";

const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;
  if (avatar.startsWith("http")) return avatar;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatar.startsWith("/") ? avatar : `/${avatar}`;
  return `${apiUrl}${cleanPath}`;
};

export function CommunityNavbar() {
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const { t } = useI18n();

  const isAdmin = user?.role === "admin" || user?.is_admin === true;
  const unreadNotifs = useCommunityStore((s) => s.unreadNotifs);

  const [showMenu, setShowMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const { data: appUnreadCount = 0 } = useQuery({
    queryKey: ["app-notifications-unread-count"],
    queryFn: async () => {
      const { data } = await api.get("/notifications/unread-count");
      return Number(data.unread_count ?? 0);
    },
    refetchInterval: 30000,
    retry: false,
  });

  const { data: missionUnreadCount = 0 } = useQuery({
    queryKey: ["mission-notifications-unread-count-navbar"],
    queryFn: async () => {
      const { data } = await api.get(
        "/community/notifications/missions/unread-count",
      );
      return Number(data.count ?? data.unread_count ?? 0);
    },
    refetchInterval: 30000,
    retry: false,
  });

  const totalUnreadNotifs = unreadNotifs + appUnreadCount + missionUnreadCount;

  const displayUser = {
    id: profile?.id ?? user?.id,
    firstname: profile?.firstname ?? user?.firstname,
    lastname: profile?.lastname ?? user?.lastname,
    avatar: getAvatarUrl(profile?.avatar ?? user?.avatar),
    headline: profile?.headline ?? t("navigation.communityHeadline"),
    email: profile?.email ?? user?.email,
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const iconButtonStyle = {
    color: "#42493e",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "rgba(188,240,174,0.3)";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "transparent";
  };

  return (
    <>
      <nav
        className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? "rgba(249,250,242,0.96)"
            : "rgba(249,250,242,1)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(194,201,187,0.4)",
          boxShadow: scrolled ? "0 2px 16px rgba(21,66,18,0.06)" : "none",
        }}
      >
        <div className="px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Logo */}
            <Link
              href="/community"
              className="group flex flex-shrink-0 items-center gap-2.5"
            >
              <div className="relative h-10 w-10">
                <Image
                  src="/logo_agri_pulse.png"
                  alt="AgriPulse"
                  sizes="40px"
                  fill
                  className="object-contain"
                />
              </div>

              <span
                className="hidden text-lg font-bold sm:inline"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background:
                    "linear-gradient(135deg, #154212 0%, #3b6934 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                AgriPulse
              </span>
            </Link>

            {/* Recherche desktop */}
            <div className="hidden max-w-md flex-1 md:block">
              <Search
                placeholder={t("community.searchPlaceholder")}
                className="w-full"
              />
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-1">
              {/* Recherche mobile */}
              <button
                type="button"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="rounded-xl p-2 transition-all duration-150 md:hidden"
                style={iconButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Rechercher"
              >
                <SearchIcon className="h-5 w-5" />
              </button>

              {/* Annonces mobile + desktop */}
              <Link
                href="/annonces"
                title="Annonces"
                aria-label="Voir les annonces"
                className="flex rounded-xl p-2 transition-all duration-150"
                style={iconButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Megaphone className="h-5 w-5" />
              </Link>

              {isAdmin && (
                <Link
                  href="/admin"
                  title={t("navigation.adminSpace")}
                  aria-label="Ouvrir l'espace administrateur"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold shadow-sm transition-all duration-150"
                  style={{
                    color: "#5f4300",
                    background:
                      "linear-gradient(135deg, rgba(255,214,102,0.95) 0%, rgba(255,245,204,0.95) 100%)",
                    border: "1px solid rgba(166,124,0,0.25)",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(255,198,41,1) 0%, rgba(255,235,173,1) 100%)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(255,214,102,0.95) 0%, rgba(255,245,204,0.95) 100%)")
                  }
                >
                  <Crown className="h-4 w-4 fill-current" />
                  <span className="hidden sm:inline">
                    {t("navigation.admin")}
                  </span>
                </Link>
              )}

              <LanguageToggle compact className="hidden sm:inline-flex" />

              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative rounded-xl p-2 transition-all duration-150"
                style={iconButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5" />

                {totalUnreadNotifs > 0 && (
                  <span
                    className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2"
                    style={
                      {
                        background: "#ba1a1a",
                        "--tw-ring-color": "rgb(249,250,242)",
                      } as React.CSSProperties
                    }
                  />
                )}
              </Link>

              <PushNotificationModal variant="icon" />

              <button
                type="button"
                onClick={openFirstRunGuide}
                title="Relancer le guide de démarrage"
                aria-label="Relancer le guide de démarrage"
                className="hidden rounded-xl p-2 transition-all duration-150 sm:flex"
                style={iconButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <Sparkles className="h-5 w-5" />
              </button>

              {/* Support desktop */}
              <Link
                href="/support"
                className="hidden rounded-xl p-2 transition-all duration-150 sm:flex"
                style={iconButtonStyle}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                aria-label="Support"
              >
                <HelpCircle className="h-5 w-5" />
              </Link>

              {/* Menu utilisateur */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 rounded-xl py-1.5 pl-1 pr-2 transition-all duration-150"
                  style={iconButtonStyle}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(194,201,187,0.3)")
                  }
                  onMouseLeave={handleMouseLeave}
                  aria-label="Menu utilisateur"
                >
                  <Avatar
                    src={displayUser.avatar}
                    firstname={displayUser.firstname}
                    size="sm"
                    ring={false}
                  />

                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform duration-200 ${
                      showMenu ? "rotate-180" : ""
                    }`}
                    style={{ color: "#72796e" }}
                  />
                </button>

                {showMenu && (
                  <div
                    className="animate-slideDown absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl"
                    style={{
                      background: "rgba(249,250,242,0.98)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(194,201,187,0.5)",
                      boxShadow: "0 16px 40px rgba(21,66,18,0.12)",
                    }}
                  >
                    <div
                      className="px-4 py-3.5"
                      style={{
                        borderBottom: "1px solid rgba(194,201,187,0.35)",
                        background:
                          "linear-gradient(135deg, rgba(188,240,174,0.25) 0%, rgba(244,187,146,0.12) 100%)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={displayUser.avatar}
                          firstname={displayUser.firstname}
                          size="md"
                          ring={true}
                        />

                        <div className="min-w-0">
                          <p
                            className="truncate text-sm font-semibold"
                            style={{
                              color: "#191c18",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {displayUser.firstname} {displayUser.lastname}
                          </p>

                          <p
                            className="truncate text-xs"
                            style={{ color: "#72796e" }}
                          >
                            {displayUser.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="py-1.5">
                      {[
                        {
                          href: "/admin",
                          icon: Crown,
                          label: t("navigation.adminSpace"),
                          adminOnly: true,
                        },
                        {
                          href: "/profile",
                          icon: User,
                          label: t("navigation.profile"),
                        },
                        {
                          href: "/settings",
                          icon: Settings,
                          label: t("navigation.settings"),
                        },
                        {
                          href: "/support",
                          icon: HelpCircle,
                          label: t("navigation.support"),
                        },
                        {
                          href: "/annonces",
                          icon: Megaphone,
                          label: "Annonces",
                        },
                      ]
                        .filter((item) => !item.adminOnly || isAdmin)
                        .map(({ href, icon: Icon, label }) => (
                          <Link
                            key={href}
                            href={href}
                            onClick={() => setShowMenu(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
                            style={{ color: "#42493e" }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(188,240,174,0.2)")
                            }
                            onMouseLeave={handleMouseLeave}
                          >
                            <Icon
                              className="h-4 w-4"
                              style={{ color: "#72796e" }}
                            />
                            {label}
                          </Link>
                        ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        logout();
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-all duration-150"
                      style={{
                        color: "#ba1a1a",
                        borderTop: "1px solid rgba(194,201,187,0.35)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(186,26,26,0.06)")
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      <LogOut className="h-4 w-4" />
                      {t("auth.logout")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recherche mobile overlay */}
        {showMobileSearch && (
          <div
            className="animate-slideDown absolute left-0 right-0 top-full z-50 border-b p-3 md:hidden"
            style={{
              background: "rgba(249,250,242,0.96)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(194,201,187,0.4)",
            }}
          >
            <div className="flex items-center gap-2">
              <Search
                placeholder={t("community.mobileSearchPlaceholder")}
                className="flex-1 bg-transparent"
              />

              <LanguageToggle compact />

              <button
                type="button"
                onClick={() => setShowMobileSearch(false)}
                className="rounded-xl p-2 transition-all duration-150"
                style={{ color: "#72796e" }}
                aria-label="Fermer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      <div className="h-16" />
    </>
  );
}

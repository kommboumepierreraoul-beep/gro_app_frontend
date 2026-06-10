"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import {
  Search as SearchIcon,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Bell,
  HelpCircle,
  X,
} from "lucide-react";

import { Avatar } from "../shared/Avatar";
import { Search } from "@/components/ui/Search";
import { useAuthStore } from "@/stores/auth.store";
import { useCommunityStore } from "@/stores/community.store";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/community/profile.service";

// Fonction pour obtenir l'URL complète de l'avatar
const getAvatarUrl = (avatar?: string | null): string | undefined => {
  if (!avatar) return undefined;

  if (avatar?.startsWith("http")) return avatar;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const cleanPath = avatar?.startsWith("/") ? avatar : `/${avatar}`;
  return `${apiUrl}${cleanPath}`;
};

export function CommunityNavbar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout } = useAuth();

  const unreadNotifs = useCommunityStore((s) => s.unreadNotifs);

  const [showMenu, setShowMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Récupérer le profil utilisateur
  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Construire les données utilisateur pour l'affichage
  const displayUser = {
    id: profile?.id ?? user?.id,
    firstname: profile?.firstname ?? user?.firstname,
    lastname: profile?.lastname ?? user?.lastname,
    avatar: getAvatarUrl(profile?.avatar ?? user?.avatar),
    headline: profile?.headline ?? user?.headline ?? "Membre de la communauté",
    email: profile?.email ?? user?.email,
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
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

  return (
    <>
      <nav
        className="fixed top-0 right-0 z-50 left-0 transition-all duration-300"
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
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link
              href="/community"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-all duration-200 group-hover:shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #3b6934 0%, #154212 100%)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.8}
                  stroke="white"
                  className="w-4.5 h-4.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3v2.25M12 21v-2.25M18.75 12H21M3 12h2.25M18.75 12a6.75 6.75 0 01-13.5 0 6.75 6.75 0 0113.5 0zM12 9.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z"
                  />
                </svg>
              </div>
              <span
                className="font-bold text-lg hidden sm:inline"
                style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  background:
                    "linear-gradient(135deg, #154212 0%, #3b6934 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Agritech
              </span>
            </Link>

            {/* Barre de recherche desktop */}
            <div className="hidden md:block flex-1 max-w-md">
              <Search
                placeholder="Rechercher utilisateurs ou publications..."
                className="w-full"
              />
            </div>

            {/* Actions droite */}
            <div className="flex items-center gap-1">
              {/* Recherche mobile */}
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="md:hidden p-2 rounded-xl transition-all duration-150"
                style={{ color: "#42493e" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(188,240,174,0.3)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <SearchIcon className="w-5 h-5" />
              </button>

              {/* Notifications */}
              <Link
                href="/notifications"
                className="relative p-2 rounded-xl transition-all duration-150"
                style={{ color: "#42493e" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(188,240,174,0.3)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <Bell className="w-5 h-5" />
                {unreadNotifs > 0 && (
                  <span
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2"
                    style={
                      {
                        background: "#ba1a1a",
                        "--tw-ring-color": "rgb(249,250,242)",
                      } as React.CSSProperties
                    }
                  />
                )}
              </Link>

              {/* Support */}
              <Link
                href="/support"
                className="hidden sm:flex p-2 rounded-xl transition-all duration-150"
                style={{ color: "#42493e" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "rgba(188,240,174,0.3)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.background =
                    "transparent")
                }
              >
                <HelpCircle className="w-5 h-5" />
              </Link>

              {/* Menu utilisateur */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1.5 rounded-xl transition-all duration-150"
                  style={{ color: "#42493e" }}
                  onMouseEnter={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "rgba(194,201,187,0.3)")
                  }
                  onMouseLeave={(e) =>
                    ((e.currentTarget as HTMLElement).style.background =
                      "transparent")
                  }
                >
                  <Avatar
                    src={displayUser.avatar}
                    firstname={displayUser.firstname}
                    size="sm"
                    withRing={false}
                  />
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      showMenu ? "rotate-180" : ""
                    }`}
                    style={{ color: "#72796e" }}
                  />
                </button>

                {/* Dropdown */}
                {showMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl overflow-hidden z-50 animate-slideDown"
                    style={{
                      background: "rgba(249,250,242,0.98)",
                      backdropFilter: "blur(20px)",
                      border: "1px solid rgba(194,201,187,0.5)",
                      boxShadow: "0 16px 40px rgba(21,66,18,0.12)",
                    }}
                  >
                    {/* Header */}
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
                          withRing={true}
                        />
                        <div className="min-w-0">
                          <p
                            className="text-sm font-semibold truncate"
                            style={{
                              color: "#191c18",
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                            }}
                          >
                            {displayUser.firstname} {displayUser.lastname}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: "#72796e" }}
                          >
                            {displayUser.email}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Liens */}
                    <div className="py-1.5">
                      {[
                        {
                          href: "/profile",
                          icon: User,
                          label: "Mon profil",
                        },
                        {
                          href: "/settings",
                          icon: Settings,
                          label: "Paramètres",
                        },
                        {
                          href: "/support",
                          icon: HelpCircle,
                          label: "Aide & support",
                        },
                      ].map(({ href, icon: Icon, label }) => (
                        <Link
                          key={href}
                          href={href}
                          onClick={() => setShowMenu(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-150"
                          style={{ color: "#42493e" }}
                          onMouseEnter={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "rgba(188,240,174,0.2)")
                          }
                          onMouseLeave={(e) =>
                            ((e.currentTarget as HTMLElement).style.background =
                              "transparent")
                          }
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: "#72796e" }}
                          />
                          {label}
                        </Link>
                      ))}
                    </div>

                    {/* Déconnexion */}
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-all duration-150"
                      style={{
                        color: "#ba1a1a",
                        borderTop: "1px solid rgba(194,201,187,0.35)",
                      }}
                      onMouseEnter={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "rgba(186,26,26,0.06)")
                      }
                      onMouseLeave={(e) =>
                        ((e.currentTarget as HTMLElement).style.background =
                          "transparent")
                      }
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
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
            className="md:hidden absolute top-full left-0 right-0 border-b p-3 z-50 animate-slideDown"
            style={{
              background: "rgba(249,250,242,0.98)",
              backdropFilter: "blur(16px)",
              borderColor: "rgba(194,201,187,0.4)",
            }}
          >
            <div className="flex items-center gap-2">
              <Search placeholder="Rechercher..." className="flex-1 bg-transparent" />
              <button
                onClick={() => setShowMobileSearch(false)}
                className="p-2 rounded-xl transition-all duration-150"
                style={{ color: "#72796e" }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer navbar */}
      <div className="h-16" />
    </>
  );
}
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "../shared/Avatar";
import { useAuthStore } from "@/store/auth.store";
import { useCommunityStore } from "@/store/community.store";
import { useAuth } from "@/hooks/useAuth";
import { profileService } from "@/services/community/profile.service";

export function CommunityNavbar() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const unreadNotifs = useCommunityStore((s) => s.unreadNotifs);
  const unreadMsgs = useCommunityStore((s) => s.unreadMessages);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Recherche avec debounce
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const data = await profileService.search(query);
      setResults(data);
      setShowSearch(true);
    }, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Fermer le dropdown si clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const navLinks = [
    { href: "/community", icon: HomeIcon, label: "Accueil" },
    { href: "/messages", icon: ChatIcon, label: "Messages", badge: unreadMsgs },
    {
      href: "/notifications",
      icon: BellIcon,
      label: "Notifications",
      badge: unreadNotifs,
    },
    { href: "/announcements", icon: MegaIcon, label: "Annonces" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/community"
          className="font-bold text-xl text-blue-600 flex-shrink-0"
        >
          Community
        </Link>

        {/* Barre de recherche */}
        <div ref={searchRef} className="relative flex-1 max-w-sm">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 rounded-full outline-none focus:bg-white focus:ring-2 focus:ring-blue-200 transition"
            />
          </div>

          {/* Résultats de recherche */}
          {showSearch && results.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              {results.map((u) => (
                <Link
                  key={u.id}
                  href={`/profile/${u.id}`}
                  onClick={() => {
                    setShowSearch(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                >
                  <Avatar src={u.avatar} firstname={u.firstname} size="sm" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {u.firstname} {u.lastname}
                    </p>
                    {u.headline && (
                      <p className="text-xs text-gray-500">{u.headline}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Liens de navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, icon: Icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center px-4 py-2 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition group"
            >
              <div className="relative">
                <Icon className="w-6 h-6" />
                {badge! > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {badge! > 9 ? "9+" : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{label}</span>
            </Link>
          ))}
        </div>

        {/* Avatar + Menu utilisateur */}
        <div className="relative ml-auto">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2"
          >
            <Avatar src={user?.avatar} firstname={user?.firstname} size="sm" />
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-gray-50">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.firstname} {user?.lastname}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
              {[
                { label: "Mon profil", href: "/profile" },
                { label: "Paramètres", href: "/settings" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setShowMenu(false)}
                  className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setShowMenu(false);
                  logout();
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-50"
              >
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

// Icônes SVG inline
const HomeIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);
const ChatIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
    />
  </svg>
);
const BellIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);
const MegaIcon = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
    />
  </svg>
);

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCommunityStore } from "@/stores/community.store";

import { Home, MessageCircle, Bell, Store, Target, Megaphone } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();

  const unreadNotifs = useCommunityStore((s) => s.unreadNotifs);
  const unreadMessages = useCommunityStore((s) => s.unreadMessages);

  const links = [
    {
      href: "/community",
      label: "Accueil",
      icon: Home,
    },
    {
      href: "/messages",
      label: "Messages",
      icon: MessageCircle,
      badge: unreadMessages,
    },
    {
      href: "/missions",
      label: "Missions",
      icon: Target,
    },
    {
      href: "/announcements",
      label: "Annonces",
      icon: Megaphone,
    },
    {
      href: "/marketplace",
      label: "Marché",
      icon: Store,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{
        background: "rgba(249,250,242,0.96)",
        backdropFilter: "blur(16px)",
        borderTop: "1px solid rgba(194,201,187,0.4)",
        boxShadow: "0 -4px 20px rgba(21,66,18,0.06)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, label, icon: Icon, badge }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200"
            >
              {/* Icône */}
              <div
                className="relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all duration-200"
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, #2d5a27 0%, #154212 100%)",
                        boxShadow: "0 4px 12px rgba(21,66,18,0.3)",
                      }
                    : {}
                }
              >
                <Icon
                  className="w-5 h-5 transition-transform duration-200"
                  style={{
                    color: active ? "#bcf0ae" : "#72796e",
                    transform: active ? "scale(1.1)" : "scale(1)",
                  }}
                  strokeWidth={active ? 2.4 : 2}
                />

                {/* Badge */}
                {badge! > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center border-2"
                    style={{
                      background: "#ba1a1a",
                      color: "#ffffff",
                      borderColor: "rgb(249,250,242)",
                    }}
                  >
                    {badge! > 9 ? "9+" : badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className="mt-1 text-[10px] font-semibold transition-colors"
                style={{
                  color: active ? "#154212" : "#72796e",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { Avatar } from "../shared/Avatar";
import { useQuery } from "@tanstack/react-query";
import { profileService } from "@/services/community/profile.service";

export function LeftSidebar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const { data: profile } = useQuery({
    queryKey: ["myProfile"],
    queryFn: profileService.getMe,
  });

  const links = [
    { href: "/community", icon: "🏠", label: "Fil d'actualité" },
    { href: "/profile", icon: "👤", label: "Mon profil" },
    { href: "/messages", icon: "💬", label: "Messages" },
    { href: "/notifications", icon: "🔔", label: "Notifications" },
    { href: "/announcements", icon: "📣", label: "Annonces" },
    { href: "/settings", icon: "⚙️", label: "Paramètres" },
  ];

  return (
    <aside className="w-60 flex-shrink-0 h-[calc(100vh-4rem)] sticky top-20">
      <div className="sticky top-20 space-y-3">
        {/* Mini profil */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* Bannière */}
          <div className="h-16 bg-gradient-to-r from-blue-500 to-purple-600" />

          <div className="px-4 pb-4">
            <div className="-mt-6 mb-3">
              <Avatar
                src={user?.avatar}
                firstname={user?.firstname}
                size="lg"
                className="ring-4 ring-white"
              />
            </div>
            <p className="font-bold text-sm text-gray-900">
              {user?.firstname} {user?.lastname}
            </p>
            {profile?.headline && (
              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                {profile.headline}
              </p>
            )}

            {/* Stats */}
            <div className="mt-3 grid grid-cols-3 gap-1 text-center border-t border-gray-50 pt-3">
              {[
                { label: "Posts", value: profile?.posts_count ?? 0 },
                { label: "Abonnés", value: profile?.followers_count ?? 0 },
                { label: "Abonnements", value: profile?.following_count ?? 0 },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-sm font-bold text-gray-900">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {links.map(({ href, icon, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition ${
                  active
                    ? "bg-blue-50 text-blue-700 font-semibold border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="text-base">{icon}</span>
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

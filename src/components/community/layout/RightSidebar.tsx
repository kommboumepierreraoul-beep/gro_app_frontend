/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { followService } from "@/services/community/follow.service";
import { announcementService } from "@/services/community/announcement.service";
import { Avatar } from "../shared/Avatar";
import { useFollow } from "@/hooks/community/useFollow";
import { CommunityUser } from "@/types/community.types";

export function RightSidebar() {
  const { data: suggestions } = useQuery({
    queryKey: ["suggestions"],
    queryFn: followService.getSuggestions,
  });

  const { data: announcements } = useQuery({
    queryKey: ["latestAnnouncements"],
    queryFn: () => announcementService.getAll(undefined, 1),
    select: (d) => d.data.slice(0, 3),
  });

  return (
    <aside className="w-60 hidden xl:block bg-amber-400">
      <div className="sticky top-20 space-y-4">
        {/* Suggestions */}
        {suggestions && suggestions.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Personnes à suivre
            </h3>
            <div className="space-y-3">
              {suggestions.map((user: CommunityUser) => (
                <SuggestionItem key={user.id} user={user} />
              ))}
            </div>
          </div>
        )}

        {/* Annonces récentes */}
        {announcements && announcements.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <h3 className="text-sm font-bold text-gray-900 mb-3">
              Annonces récentes
            </h3>
            <div className="space-y-3">
              {announcements.map((a: any) => (
                <Link
                  key={a.id}
                  href={`/announcements`}
                  className="block group"
                >
                  <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-600 transition line-clamp-2">
                    {a.title}
                  </p>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${
                      a.category === "job"
                        ? "bg-green-100 text-green-700"
                        : a.category === "event"
                          ? "bg-blue-100 text-blue-700"
                          : a.category === "training"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {a.category}
                  </span>
                </Link>
              ))}
            </div>
            <Link
              href="/announcements"
              className="block text-xs text-blue-600 hover:underline mt-3 text-center"
            >
              Voir toutes les annonces →
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}

function SuggestionItem({ user }: { user: CommunityUser }) {
  const { toggle, isLoading } = useFollow(user.id, false);

  return (
    <div className="flex items-center gap-2">
      <Link href={`/profile/${user.id}`}>
        <Avatar src={user.avatar} firstname={user.firstname} size="sm" />
      </Link>
      <div className="flex-1 min-w-0">
        <Link
          href={`/profile/${user.id}`}
          className="text-xs font-semibold text-gray-900 hover:text-blue-600 transition truncate block"
        >
          {user.firstname} {user.lastname}
        </Link>
        {user.headline && (
          <p className="text-[10px] text-gray-400 truncate">{user.headline}</p>
        )}
      </div>
      <button
        onClick={() => toggle.mutate()}
        disabled={isLoading}
        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition flex-shrink-0 disabled:opacity-50"
      >
        Suivre
      </button>
    </div>
  );
}

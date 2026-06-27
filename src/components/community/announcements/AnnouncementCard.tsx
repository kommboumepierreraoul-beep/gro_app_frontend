"use client";
import Image from "next/image";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { Announcement } from "@/types/community.types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementService } from "@/services/community/announcement.service";

const categoryColors: Record<string, string> = {
  job: "bg-green-100 text-green-700",
  event: "bg-blue-100 text-blue-700",
  news: "bg-orange-100 text-orange-700",
  training: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-600",
};

const categoryLabels: Record<string, string> = {
  job: "Emploi",
  event: "Événement",
  news: "Actualité",
  training: "Formation",
  other: "Autre",
};

export function AnnouncementCard({
  announcement,
}: {
  announcement: Announcement;
}) {
  const queryClient = useQueryClient();

  const like = useMutation({
    mutationFn: () => announcementService.toggleLike(announcement.id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["announcements"] }),
  });

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition">
      {/* Image de couverture */}
      {announcement.cover_image && (
        <div className="relative h-40">
          <Image
            src={announcement.cover_image}
            alt={announcement.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <div className="p-4">
        {/* Badge catégorie */}
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${
            categoryColors[announcement.category]
          }`}
        >
          {categoryLabels[announcement.category]}
        </span>

        <h3 className="font-bold text-gray-900 text-sm leading-snug mb-2">
          {announcement.title}
        </h3>

        <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed mb-3">
          {announcement.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <Avatar
              src={announcement.author.avatar}
              firstname={announcement.author.firstname}
              size="xs"
            />
            <div>
              <p className="text-xs font-medium text-gray-700">
                {announcement.author.firstname} {announcement.author.lastname}
              </p>
              <TimeAgo date={announcement.created_at} />
            </div>
          </div>

          <button
            onClick={() => like.mutate()}
            disabled={like.isPending}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition ${
              announcement.is_liked
                ? "bg-blue-50 text-blue-600"
                : "text-gray-400 hover:bg-gray-50"
            }`}
          >
            <span>{announcement.is_liked ? "👍" : "👍"}</span>
            {announcement.likes_count > 0 && (
              <span>{announcement.likes_count}</span>
            )}
          </button>
        </div>

        {announcement.expires_at && (
          <p className="text-[10px] text-orange-500 mt-2">
            ⏳ Expire le{" "}
            {new Date(announcement.expires_at).toLocaleDateString("fr-FR")}
          </p>
        )}
      </div>
    </div>
  );
}

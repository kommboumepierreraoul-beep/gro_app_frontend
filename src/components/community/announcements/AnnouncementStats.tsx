/* eslint-disable react/no-unescaped-entities */
// components/announcements/AnnouncementStats.tsx
import { Heart, Eye, Clock } from "lucide-react";

interface AnnouncementStatsProps {
  likesCount: number;
  viewsCount?: number;
  expiresAt: string | null;
}

export function AnnouncementStats({
  likesCount,
  viewsCount,
  expiresAt,
}: AnnouncementStatsProps) {
  return (
    <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
      <div className="flex items-center gap-2">
        <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
        <span className="text-sm text-gray-600">{likesCount} j'aime</span>
      </div>
      {viewsCount && viewsCount > 0 && (
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">{viewsCount} vues</span>
        </div>
      )}
      {expiresAt && (
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          <span className="text-sm text-gray-600">
            Expire le{" "}
            {new Date(expiresAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      )}
    </div>
  );
}

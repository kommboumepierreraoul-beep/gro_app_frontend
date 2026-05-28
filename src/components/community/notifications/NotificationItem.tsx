"use client";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { Notification } from "@/types/community.types";
import { useNotifications } from "@/hooks/community/useNotifications";

const notifIcons: Record<string, string> = {
  like_post: "👍",
  like_comment: "❤️",
  comment: "💬",
  reply: "↩️",
  follow: "👤",
  share: "🔁",
  mention: "@",
  announcement: "📣",
};

export function NotificationItem({ notif }: { notif: Notification }) {
  const { markAsRead } = useNotifications();


  return (
    <div
      onClick={() => !notif.is_read && markAsRead.mutate(String(notif.id))}
      className={`flex items-start gap-3 px-4 py-3 transition cursor-pointer ${
        notif.is_read ? "hover:bg-gray-50" : "bg-blue-50 hover:bg-blue-100"
      }`}
    >
      <div className="relative flex-shrink-0">
        <Avatar
          src={notif.actor.avatar}
          firstname={notif.actor.firstname}
          size="md"
        />
        <span className="absolute -bottom-1 -right-1 text-sm">
          {notifIcons[notif.type] ?? "🔔"}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${notif.is_read ? "text-gray-600" : "text-gray-900 font-medium"}`}
        >
          {notif.message}
        </p>
        <TimeAgo date={notif.created_at} className="mt-1" />
      </div>

      {!notif.is_read && (
        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1.5" />
      )}
    </div>
  );
}

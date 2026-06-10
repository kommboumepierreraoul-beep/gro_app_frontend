"use client";
import { useRouter } from "next/navigation";
import { Avatar } from "../shared/Avatar";
import { TimeAgo } from "../shared/TimeAgo";
import { Notification } from "@/types/community.types";
import { useNotifications } from "@/hooks/community/useNotifications";
import {
  ThumbsUp,
  Heart,
  MessageCircle,
  CornerUpLeft,
  UserPlus,
  Repeat2,
  AtSign,
  Megaphone,
  Bell,
} from "lucide-react";

const notifConfig: Record<
  string,
  { icon: React.ReactNode; bg: string; color: string }
> = {
  like_post: {
    icon: <ThumbsUp size={10} strokeWidth={2.5} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
  },
  like_comment: {
    icon: <Heart size={10} strokeWidth={2.5} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
  },
  comment: {
    icon: <MessageCircle size={10} strokeWidth={2.5} />,
    bg: "rgba(45,90,39,0.12)",
    color: "#2d5a27",
  },
  reply: {
    icon: <CornerUpLeft size={10} strokeWidth={2.5} />,
    bg: "rgba(45,90,39,0.12)",
    color: "#2d5a27",
  },
  follow: {
    icon: <UserPlus size={10} strokeWidth={2.5} />,
    bg: "rgba(59,105,52,0.12)",
    color: "#3b6934",
  },
  share: {
    icon: <Repeat2 size={10} strokeWidth={2.5} />,
    bg: "rgba(128,85,51,0.12)",
    color: "#805533",
  },
  mention: {
    icon: <AtSign size={10} strokeWidth={2.5} />,
    bg: "rgba(21,66,18,0.12)",
    color: "#154212",
  },
  announcement: {
    icon: <Megaphone size={10} strokeWidth={2.5} />,
    bg: "rgba(128,85,51,0.12)",
    color: "#805533",
  },
};

const getRedirectUrl = (notif: Notification): string => {
  const { type, post, actor } = notif;
  switch (type) {
    case "like_post":
    case "comment":
    case "share":
    case "mention":
    case "like_comment":
    case "reply":
      return post?.id ? `/community/posts/${post.id}` : "/community";
    case "follow":
      return actor?.id ? `/profile/${actor.id}` : "/community";
    case "announcement":
      return post?.id ? `/community/announcements/${post.id}` : "/community";
    default:
      return "/community";
  }
};

export function NotificationItem({ notif }: { notif: Notification }) {
  const router = useRouter();
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    if (!notif.is_read) {
      markAsRead.mutate(String(notif.id));
    }
    router.push(getRedirectUrl(notif));
  };

  const cfg = notifConfig[notif.type] ?? {
    icon: <Bell size={10} strokeWidth={2.5} />,
    bg: "rgba(114,121,110,0.1)",
    color: "#72796e",
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 px-5 py-4 cursor-pointer transition-all duration-150"
      style={{
        borderBottom: "1px solid rgba(194,201,187,0.28)",
        background: notif.is_read ? "transparent" : "rgba(188,240,174,0.12)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = notif.is_read
          ? "rgba(21,66,18,0.03)"
          : "rgba(188,240,174,0.2)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = notif.is_read
          ? "transparent"
          : "rgba(188,240,174,0.12)";
      }}
    >
      {/* Avatar + badge icône */}
      <div className="relative flex-shrink-0">
        <Avatar
          src={notif.actor.avatar}
          firstname={notif.actor.firstname}
          size="md"
        />
        {/* Badge lucide en bas à droite de l'avatar */}
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full border-2"
          style={{
            background: cfg.bg,
            borderColor: "#f9faf2",
            color: cfg.color,
          }}
        >
          {cfg.icon}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug"
          style={{
            color: notif.is_read ? "#42493e" : "#191c18",
            fontWeight: notif.is_read ? 400 : 500,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {notif.message}
        </p>
        <TimeAgo
          date={notif.created_at}
          className="mt-1 text-xs"
          style={{ color: notif.is_read ? "#c2c9bb" : "#72796e" }}
        />
      </div>

      {/* Dot non-lu */}
      {!notif.is_read && (
        <div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: "#2d5a27" }}
        />
      )}
    </div>
  );
}
"use client";
import { useRouter } from "next/navigation";
import { TimeAgo } from "@/components/community/shared/TimeAgo";
import { useMissionNotifications } from "@/hooks/notifications/useMissionNotifications";
import { missionNotificationService } from "@/services/mission/notification.service";
import {
  Briefcase,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Edit,
  UserCheck,
  UserX,
  AlertCircle,
  Star,
  Flag,
  Bell,
} from "lucide-react";
import {
  MissionNotification,
  MissionNotificationType,
} from "@/lib/missions/notification.type";

// ─── Configuration des icônes ───────────────────────────────────────────────

const iconConfig: Record<
  MissionNotificationType,
  { icon: React.ReactNode; bg: string; color: string }
> = {
  new_mission: {
    icon: <Briefcase size={12} strokeWidth={2.5} />,
    bg: "rgba(21,66,18,0.12)",
    color: "#154212",
  },
  new_application: {
    icon: <Users size={12} strokeWidth={2.5} />,
    bg: "rgba(45,90,39,0.12)",
    color: "#2d5a27",
  },
  application_accepted: {
    icon: <CheckCircle size={12} strokeWidth={2.5} />,
    bg: "rgba(59,105,52,0.12)",
    color: "#3b6934",
  },
  application_rejected: {
    icon: <XCircle size={12} strokeWidth={2.5} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
  },
  application_withdrawn: {
    icon: <UserX size={12} strokeWidth={2.5} />,
    bg: "rgba(128,85,51,0.12)",
    color: "#805533",
  },
  mission_reminder: {
    icon: <Clock size={12} strokeWidth={2.5} />,
    bg: "rgba(255,152,0,0.12)",
    color: "#ff9800",
  },
  mission_updated: {
    icon: <Edit size={12} strokeWidth={2.5} />,
    bg: "rgba(128,85,51,0.12)",
    color: "#805533",
  },
  mission_completed: {
    icon: <CheckCircle size={12} strokeWidth={2.5} />,
    bg: "rgba(59,105,52,0.12)",
    color: "#3b6934",
  },
  mission_filled: {
    icon: <UserCheck size={12} strokeWidth={2.5} />,
    bg: "rgba(45,90,39,0.12)",
    color: "#2d5a27",
  },
  mission_cancelled: {
    icon: <AlertCircle size={12} strokeWidth={2.5} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
  },
  review_request: {
    icon: <Star size={12} strokeWidth={2.5} />,
    bg: "rgba(255,152,0,0.12)",
    color: "#ff9800",
  },
  mission_report: {
    icon: <Flag size={12} strokeWidth={2.5} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
  },
};

// ─── Fonction utilitaire pour obtenir la configuration ──────────────────────

function getIconConfig(type: MissionNotificationType) {
  return (
    iconConfig[type] ?? {
      icon: <Bell size={12} strokeWidth={2.5} />,
      bg: "rgba(114,121,110,0.1)",
      color: "#72796e",
    }
  );
}

// ─── Composant Notification Item ────────────────────────────────────────────

interface MissionNotificationItemProps {
  notification: MissionNotification;
  onRead?: () => void;
}

export function MissionNotificationItem({
  notification,
  onRead,
}: MissionNotificationItemProps) {
  const router = useRouter();
  const { markAsRead } = useMissionNotifications();

  const handleClick = async () => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
      onRead?.();
    }
    router.push(missionNotificationService.resolveUrl(notification));
  };

  // ✅ Typer correctement le type de notification
  const notificationType = notification.type as MissionNotificationType;
  const cfg = getIconConfig(notificationType);
  const isRead = !!notification.read_at;
  const iconEmoji = missionNotificationService.iconFor(notificationType);

  return (
    <div
      onClick={handleClick}
      className="flex items-start gap-3 px-3 sm:px-5 py-3 sm:py-4 cursor-pointer transition-all duration-150 hover:bg-[#f3f4ed] active:bg-[#eaf3de]"
      style={{
        borderBottom: "1px solid rgba(194,201,187,0.28)",
        background: isRead ? "transparent" : "rgba(188,240,174,0.12)",
      }}
      onMouseEnter={(e) => {
        if (isRead) {
          (e.currentTarget as HTMLElement).style.background = "#f3f4ed";
        } else {
          (e.currentTarget as HTMLElement).style.background =
            "rgba(188,240,174,0.2)";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = isRead
          ? "transparent"
          : "rgba(188,240,174,0.12)";
      }}
    >
      {/* Icône */}
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center"
          style={{ background: cfg.bg }}
        >
          <span className="text-lg">{iconEmoji}</span>
        </div>

        {/* Badge icône */}
        <span
          className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full border-2 shadow-sm"
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
          className="text-xs sm:text-sm leading-relaxed sm:leading-snug"
          style={{
            color: isRead ? "#42493e" : "#191c18",
            fontWeight: isRead ? 400 : 500,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {notification.data.message ||
            notification.data.body ||
            "Notification"}
        </p>

        {notification.data.mission_title && (
          <p
            className="text-[10px] sm:text-xs mt-0.5 truncate"
            style={{ color: "#72796e" }}
          >
            📌 {notification.data.mission_title}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          <TimeAgo
            date={notification.created_at}
            className="text-[10px] sm:text-xs"
          />
          <span
            className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: "rgba(194,201,187,0.2)",
              color: "#72796e",
            }}
          >
            {missionNotificationService.labelFor(notificationType)}
          </span>
        </div>
      </div>

      {/* Dot non-lu */}
      {!isRead && (
        <div
          className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full flex-shrink-0 mt-1.5"
          style={{ background: "#2d5a27" }}
        />
      )}
    </div>
  );
}

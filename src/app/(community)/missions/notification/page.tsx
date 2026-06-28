"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell,
  Check,
  Trash2,
  Loader2,
  ArrowLeft,
  Briefcase,
  Calendar,
  User,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Star,
  Flag,
  MessageCircle,
  Filter,
  X,
} from "lucide-react";
import { useMissionNotifications } from "@/hooks/notifications/useMissionNotifications";
import { missionNotificationService } from "@/services/mission/notification.service";
import {
  MissionNotification,
  MissionNotificationType,
} from "@/lib/missions/notification.type";
import { formatDistanceToNow, format } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";

// ─── Configuration des icônes ────────────────────────────────────────────────

const ICON_CONFIG: Record<
  MissionNotificationType,
  { icon: React.ReactNode; bg: string; color: string; label: string }
> = {
  new_mission: {
    icon: <Briefcase size={16} strokeWidth={2} />,
    bg: "rgba(21,66,18,0.12)",
    color: "#154212",
    label: "Nouvelle mission",
  },
  new_application: {
    icon: <Users size={16} strokeWidth={2} />,
    bg: "rgba(45,90,39,0.12)",
    color: "#2d5a27",
    label: "Nouvelle candidature",
  },
  application_accepted: {
    icon: <CheckCircle size={16} strokeWidth={2} />,
    bg: "rgba(59,105,52,0.12)",
    color: "#3b6934",
    label: "Candidature acceptée",
  },
  application_rejected: {
    icon: <XCircle size={16} strokeWidth={2} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
    label: "Candidature refusée",
  },
  application_withdrawn: {
    icon: <User size={16} strokeWidth={2} />,
    bg: "rgba(128,85,51,0.12)",
    color: "#805533",
    label: "Candidature retirée",
  },
  mission_reminder: {
    icon: <Clock size={16} strokeWidth={2} />,
    bg: "rgba(255,152,0,0.12)",
    color: "#ff9800",
    label: "Rappel de mission",
  },
  mission_updated: {
    icon: <AlertCircle size={16} strokeWidth={2} />,
    bg: "rgba(128,85,51,0.12)",
    color: "#805533",
    label: "Mission mise à jour",
  },
  mission_completed: {
    icon: <CheckCircle size={16} strokeWidth={2} />,
    bg: "rgba(59,105,52,0.12)",
    color: "#3b6934",
    label: "Mission terminée",
  },
  mission_filled: {
    icon: <Users size={16} strokeWidth={2} />,
    bg: "rgba(45,90,39,0.12)",
    color: "#2d5a27",
    label: "Mission pourvue",
  },
  mission_cancelled: {
    icon: <XCircle size={16} strokeWidth={2} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
    label: "Mission annulée",
  },
  review_request: {
    icon: <Star size={16} strokeWidth={2} />,
    bg: "rgba(255,152,0,0.12)",
    color: "#ff9800",
    label: "Demande d'avis",
  },
  mission_report: {
    icon: <Flag size={16} strokeWidth={2} />,
    bg: "rgba(186,26,26,0.12)",
    color: "#ba1a1a",
    label: "Mission signalée",
  },
};

// ─── Fonction timeAgo ────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    return "à l'instant";
  }
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "dd/MM/yyyy à HH:mm", { locale: fr });
  } catch {
    return dateStr;
  }
}

// ─── Composant Notification Item ─────────────────────────────────────────────

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  isMarking,
  isDeleting,
}: {
  notification: MissionNotification;
  onMarkAsRead: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  isMarking: boolean;
  isDeleting: boolean;
}) {
  const router = useRouter();
  const isRead = !!notification.read_at;
  const config = ICON_CONFIG[notification.type as MissionNotificationType] ?? {
    icon: <Bell size={16} strokeWidth={2} />,
    bg: "rgba(114,121,110,0.1)",
    color: "#72796e",
    label: "Notification",
  };

  const handleClick = () => {
    if (!isRead) {
      onMarkAsRead(notification.id);
    }
    router.push(missionNotificationService.resolveUrl(notification));
  };

  return (
    <div
      onClick={handleClick}
      className={`
        group flex items-start gap-4 px-4 sm:px-6 py-4 
        border-b border-[#c2c9bb]/20 
        cursor-pointer transition-all duration-200
        hover:bg-[#f9faf2]
        ${!isRead ? "bg-[#eaf3de]/20" : ""}
      `}
    >
      {/* Icône */}
      <div
        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: config.bg }}
      >
        <span style={{ color: config.color }}>{config.icon}</span>
      </div>

      {/* Contenu */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p
              className={`
                text-sm leading-snug
                ${!isRead ? "font-semibold text-[#191c18]" : "text-[#42493e]"}
              `}
            >
              {notification.data.title || config.label}
            </p>

            {notification.data.body && (
              <p className="text-sm text-[#72796e] mt-1 leading-relaxed">
                {notification.data.body}
              </p>
            )}

            {notification.data.mission_title && (
              <p className="text-xs text-[#a0a8a0] mt-1 truncate">
                📌 {notification.data.mission_title}
              </p>
            )}

            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] text-[#a8b0a0]">
                {timeAgo(notification.created_at)}
              </span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#f3f4ed] text-[#72796e]">
                {config.label}
              </span>
              {!isRead && (
                <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#154212] text-[#bcf0ae]">
                  Non lu
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            {!isRead && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMarkAsRead(notification.id);
                }}
                disabled={isMarking}
                className="p-1.5 text-[#72796e] hover:text-[#154212] hover:bg-[#f3f4ed] rounded-lg transition-colors disabled:opacity-50"
                title="Marquer comme lu"
              >
                <Check size={14} strokeWidth={2} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(notification.id);
              }}
              disabled={isDeleting}
              className="p-1.5 text-[#72796e] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Supprimer"
            >
              <Trash2 size={14} strokeWidth={2} />
            </button>
          </div>
        </div>
      </div>

      {/* Indicateur non-lu */}
      {!isRead && (
        <div className="w-2 h-2 rounded-full bg-[#154212] flex-shrink-0 mt-2" />
      )}
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function NotificationSkeleton() {
  return (
    <div className="flex items-start gap-4 px-4 sm:px-6 py-4 border-b border-[#c2c9bb]/20 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-[#e7e9e1] flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-[#e7e9e1] rounded w-3/4" />
        <div className="h-3 bg-[#edefe7] rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-2 bg-[#edefe7] rounded w-20" />
          <div className="h-2 bg-[#edefe7] rounded w-16" />
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal ─────────────────────────────────────────────────────

export default function MissionsNotificationsPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [selectedType, setSelectedType] = useState<
    MissionNotificationType | "all"
  >("all");

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAsReadLoading,
    markAllAsRead,
    markAllAsReadLoading,
    remove,
    removeLoading,
    refetch,
  } = useMissionNotifications({ per_page: 50 });

  // Filtrer les notifications
  const filteredNotifications = notifications.filter((notif) => {
    const isRead = !!notif.read_at;
    if (filter === "unread" && isRead) return false;
    if (filter === "read" && !isRead) return false;
    if (selectedType !== "all" && notif.type !== selectedType) return false;
    return true;
  });

  const hasNotifications =
    filteredNotifications && filteredNotifications.length > 0;

  // Types disponibles
  const availableTypes = Array.from(
    new Set(notifications.map((n) => n.type)),
  ) as MissionNotificationType[];

  const handleMarkAsRead = (id: string | number) => {
    markAsRead(id);
  };

  const handleDelete = (id: string | number) => {
    if (confirm("Supprimer cette notification ?")) {
      remove(id);
    }
  };

  const handleMarkAllRead = () => {
    if (unreadCount > 0) {
      markAllAsRead();
    }
  };

  return (
    <div className="min-h-screen bg-[#f9faf2]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* ─── Header ─── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-[#edefe7] rounded-xl transition-colors text-[#72796e]"
            >
              <ArrowLeft size={20} strokeWidth={1.8} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#191c18] flex items-center gap-3">
                <Briefcase
                  size={24}
                  className="text-[#154212]"
                  strokeWidth={2}
                />
                Notifications des missions
              </h1>
              <p className="text-sm text-[#72796e] mt-0.5">
                {unreadCount > 0
                  ? `${unreadCount} notification${unreadCount > 1 ? "s" : ""} non lue${unreadCount > 1 ? "s" : ""}`
                  : "Aucune notification non lue"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={markAllAsReadLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-[#154212] hover:bg-[#edefe7] rounded-xl transition-colors disabled:opacity-50"
            >
              {markAllAsReadLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Check size={16} strokeWidth={2} />
              )}
              Tout lire
            </button>
          )}
        </div>

        {/* ─── Filtres ─── */}
        <div className="bg-white rounded-2xl border border-[#c2c9bb]/20 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtre de statut */}
            <div className="flex items-center gap-1.5 bg-[#f3f4ed] rounded-xl p-1">
              {[
                { id: "all", label: "Toutes" },
                { id: "unread", label: "Non lues" },
                { id: "read", label: "Lues" },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id as typeof filter)}
                  className={`
                    px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                    ${
                      filter === f.id
                        ? "bg-white shadow-sm text-[#154212]"
                        : "text-[#72796e] hover:text-[#191c18]"
                    }
                  `}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="w-px h-6 bg-[#c2c9bb]/30" />

            {/* Filtre par type */}
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedType("all")}
                className={`
                  px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                  ${
                    selectedType === "all"
                      ? "bg-[#154212] text-[#bcf0ae]"
                      : "bg-[#f3f4ed] text-[#72796e] hover:text-[#191c18]"
                  }
                `}
              >
                Tous
              </button>
              {availableTypes.map((type) => {
                const config = ICON_CONFIG[type];
                return (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`
                      flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all
                      ${
                        selectedType === type
                          ? "bg-[#154212] text-[#bcf0ae]"
                          : "bg-[#f3f4ed] text-[#72796e] hover:text-[#191c18]"
                      }
                    `}
                  >
                    <span
                      style={{
                        color:
                          selectedType === type ? "#bcf0ae" : config?.color,
                      }}
                    >
                      {config?.icon}
                    </span>
                    <span className="hidden sm:inline">
                      {config?.label || type}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Compteur */}
            <div className="ml-auto text-xs text-[#72796e]">
              {hasNotifications
                ? `${filteredNotifications.length} notification${filteredNotifications.length > 1 ? "s" : ""}`
                : "Aucune notification"}
            </div>
          </div>
        </div>

        {/* ─── Liste des notifications ─── */}
        <div className="bg-white rounded-2xl border border-[#c2c9bb]/20 overflow-hidden shadow-sm">
          {isLoading ? (
            <>
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </>
          ) : !hasNotifications ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="w-16 h-16 rounded-full bg-[#f3f4ed] flex items-center justify-center mb-4">
                <Bell size={28} className="text-[#c2c9bb]" strokeWidth={1.5} />
              </div>
              <h3 className="text-base font-semibold text-[#42493e]">
                Aucune notification
              </h3>
              <p className="text-sm text-[#72796e] mt-1 max-w-sm">
                {filter !== "all"
                  ? "Aucune notification ne correspond à vos filtres"
                  : "Vous n'avez pas encore de notifications pour les missions"}
              </p>
              {filter !== "all" && (
                <button
                  onClick={() => setFilter("all")}
                  className="mt-4 px-4 py-2 text-sm font-medium text-[#154212] hover:bg-[#f3f4ed] rounded-xl transition-colors"
                >
                  Voir toutes les notifications
                </button>
              )}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={handleMarkAsRead}
                onDelete={handleDelete}
                isMarking={markAsReadLoading}
                isDeleting={removeLoading}
              />
            ))
          )}
        </div>

        {/* ─── Footer ─── */}
        <div className="mt-6 text-center text-xs text-[#a0a8a0]">
          <button
            onClick={() => refetch()}
            className="text-[#72796e] hover:text-[#154212] transition-colors"
          >
            Rafraîchir
          </button>
          <span className="mx-2">·</span>
          <span>
            {notifications.length} notification
            {notifications.length > 1 ? "s" : ""} au total
          </span>
        </div>
      </div>
    </div>
  );
}

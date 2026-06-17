"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useNotifications,
  useUnreadCount,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
} from "@/hooks/notifications/useNotification";
import {
  notificationService,
  AppNotification,
} from "@/services/notification.service";

const TYPE_ICONS: Record<string, string> = {
  new_mission: "📋",
  new_application: "📬",
  application_accepted: "🎉",
  application_rejected: "📝",
  mission_reminder: "⏰",
  mission_updated: "✏️",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "à l'instant";
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: unreadCount } = useUnreadCount();
  const { data, isLoading } = useNotifications({ per_page: 15 });
  const markAsRead = useMarkNotificationAsRead();
  const markAllAsRead = useMarkAllNotificationsAsRead();
  const deleteNotification = useDeleteNotification();

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = (notification: AppNotification) => {
    if (!notification.read_at) {
      markAsRead.mutate(notification.id);
    }
    setOpen(false);
    router.push(notificationService.resolveUrl(notification));
  };

  const notifications = data?.data ?? [];
  const count = unreadCount ?? 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 hover:bg-[#edefe7] rounded-full transition-colors text-[#42493e]"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[70vh] overflow-hidden bg-white border border-[#c2c9bb]/30 rounded-2xl shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#c2c9bb]/20 bg-[#f3f4ed]">
            <h3 className="font-[Plus_Jakarta_Sans] font-semibold text-[#191c18] text-sm">
              Notifications
            </h3>
            {count > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-[10px] font-semibold text-[#154212] hover:underline"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div
            className="overflow-y-auto flex-1"
            style={{ scrollbarWidth: "none" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-[#154212]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <Bell size={28} className="text-[#c2c9bb] mb-2" />
                <p className="text-sm text-[#72796e]">
                  Aucune notification pour le moment
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-[#f3f4ed] cursor-pointer hover:bg-[#f9faf2] transition-colors ${
                    !notification.read_at ? "bg-[#eaf3de]/40" : ""
                  }`}
                >
                  <span className="text-lg shrink-0">
                    {TYPE_ICONS[notification.data.type] ?? "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#191c18] font-medium leading-snug">
                      {notification.data.title ??
                        notificationService.labelFor(notification.data.type)}
                    </p>
                    {notification.data.body && (
                      <p className="text-xs text-[#72796e] mt-0.5 line-clamp-2">
                        {notification.data.body}
                      </p>
                    )}
                    <p className="text-[10px] text-[#a8b0a0] mt-1">
                      {timeAgo(notification.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!notification.read_at && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead.mutate(notification.id);
                        }}
                        className="p-1 text-[#72796e] hover:text-[#154212] hover:bg-[#f3f4ed] rounded"
                        title="Marquer comme lu"
                      >
                        <Check size={12} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification.mutate(notification.id);
                      }}
                      className="p-1 text-[#72796e] hover:text-red-500 hover:bg-red-50 rounded"
                      title="Supprimer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

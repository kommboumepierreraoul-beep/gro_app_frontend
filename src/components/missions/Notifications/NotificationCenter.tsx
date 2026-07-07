/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { Bell, Check, Trash2, Loader2, X, Briefcase } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMissionNotifications } from "@/hooks/notifications/useMissionNotifications";
import { missionNotificationService } from "@/services/mission/notification.service";
import { MissionNotification } from "@/lib/missions/notification.type";
import { useI18n } from "@/i18n/LanguageProvider";
import { formatRelativeTime } from "@/lib/i18n-date";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MissionNotificationCenterProps {
  className?: string;
}

// ─── Fonction timeAgo ────────────────────────────────────────────────────────

// ─── Composant principal ─────────────────────────────────────────────────────

export default function MissionNotificationCenter({
  className = "",
}: MissionNotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { locale } = useI18n();

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
  } = useMissionNotifications({ per_page: 20 });

  // Fermer au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Fermer au clic sur la touche Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleClick = (notification: MissionNotification) => {
    if (!notification.read_at) {
      markAsRead(notification.id);
    }
    setOpen(false);
    router.push(missionNotificationService.resolveUrl(notification));
  };

  const handleMarkAsRead = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleDelete = (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    remove(id);
  };

  const count = unreadCount ?? 0;
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <div className={`relative ${className}`} ref={ref}>
      {/* ── Bouton d'ouverture ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2.5 hover:bg-[#edefe7] rounded-full transition-colors text-[#42493e]"
        aria-label="Notifications des missions"
      >
        <Bell size={20} strokeWidth={1.8} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-h-[70vh] overflow-hidden bg-white border border-[#c2c9bb]/30 rounded-2xl shadow-xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#c2c9bb]/20 bg-[#f3f4ed] rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Briefcase
                size={16}
                className="text-[#154212]"
                strokeWidth={1.8}
              />
              <h3 className="font-semibold text-sm text-[#191c18]">Missions</h3>
              {count > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-[#154212] text-[#bcf0ae] rounded-full">
                  {count}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {count > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  disabled={markAllAsReadLoading}
                  className="text-[10px] font-semibold text-[#154212] hover:text-[#2d5a27] transition-colors disabled:opacity-50"
                >
                  {markAllAsReadLoading ? "..." : "Tout lire"}
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 hover:bg-[#e7e9e1] rounded-full transition-colors text-[#72796e]"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* ── Contenu ── */}
          <div
            className="overflow-y-auto flex-1"
            style={{ scrollbarWidth: "thin" }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-[#154212]" />
              </div>
            ) : !hasNotifications ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#f3f4ed] flex items-center justify-center mb-3">
                  <Bell
                    size={20}
                    className="text-[#c2c9bb]"
                    strokeWidth={1.5}
                  />
                </div>
                <p className="text-sm font-medium text-[#42493e]">
                  Aucune notification de mission
                </p>
                <p className="text-xs text-[#72796e] mt-1">
                  Les notifications des missions apparaîtront ici
                </p>
              </div>
            ) : (
              notifications.map((notification) => {
                const isRead = !!notification.read_at;
                const icon = missionNotificationService.iconFor(
                  notification.type as any,
                );
                const label = missionNotificationService.labelFor(
                  notification.type as any,
                );

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleClick(notification)}
                    className={`
                      group flex items-start gap-3 px-4 py-3 
                      border-b border-[#f3f4ed] 
                      cursor-pointer transition-all duration-150
                      hover:bg-[#f9faf2]
                      ${!isRead ? "bg-[#eaf3de]/30" : ""}
                    `}
                  >
                    {/* Icône */}
                    <div className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center bg-[#f3f4ed]">
                      <span className="text-base">{icon}</span>
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <p
                          className={`
                          text-sm leading-snug flex-1
                          ${!isRead ? "font-semibold text-[#191c18]" : "text-[#42493e]"}
                        `}
                        >
                          {notification.data.title || label}
                        </p>
                      </div>

                      {notification.data.body && (
                        <p className="text-xs text-[#72796e] mt-0.5 line-clamp-2">
                          {notification.data.body}
                        </p>
                      )}

                      {notification.data.mission_title && (
                        <p className="text-[10px] text-[#a0a8a0] mt-0.5 truncate">
                          📌 {notification.data.mission_title}
                        </p>
                      )}

                      <p className="text-[10px] text-[#a8b0a0] mt-1">
                        {formatRelativeTime(notification.created_at, locale)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, notification.id)}
                          disabled={markAsReadLoading}
                          className="p-1.5 text-[#72796e] hover:text-[#154212] hover:bg-[#f3f4ed] rounded-lg transition-colors disabled:opacity-50"
                          title="Marquer comme lu"
                        >
                          <Check size={14} strokeWidth={2} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(e, notification.id)}
                        disabled={removeLoading}
                        className="p-1.5 text-[#72796e] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <Trash2 size={14} strokeWidth={2} />
                      </button>
                    </div>

                    {/* Indicateur non-lu */}
                    {!isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#154212] flex-shrink-0 mt-2" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Footer ── */}
          {hasNotifications && (
            <div className="border-t border-[#c2c9bb]/20 px-4 py-2.5 bg-[#f9faf2] rounded-b-2xl">
              <button
                onClick={() => {
                  setOpen(false);
                  router.push("/notifications?tab=missions");
                }}
                className="w-full text-center text-xs font-medium text-[#72796e] hover:text-[#154212] transition-colors"
              >
                Voir toutes les notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

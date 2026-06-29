/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState } from "react";
import { NotificationItem } from "@/components/community/notifications/NotificationItem";
import { MissionNotificationItem } from "@/components/community/notifications/MissionNotificationItem";
import { useNotifications } from "@/hooks/community/useNotifications";
import { useMissionNotifications } from "@/hooks/notifications/useMissionNotifications";
import { Bell, CheckCheck, Briefcase, Users } from "lucide-react";

type TabType = "all" | "community" | "missions";

export default function NotificationsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  // ── Community Notifications ──────────────────────────────────────────────
  const {
    notifications: communityNotifs,
    isLoading: communityLoading,
    unreadCount: communityUnread,
    markAllRead: markCommunityAllRead, // ✅ Nom correct
    markAllReadLoading: markCommunityAllReadLoading, // ✅ Loading correct
  } = useNotifications();

  // ── Mission Notifications ─────────────────────────────────────────────────
  const {
    notifications: missionNotifs,
    isLoading: missionLoading,
    unreadCount: missionUnread,
    markAllAsRead: markMissionAllRead,
    markAllAsReadLoading: markMissionAllReadLoading,
  } = useMissionNotifications();

  const isLoading = communityLoading || missionLoading;

  // ── Combiner les notifications pour l'onglet "all" ───────────────────────
  const allNotifications = [
    ...communityNotifs.map((n: any) => ({
      ...n,
      source: "community" as const,
    })),
    ...missionNotifs.map((n: any) => ({ ...n, source: "missions" as const })),
  ].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  // ── Obtenir le nombre de non-lues selon l'onglet ─────────────────────────
  const getUnreadCount = () => {
    if (activeTab === "community") return communityUnread;
    if (activeTab === "missions") return missionUnread;
    return communityUnread + missionUnread;
  };

  // ── Obtenir les notifications selon l'onglet ─────────────────────────────
  const getNotifications = () => {
    if (activeTab === "community") return communityNotifs;
    if (activeTab === "missions") return missionNotifs;
    return allNotifications;
  };

  const unreadCount = getUnreadCount();
  const notifications = getNotifications();

  // ── Marquer tout comme lu ─────────────────────────────────────────────────
  const handleMarkAllRead = () => {
    if (activeTab === "community") {
      markCommunityAllRead();
    } else if (activeTab === "missions") {
      markMissionAllRead();
    } else {
      markCommunityAllRead();
      markMissionAllRead();
    }
  };

  const isMarkAllLoading =
    markCommunityAllReadLoading || markMissionAllReadLoading;

  // ── Rendu du skeleton ─────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div
        className="overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(194,201,187,0.4)",
        }}
      >
        {/* Header skeleton */}
        <div
          className="px-5 py-4"
          style={{ borderBottom: "1px solid rgba(194,201,187,0.35)" }}
        >
          <div
            className="h-5 rounded-full w-36 animate-pulse"
            style={{ background: "#e7e9e1" }}
          />
        </div>
        <div
          className="space-y-0 divide-y"
          style={{ borderColor: "rgba(194,201,187,0.28)" }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex gap-3 px-5 py-4 animate-pulse">
              <div
                className="w-11 h-11 rounded-full flex-shrink-0"
                style={{ background: "#e7e9e1" }}
              />
              <div className="flex-1 space-y-2 pt-1">
                <div
                  className="h-3 rounded-full w-3/4"
                  style={{ background: "#e7e9e1" }}
                />
                <div
                  className="h-2 rounded-full w-1/2"
                  style={{ background: "#edefe7" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Rendu principal ──────────────────────────────────────────────────────
  return (
    <div
      className="overflow-hidden"
      style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(194,201,187,0.4)",
        boxShadow: "0 2px 16px rgba(21,66,18,0.05)",
      }}
    >
      {/* Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4"
        style={{
          borderBottom: "1px solid rgba(194,201,187,0.35)",
          background:
            "linear-gradient(135deg, rgba(188,240,174,0.15) 0%, transparent 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(45,90,39,0.1)" }}
          >
            <Bell size={17} style={{ color: "#2d5a27" }} strokeWidth={1.8} />
          </div>
          <div>
            <h1
              className="font-bold text-base"
              style={{
                color: "#154212",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >
              Notifications
            </h1>
            {unreadCount > 0 && (
              <p
                className="text-xs mt-0.5 font-medium"
                style={{ color: "#2d5a27" }}
              >
                {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            disabled={isMarkAllLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 disabled:opacity-50"
            style={{
              background: "rgba(45,90,39,0.08)",
              color: "#2d5a27",
              border: "1px solid rgba(45,90,39,0.18)",
              fontFamily: "'Inter', sans-serif",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(45,90,39,0.15)")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLElement).style.background =
                "rgba(45,90,39,0.08)")
            }
          >
            <CheckCheck size={13} />
            {isMarkAllLoading ? "..." : "Tout marquer comme lu"}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div
        className="flex px-5 pt-2 border-b"
        style={{ borderColor: "rgba(194,201,187,0.2)" }}
      >
        {[
          { id: "all" as TabType, label: "Toutes", icon: Bell },
          {
            id: "community" as TabType,
            label: "Communauté",
            icon: Users,
          },
          {
            id: "missions" as TabType,
            label: "Missions",
            icon: Briefcase,
          },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const count =
            tab.id === "all"
              ? communityUnread + missionUnread
              : tab.id === "community"
                ? communityUnread
                : missionUnread;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all relative"
              style={{
                color: isActive ? "#154212" : "#72796e",
                borderBottom: isActive
                  ? "2px solid #154212"
                  : "2px solid transparent",
              }}
            >
              <tab.icon size={14} strokeWidth={isActive ? 2 : 1.8} />
              {tab.label}
              {count > 0 && (
                <span
                  className="ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded-full"
                  style={{
                    background: isActive
                      ? "rgba(21,66,18,0.12)"
                      : "rgba(194,201,187,0.3)",
                    color: isActive ? "#154212" : "#72796e",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{
              background:
                "linear-gradient(135deg, rgba(188,240,174,0.3) 0%, rgba(244,187,146,0.15) 100%)",
              border: "1px solid rgba(194,201,187,0.4)",
            }}
          >
            {activeTab === "missions" ? (
              <Briefcase
                size={26}
                style={{ color: "#72796e" }}
                strokeWidth={1.5}
              />
            ) : (
              <Bell size={26} style={{ color: "#72796e" }} strokeWidth={1.5} />
            )}
          </div>
          <p
            className="font-semibold mb-1"
            style={{
              color: "#42493e",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
          >
            Aucune notification
          </p>
          <p className="text-sm" style={{ color: "#72796e" }}>
            {activeTab === "missions"
              ? "Aucune notification de mission pour le moment."
              : activeTab === "community"
                ? "Aucune notification communautaire pour le moment."
                : "Vous êtes à jour ! Les nouvelles activités apparaîtront ici."}
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notif: any) => {
            if (activeTab === "missions" || notif.source === "missions") {
              return (
                <MissionNotificationItem key={notif.id} notification={notif} />
              );
            }
            return <NotificationItem key={notif.id} notif={notif} />;
          })}
        </div>
      )}
    </div>
  );
}

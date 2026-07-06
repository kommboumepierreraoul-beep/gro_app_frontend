/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  Briefcase,
  CheckCircle2,
  CheckCheck,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { MissionNotificationItem } from "@/components/community/notifications/MissionNotificationItem";
import { NotificationItem } from "@/components/community/notifications/NotificationItem";
import { PushNotificationModal } from "@/components/marketplace/PushNotificationModal";
import { useNotifications } from "@/hooks/community/useNotifications";
import { useMissionNotifications } from "@/hooks/notifications/useMissionNotifications";
import api from "@/lib/axios";

type TabType = "all" | "app" | "community" | "missions";
type ReadFilter = "all" | "unread" | "read";

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const [readFilter, setReadFilter] = useState<ReadFilter>("all");
  const [search, setSearch] = useState("");

  const {
    data: appNotificationData,
    isLoading: appLoading,
    refetch: refetchApp,
  } = useQuery({
    queryKey: ["app-notifications"],
    queryFn: async () => {
      const { data } = await api.get("/notifications");

      return {
        notifications: (data.notifications ?? []).map((item: any) => ({
          ...item,
          source: "app" as const,
          is_read: Boolean(item.read || item.read_at),
          data: {
            title: item.title,
            body: item.message,
            type: item.type,
            url: item.url,
          },
          message: item.message || item.title || "Nouvelle notification",
        })),
        unreadCount: Number(data.unread_count ?? 0),
      };
    },
    refetchInterval: 30000,
    retry: false,
  });

  const markAppAllRead = useMutation({
    mutationFn: () => api.post("/notifications/mark-all-read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["app-notifications-unread-count"],
      });
    },
  });

  const markAppRead = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["app-notifications"] });
      queryClient.invalidateQueries({
        queryKey: ["app-notifications-unread-count"],
      });
    },
  });

  const {
    notifications: communityNotifs,
    isLoading: communityLoading,
    unreadCount: communityUnread,
    markAllRead: markCommunityAllRead,
    markAllReadLoading: markCommunityAllReadLoading,
    refetch: refetchCommunity,
  } = useNotifications();

  const {
    notifications: missionNotifs,
    isLoading: missionLoading,
    unreadCount: missionUnread,
    markAllAsRead: markMissionAllRead,
    markAllAsReadLoading: markMissionAllReadLoading,
    refetch: refetchMissions,
  } = useMissionNotifications();

  const appNotifs = useMemo(
    () => appNotificationData?.notifications ?? [],
    [appNotificationData?.notifications],
  );
  const appUnread = appNotificationData?.unreadCount ?? 0;

  const allNotifications = useMemo(
    () =>
      [
        ...appNotifs,
        ...communityNotifs.map((item: any) => ({
          ...item,
          source: "community" as const,
        })),
        ...missionNotifs.map((item: any) => ({
          ...item,
          source: "missions" as const,
        })),
      ].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [appNotifs, communityNotifs, missionNotifs],
  );

  const baseNotifications =
    activeTab === "app"
      ? appNotifs
      : activeTab === "community"
      ? communityNotifs
      : activeTab === "missions"
        ? missionNotifs
        : allNotifications;

  const notifications = baseNotifications.filter((item: any) => {
    const isRead = Boolean(item.is_read || item.read_at);
    const text = `${item.message ?? ""} ${item.data?.title ?? ""} ${item.data?.body ?? ""}`.toLowerCase();

    if (readFilter === "unread" && isRead) return false;
    if (readFilter === "read" && !isRead) return false;
    if (search.trim() && !text.includes(search.trim().toLowerCase())) {
      return false;
    }

    return true;
  });

  const unreadCount =
    activeTab === "app"
      ? appUnread
      : activeTab === "community"
      ? communityUnread
      : activeTab === "missions"
        ? missionUnread
        : appUnread + communityUnread + missionUnread;

  const isLoading = appLoading || communityLoading || missionLoading;
  const isMarkAllLoading =
    markAppAllRead.isPending ||
    markCommunityAllReadLoading ||
    markMissionAllReadLoading;

  const markAllRead = () => {
    if (activeTab === "app") {
      markAppAllRead.mutate();
      return;
    }

    if (activeTab === "community") {
      markCommunityAllRead();
      return;
    }

    if (activeTab === "missions") {
      markMissionAllRead();
      return;
    }

    markAppAllRead.mutate();
    markCommunityAllRead();
    markMissionAllRead();
  };

  const refresh = () => {
    refetchApp();
    refetchCommunity();
    refetchMissions();
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf3de] text-[#154212]">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#3b6934]">
                Centre communautaire
              </p>
              <h1 className="mt-1 text-2xl font-black text-[#191c18]">
                Notifications
              </h1>
              <p className="mt-1 text-sm leading-6 text-[#72796e]">
                Suivez vos interactions, missions, commandes, paiements,
                produits et alertes de moderation.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <PushNotificationModal variant="icon" />
            <button
              onClick={refresh}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-[#c2c9bb]/50 bg-white px-3 text-sm font-bold text-[#42493e] transition hover:bg-[#eaf3de]"
            >
              <RefreshCw className="h-4 w-4" />
              Actualiser
            </button>
            <button
              onClick={markAllRead}
              disabled={unreadCount === 0 || isMarkAllLoading}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#154212] px-3 text-sm font-bold text-white transition hover:bg-[#2d5a27] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CheckCheck className="h-4 w-4" />
              Tout lire
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <Metric icon={Bell} label="Non lues" value={String(unreadCount)} />
        <Metric icon={ShieldCheck} label="Systeme" value={String(appUnread)} />
        <Metric icon={Users} label="Communaute" value={String(communityUnread)} />
        <Metric icon={Briefcase} label="Missions" value={String(missionUnread)} />
      </section>

      <section className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 shadow-sm">
        <div className="border-b border-[#c2c9bb]/35 p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Toutes", icon: Bell },
                { id: "app", label: "Systeme", icon: ShieldCheck },
                { id: "community", label: "Communaute", icon: Users },
                { id: "missions", label: "Missions", icon: Briefcase },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                      active
                        ? "bg-[#154212] text-white"
                        : "bg-[#f9faf2] text-[#42493e] hover:bg-[#eaf3de] hover:text-[#154212]"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative min-w-0 sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#72796e]" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Rechercher une notification..."
                  className="h-10 w-full rounded-xl border border-[#c2c9bb]/50 bg-white pl-9 pr-3 text-sm outline-none focus:border-[#154212] focus:ring-2 focus:ring-[#bcf0ae]/35"
                />
              </div>
              <select
                value={readFilter}
                onChange={(event) =>
                  setReadFilter(event.target.value as ReadFilter)
                }
                className="h-10 rounded-xl border border-[#c2c9bb]/50 bg-white px-3 text-sm font-semibold text-[#42493e] outline-none focus:border-[#154212] focus:ring-2 focus:ring-[#bcf0ae]/35"
              >
                <option value="all">Toutes</option>
                <option value="unread">Non lues</option>
                <option value="read">Lues</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="divide-y divide-[#c2c9bb]/25">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex animate-pulse gap-3 p-4">
                <div className="h-11 w-11 rounded-full bg-[#e7e9e1]" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="h-3 w-3/4 rounded-full bg-[#e7e9e1]" />
                  <div className="h-2 w-1/2 rounded-full bg-[#edefe7]" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#c2c9bb]/40 bg-[#eaf3de] text-[#154212]">
              <Bell className="h-7 w-7" />
            </div>
            <p className="mt-4 font-black text-[#191c18]">
              Aucune notification
            </p>
            <p className="mt-1 max-w-md text-sm leading-6 text-[#72796e]">
              Les nouvelles activites apparaitront ici. Activez les push pour
              recevoir les alertes meme quand la page est fermee.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#c2c9bb]/25">
            {notifications.map((notification: any) =>
              activeTab === "missions" || notification.source === "missions" ? (
                <MissionNotificationItem
                  key={`mission-${notification.id}`}
                  notification={notification}
                />
              ) : activeTab === "app" || notification.source === "app" ? (
                <AppNotificationItem
                  key={`app-${notification.id}`}
                  notification={notification}
                  onRead={(id) => markAppRead.mutate(id)}
                />
              ) : (
                <NotificationItem
                  key={`community-${notification.id}`}
                  notif={notification}
                />
              ),
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function AppNotificationItem({
  notification,
  onRead,
}: {
  notification: any;
  onRead: (id: string) => void;
}) {
  const router = useRouter();
  const isRead = Boolean(notification.is_read || notification.read);
  const title = notification.title || notification.data?.title || "AgriPulse";
  const message =
    notification.message || notification.data?.body || "Nouvelle notification";

  const openNotification = () => {
    if (!isRead) {
      onRead(notification.id);
    }

    router.push(notification.url || notification.data?.url || "/notifications");
  };

  return (
    <button
      onClick={openNotification}
      className={`flex w-full gap-3 p-4 text-left transition hover:bg-[#eaf3de]/55 ${
        isRead ? "bg-white" : "bg-[#f3f8ec]"
      }`}
    >
      <div className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-[#154212] ring-1 ring-[#c2c9bb]/50">
        {isRead ? (
          <CheckCircle2 className="h-5 w-5" />
        ) : (
          <Bell className="h-5 w-5" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-bold text-[#191c18]">{title}</p>
          {!isRead && (
            <span className="h-2 w-2 rounded-full bg-[#ba1a1a]" />
          )}
        </div>
        <p className="mt-1 text-sm leading-6 text-[#72796e]">{message}</p>
        <p className="mt-2 text-xs font-semibold text-[#8b9386]">
          {new Date(notification.created_at).toLocaleString("fr-FR")}
        </p>
      </div>
    </button>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-[#c2c9bb]/45 bg-white/85 p-4 shadow-sm">
      <Icon className="h-5 w-5 text-[#154212]" />
      <p className="mt-3 text-xs font-bold uppercase tracking-wider text-[#72796e]">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-[#191c18]">{value}</p>
    </div>
  );
}

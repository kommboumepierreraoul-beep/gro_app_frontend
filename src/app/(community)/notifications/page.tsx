/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { NotificationItem } from "@/components/community/notifications/NotificationItem";
import { useNotifications } from "@/hooks/community/useNotifications";
import { Bell, CheckCheck } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, isLoading, unreadCount, markAllRead } =
    useNotifications();

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
        className="flex items-center justify-between px-5 py-4"
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
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
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
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Empty state */}
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
            <Bell size={26} style={{ color: "#72796e" }} strokeWidth={1.5} />
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
            Vous êtes à jour ! Les nouvelles activités apparaîtront ici.
          </p>
        </div>
      ) : (
        <div>
          {notifications.map((notif: any) => (
            <NotificationItem key={notif.id} notif={notif} />
          ))}
        </div>
      )}
    </div>
  );
}

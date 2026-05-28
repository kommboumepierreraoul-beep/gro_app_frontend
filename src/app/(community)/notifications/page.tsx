"use client";
import { NotificationItem } from "@/components/community/notifications/NotificationItem";
import { useNotifications } from "@/hooks/community/useNotifications";

export default function NotificationsPage() {
  const { notifications, isLoading, unreadCount, markAllRead } =
    useNotifications();
     if (isLoading) {
    return (
      <div className="space-y-2 p-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 p-3 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/2" />
              <div className="h-2 bg-gray-100 rounded w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div>
          <h1 className="font-bold text-gray-900">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-xs text-blue-600 mt-0.5">
              {unreadCount} non lue(s)
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-6 text-center text-sm text-gray-400">
          Chargement...
        </div>
      ) : notifications.length === 0 ? (
        <div className="p-12 text-center">
          <p className="text-3xl mb-2">🔔</p>
          <p className="text-sm text-gray-400">Aucune notification</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {notifications.map((notif: any) => (
            <NotificationItem key={notif.id} notif={notif} />
          ))}
        </div>
      )}
    </div>
  );
}

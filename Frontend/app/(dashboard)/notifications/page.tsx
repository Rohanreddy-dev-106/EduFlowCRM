"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { type NotificationItem, useNotifications } from "@/hooks/useNotifications";

function isToday(dateValue?: string) {
  if (!dateValue) return false;
  const date = new Date(dateValue);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function getNotificationTone(type: string) {
  switch (type) {
    case "overdue_prospects":
      return { label: "O", color: "bg-red-100 text-red-600" };
    case "milestone":
      return { label: "M", color: "bg-green-100 text-green-600" };
    case "alert":
      return { label: "!", color: "bg-yellow-100 text-yellow-700" };
    default:
      return { label: "N", color: "bg-blue-100 text-blue-600" };
  }
}

function NotificationCard({
  notification,
  onMarkAsRead,
}: {
  notification: NotificationItem;
  onMarkAsRead: (notificationId: string) => void;
}) {
  const { label, color } = getNotificationTone(notification.type || "default");
  const title = notification.title || "Notification";
  const message = notification.message || "";
  const createdAt = notification.createdAt || new Date().toISOString();

  return (
    <div
      className={`rounded-lg border p-4 ${
        !notification.read ? "border-blue-200 bg-blue-50" : "border-gray-200 bg-white"
      } transition-shadow hover:shadow-md`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className={`rounded-lg p-3 text-lg ${color}`}>{label}</div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-600">{message}</p>
            </div>
            {!notification.read && <span className="h-2 w-2 rounded-full bg-blue-600 sm:ml-2 sm:mt-2" />}
          </div>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              {new Date(createdAt).toLocaleDateString()} at{" "}
              {new Date(createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {!notification.read && (
              <button
                onClick={() => onMarkAsRead(notification.id)}
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Check size={16} />
                Mark as read
              </button>
            )}
          </div>

          {notification.type === "overdue_prospects" && notification.metadata?.prospectIds && (
            <Link href="/dashboard" className="mt-3 inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
              View prospects in Kanban &rarr;
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { notifications, loading, markAsRead } = useNotifications();

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const todayNotifications = (notifications ?? []).filter((notification) => isToday(notification.createdAt));
  const earlierNotifications = (notifications ?? []).filter((notification) => !isToday(notification.createdAt));

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 py-4 sm:px-6 sm:py-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Notifications</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 sm:text-base">
          Stay updated with alerts about overdue prospects and important events
        </p>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-6">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Today</h2>
              <span className="text-xs text-gray-500">{todayNotifications.length} items</span>
            </div>

            {todayNotifications.length > 0 ? (
              <div className="space-y-3">
                {todayNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-500">
                No notifications created today.
              </div>
            )}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Earlier</h2>
              <span className="text-xs text-gray-500">{earlierNotifications.length} items</span>
            </div>

            {earlierNotifications.length > 0 ? (
              <div className="space-y-3">
                {earlierNotifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 py-8 text-center text-sm text-gray-500">
                No older notifications.
              </div>
            )}
          </section>
        </div>
      ) : (
        <div className="rounded-lg border border-gray-200 bg-gray-50 py-12 text-center">
          <div className="mb-4 text-5xl">🎉</div>
          <h2 className="mb-2 text-xl font-semibold text-gray-900">All caught up!</h2>
          <p className="px-4 text-gray-600">
            You have no notifications at the moment. Great job staying organized!
          </p>
        </div>
      )}

      {notifications && notifications.length > 0 && (
        <div className="flex justify-center pt-4">
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      )}
    </div>
  );
}

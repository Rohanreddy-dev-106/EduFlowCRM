"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/Button";
import { Check, Trash2 } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, loading, markAsRead } = useNotifications();

  const handleMarkAsRead = async (notificationId) => {
    await markAsRead(notificationId);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "overdue_prospects":
        return { emoji: "🔴", color: "bg-red-100 text-red-600" };
      case "milestone":
        return { emoji: "🎉", color: "bg-green-100 text-green-600" };
      case "alert":
        return { emoji: "⚠️", color: "bg-yellow-100 text-yellow-600" };
      default:
        return { emoji: "📢", color: "bg-blue-100 text-blue-600" };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">
          Stay updated with alerts about overdue prospects and important events
        </p>
      </div>

      {/* Notifications List */}
      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const { emoji, color } = getNotificationIcon(notification.type);
            return (
              <div
                key={notification.id}
                className={`border rounded-lg p-4 ${
                  !notification.read ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
                } hover:shadow-md transition-shadow`}
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`p-3 rounded-lg ${color} text-lg`}>{emoji}</div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {notification.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          {notification.message}
                        </p>
                      </div>
                      {!notification.read && (
                        <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                        {new Date(notification.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>

                      {/* Actions */}
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                          <Check size={16} />
                          Mark as read
                        </button>
                      )}
                    </div>

                    {/* Special handling for overdue prospects */}
                    {notification.type === "overdue_prospects" &&
                      notification.metadata?.prospectIds && (
                        <Link
                          href="/dashboard"
                          className="mt-3 inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                        >
                          View prospects in Kanban →
                        </Link>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-5xl mb-4">🎊</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            All caught up!
          </h2>
          <p className="text-gray-600">
            You have no notifications at the moment. Great job staying organized!
          </p>
        </div>
      )}

      {/* Footer Actions */}
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

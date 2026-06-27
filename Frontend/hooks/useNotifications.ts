import { useEffect, useState, useCallback } from "react";
import { apiCall } from "@/lib/api";

export type NotificationItem = {
  id: string;
  read?: boolean;
  type?: string;
  title?: string;
  message?: string;
  createdAt?: string;
  metadata?: {
    prospectIds?: string[];
  };
};

type NotificationsResponse = {
  success: boolean;
  data?: NotificationItem[];
  unreadCount?: number;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all notifications
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = (await apiCall("/notifications", {
        method: "GET",
      })) as NotificationsResponse;

      if (response.success) {
        setNotifications(response.data || []);
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to fetch notifications";
      console.error("Error fetching notifications:", err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const response = (await apiCall(`/notifications/${notificationId}/read`, {
        method: "PATCH",
      })) as NotificationsResponse;

      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  // Fetch unread count periodically
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = (await apiCall("/notifications/unread-count", {
        method: "GET",
      })) as NotificationsResponse;

      if (response.success) {
        setUnreadCount(response.unreadCount || 0);
      }
    } catch (err) {
      console.error("Error fetching unread count:", err);
    }
  }, []);

  // Poll the full list so new bell items appear without a manual refresh.
  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, fetchUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    fetchUnreadCount,
  };
}

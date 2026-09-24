import { useQuery, useMutation } from "../context/ConvexClientContext";
import { useAuth } from "./useAuth";

export const useNotifications = () => {
  const { token } = useAuth();
  const notifications = useQuery("notifications:list", { token }) || [];
  const markReadMutation = useMutation("notifications:markRead");
  const markAllReadMutation = useMutation("notifications:markAllRead");

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAsRead = async (notificationId) => {
    if (!token) return;
    return await markReadMutation({ token, notificationId });
  };

  const markAllAsRead = async () => {
    if (!token) return;
    return await markAllReadMutation({ token });
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
};

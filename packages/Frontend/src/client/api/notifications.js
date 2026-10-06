import api from "./axios";

/**
 * Customer notification API. Exported as ONE stable object so the bell
 * component can use it as an effect dependency without re-running.
 */
export const notificationApi = {
  list: () => api.get("/notifications"),
  unreadCount: () => api.get("/notifications/unread-count"),
  markRead: (id) => api.post(`/notifications/${id}/read`),
  markAllRead: () => api.post("/notifications/read-all"),
};

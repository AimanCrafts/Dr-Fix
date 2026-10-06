import api from "./axios";

/** Technician notification API (uses the technician token). */
export const notificationApi = {
  list: () => api.get("/technician/notifications"),
  unreadCount: () => api.get("/technician/notifications/unread-count"),
  markRead: (id) => api.post(`/technician/notifications/${id}/read`),
  markAllRead: () => api.post("/technician/notifications/read-all"),
};

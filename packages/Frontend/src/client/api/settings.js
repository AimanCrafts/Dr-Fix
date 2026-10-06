import api from "./axios";

/**
 * client/api/settings.js
 * ----------------------
 * Customer settings API. Uses the shared client axios instance
 * (client/api/axios.js), which already sends the "auth_token" and clears
 * the saved session on a 401.
 */
export const getSettings = () => api.get("/settings");

export const changePassword = (payload) =>
  api.put("/settings/password", payload);

export const updateNotifications = (emailNotifications) =>
  api.put("/settings/notifications", {
    email_notifications: emailNotifications,
  });

export const deactivateAccount = (payload) =>
  api.post("/settings/deactivate", payload);

import api from "./axios";

/**
 * Technician settings API (uses the technician axios instance, which
 * sends the "technician_token").
 */
export const getTechnicianSettings = () => api.get("/technician/settings");

export const changeTechnicianPassword = (payload) =>
  api.put("/technician/settings/password", payload);

export const deactivateTechnicianAccount = (payload) =>
  api.post("/technician/settings/deactivate", payload);

// Permanently close the account. Needs { email, password }.
export const deleteTechnicianAccount = (payload) =>
  api.post("/technician/settings/delete-account", payload);

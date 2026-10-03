import api from "./axios";

/**
 * Technician profile API
 */

// Get logged-in technician profile
export const getTechnicianProfile = () => api.get("/technician/me");

// Update technician profile
export const updateTechnicianProfile = (profile) =>
  api.put("/technician/profile", profile);

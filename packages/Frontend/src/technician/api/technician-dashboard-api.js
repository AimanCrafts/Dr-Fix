import api from "./axios";

/**
 * Technician dashboard API
 */

// Dashboard summary
export const getTechnicianSummary = () =>
  api.get("/technician/dashboard-summary");

// Technician earnings
export const getTechnicianEarnings = () => api.get("/technician/earnings");

// Technician schedule
export const getTechnicianSchedule = () => api.get("/technician/schedule");

// Update technician availability
export const updateTechnicianAvailability = (isAvailable) =>
  api.post("/technician/availability", {
    is_available: isAvailable,
  });

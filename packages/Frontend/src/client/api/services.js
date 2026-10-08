import api from "./axios";

/** Public list of services and prices (the single source of truth is the database). */
export const listServices = () => api.get("/public/services");

/** Current platform fee percentage (shown to technicians on sign-up). */
export const getCommission = () => api.get("/public/commission");

/** How many approved, available technicians cover a category right now. */
export const getAvailability = (category) =>
  api.get("/public/availability", { params: { category } });

import api from "./axios";

/**
 * technician/api/bookings.js
 * -----------------------------
 * available(): every pending booking whose service_category matches this
 * technician — the SAME list every matching technician sees (no per-
 * technician reservation, no timer). accept() is a race: the backend's
 * WHERE clause decides who actually gets it (see
 * TechnicianBookingController::accept). A 409 here means someone else
 * got there first — the UI should just drop it from the list and move on.
 */

export const listAvailableJobs = () => api.get("/technician/bookings/available");

export const listMyJobs = () => api.get("/technician/bookings/mine");

export const acceptJob = (id) => api.post(`/technician/bookings/${id}/accept`);

export const markOnTheWay = (id) => api.post(`/technician/bookings/${id}/on-the-way`);

export const markArrived = (id) => api.post(`/technician/bookings/${id}/arrived`);

export const startJob = (id) => api.post(`/technician/bookings/${id}/start`);

export const completeJob = (id) => api.post(`/technician/bookings/${id}/complete`);

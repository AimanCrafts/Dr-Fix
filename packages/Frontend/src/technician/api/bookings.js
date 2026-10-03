import api from "./axios";

/**
 * Technician booking API
 *
 * Flow:
 *
 * pending
 *   ↓
 * Accept Job
 *   ↓
 * accepted
 *   ↓
 * Start Service
 *   ↓
 * in_progress
 *   ↓
 * Complete Service
 *   ↓
 * completed
 */

// New job requests available to this technician
export const listAvailableJobs = () =>
  api.get("/technician/bookings/available");

// Jobs already accepted by this technician
export const listMyJobs = () => api.get("/technician/bookings/mine");

// Accept a job request
export const acceptJob = (id) => api.post(`/technician/bookings/${id}/accept`);

// Reject a job request
export const rejectJob = (id) => api.post(`/technician/bookings/${id}/reject`);

// Start the service
export const startJob = (id) => api.post(`/technician/bookings/${id}/start`);

// Complete the service
export const completeJob = (id) =>
  api.post(`/technician/bookings/${id}/complete`);

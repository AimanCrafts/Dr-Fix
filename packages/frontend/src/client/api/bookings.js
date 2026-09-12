import api from "./axios";

/**
 * client/api/bookings.js
 * -------------------------
 * createBooking replaces the fake client-side ID checkout.jsx used to
 * generate — this now actually creates a row on the backend, unassigned
 * (technician_id null, status "pending") until some technician accepts it.
 */

export const createBooking = (booking) => api.post("/bookings", booking);

export const listMyBookings = () => api.get("/bookings");

export const getBooking = (id) => api.get(`/bookings/${id}`);

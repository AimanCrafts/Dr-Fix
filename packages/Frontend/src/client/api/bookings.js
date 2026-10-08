import api from "./axios";

/**
 * Client Booking API
 */

// Create a new booking
export const createBooking = (booking) => api.post("/bookings", booking);

// Get bookings belonging to the logged-in client
export const listMyBookings = () => api.get("/bookings");

// Get a single booking
export const getBooking = (id) => api.get(`/bookings/${id}`);

// Cancel a booking (allowed while it is pending or accepted)
export const cancelBooking = (id) => api.post(`/bookings/${id}/cancel`);

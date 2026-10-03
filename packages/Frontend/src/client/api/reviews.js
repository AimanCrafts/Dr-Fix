import api from "./axios";

export const getPendingReview = async () => {
  const response = await api.get("/bookings/pending-review");
  return response.data;
};

export const createReview = async (bookingId, rating, review) => {
  const response = await api.post(`/bookings/${bookingId}/review`, {
    rating,
    review,
  });

  return response.data;
};

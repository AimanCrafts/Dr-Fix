import api from "./axios";

/** The logged-in technician's reviews, rating summary and star distribution. */
export const getTechnicianReviews = () => api.get("/technician/reviews");

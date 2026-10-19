import api from "./axios";

// Public Contact Us form -> stored in the contact_messages table.
export const sendContactMessage = (payload) => api.post("/contact", payload);

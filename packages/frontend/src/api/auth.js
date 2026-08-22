import api from "./axios";

export const registerUser = ({
  fullName,
  email,
  phone,
  password,
  confirmPassword,
}) =>
  api.post("/register", {
    name: fullName,
    email,
    phone,
    password,
    password_confirmation: confirmPassword,
  });

export const verifyOtp = (email, code) =>
  api.post("/verify-otp", { email, code });

export const resendOtp = (email) => api.post("/resend-otp", { email });

export const loginUser = (identifier, password) =>
  api.post("/login", { identifier, password });

export const logoutUser = () => api.post("/logout");

export const getCurrentUser = () => api.get("/me");

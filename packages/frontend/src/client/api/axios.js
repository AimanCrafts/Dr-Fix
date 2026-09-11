import axios from "axios";

const BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});


// Reads the same localStorage keys AuthContext.jsx actually writes to
// ("auth_token" / "auth_user") — previously this read "token"/"user",
// which never matched, so the Authorization header was silently never
// sent. Fixed as part of moving customer auth from Sanctum to JWT.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
    }
    return Promise.reject(error);
  },
);

export default api;

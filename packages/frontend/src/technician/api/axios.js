import axios from "axios";

/**
 * technician/api/axios.js
 * -------------------------
 * Deliberately a SEPARATE axios instance from client/api/axios.js —
 * technician auth uses JWT under its own localStorage keys
 * ("technician_token" / "technician_user"), completely independent from
 * the customer's Sanctum token. This also sidesteps an existing mismatch
 * in the customer code (client/api/axios.js reads localStorage "token",
 * but client/context/AuthContext.jsx actually writes to "auth_token") —
 * not fixed here since it's outside this task, but worth knowing about.
 */

const BASE_URL = "http://localhost:8000/api";

const technicianApi = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

technicianApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("technician_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

technicianApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("technician_token");
      localStorage.removeItem("technician_user");
    }
    return Promise.reject(error);
  },
);

export default technicianApi;

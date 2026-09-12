/**
 * admin/api/technicians.js
 * --------------------------
 * All calls go with credentials: "include" since admin auth is a
 * session cookie (AdminAuthController), not a Bearer token — same
 * pattern as admin/jsx/login.jsx and AdminProtectedRoute.jsx.
 */

const API_BASE = "http://localhost:8000/api";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }
  return data;
}

export const listTechnicians = (status) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return fetch(`${API_BASE}/admin/technicians${query}`, {
    credentials: "include",
  }).then(handle);
};

export const approveTechnician = (id) =>
  fetch(`${API_BASE}/admin/technicians/${id}/approve`, {
    method: "POST",
    credentials: "include",
  }).then(handle);

export const rejectTechnician = (id, reason) =>
  fetch(`${API_BASE}/admin/technicians/${id}/reject`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reason: reason || null }),
  }).then(handle);

/**
 * admin/api/services.js
 * Service prices and the platform commission. Same session-cookie pattern
 * as the other admin API files (credentials: "include").
 */

const API_BASE = "/api";

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      Object.values(data.errors || {})[0]?.[0] ||
        data.message ||
        `Request failed (${res.status})`,
    );
  }
  return data;
}

const json = (method, body) => ({
  method,
  credentials: "include",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  body: JSON.stringify(body),
});

export const listAdminServices = () =>
  fetch(`${API_BASE}/admin/services`, { credentials: "include" }).then(handle);

export const updateService = (id, changes) =>
  fetch(`${API_BASE}/admin/services/${id}`, json("PUT", changes)).then(handle);

export const updateCommission = (rate) =>
  fetch(`${API_BASE}/admin/commission`, json("PUT", { rate })).then(handle);

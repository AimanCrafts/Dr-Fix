const API_BASE = "/api";

async function handle(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

export const getAdminDashboardSummary = () =>
  fetch(`${API_BASE}/admin/dashboard-summary`, {
    credentials: "include",
  }).then(handle);

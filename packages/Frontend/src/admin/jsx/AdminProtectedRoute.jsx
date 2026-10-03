import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

/**
 * AdminProtectedRoute (admin/jsx/AdminProtectedRoute.jsx)
 * ----------------------------------------------------------
 * Separate from the customer-facing ProtectedRoute (client/jsx) on
 * purpose — this checks the admin session (GET /api/admin/me), not the
 * customer Sanctum token. Wrap any admin-only page with this so:
 *   - a logged-out visitor gets redirected to /admin/login
 *   - a customer session alone does NOT grant access to admin pages
 *     (the two sessions are completely separate on the backend)
 *
 * Usage in App.jsx:
 *   <Route path="/admin/dashboard" element={
 *     <AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>
 *   } />
 */

const API_BASE = "http://localhost:8000/api";

function AdminProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "authed" | "guest"

  useEffect(() => {
    fetch(`${API_BASE}/admin/me`, { credentials: "include" })
      .then((res) => setStatus(res.ok ? "authed" : "guest"))
      .catch(() => setStatus("guest"));
  }, []);

  if (status === "checking") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        Checking session...
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export default AdminProtectedRoute;

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getCurrentTechnician } from "../api/auth";

/**
 * TechnicianProtectedRoute (technician/jsx/TechnicianProtectedRoute.jsx)
 * ------------------------------------------------------------------------
 * The technician-role equivalent of client/jsx/ProtectedRoute.jsx and
 * admin/jsx/AdminProtectedRoute.jsx — previously missing, which meant
 * /technician/dashboard was reachable by typing the URL with no login
 * at all.
 *
 * Checks GET /api/technician/me (Bearer JWT from localStorage, via
 * technician/api/axios.js's interceptor) instead of a session cookie.
 * A valid but "pending"/"rejected" applicant is redirected to the
 * review page rather than the dashboard — same rule login.jsx already
 * applies right after login, just re-checked here so a stale bookmark
 * or back-button visit can't skip it.
 *
 * Usage in App.jsx:
 *   <Route path="/technician/dashboard" element={
 *     <TechnicianProtectedRoute><TechnicianDashboard /></TechnicianProtectedRoute>
 *   } />
 */
function TechnicianProtectedRoute({ children }) {
  const [status, setStatus] = useState("checking"); // "checking" | "approved" | "pending" | "guest"

  useEffect(() => {
    getCurrentTechnician()
      .then(({ data }) => {
        setStatus(data.approval_status === "approved" ? "approved" : "pending");
      })
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
    return <Navigate to="/technician/login" replace />;
  }

  if (status === "pending") {
    return <Navigate to="/technician/application-under-review" replace />;
  }

  return children;
}

export default TechnicianProtectedRoute;

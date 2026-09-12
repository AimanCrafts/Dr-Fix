import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { listTechnicians } from "../api/technicians";
import "../css/sidebar.css";

/**
 * Admin Sidebar (admin/jsx/sidebar.jsx)
 * ----------------------------------------
 * Logout now actually clears the backend session (POST /api/admin/logout)
 * before navigating away. Just navigating to /admin/login without this
 * call would leave the session cookie valid — anyone could then type
 * /admin/dashboard back into the address bar and get straight back in,
 * because AdminProtectedRoute would still find an active session.
 *
 * The "Provider Approvals" badge used to be a hardcoded 3 — now it's the
 * real pending count from GET /api/admin/technicians?status=pending.
 */

const BASE_MENU_ITEMS = [
  { label: "Overview", icon: "🏠", path: "/admin/dashboard" },
  { label: "Bookings", icon: "📅", path: "/admin/bookings" },
  { label: "Technicians", icon: "🧑‍🔧", path: "/admin/technicians" },
  { label: "Customers", icon: "👤", path: "/admin/customers" },
  { label: "Provider Approvals", icon: "➕", path: "/admin/approvals" },
  { label: "Reports", icon: "📊", path: "/admin/reports" },
  { label: "Settings", icon: "⚙️", path: "/admin/settings" },
];

const MOCK_ADMIN = { name: "Admin User", role: "Super Admin" };
const API_BASE = "http://localhost:8000/api";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [pendingCount, setPendingCount] = useState(null);

  useEffect(() => {
    listTechnicians("pending")
      .then((data) => setPendingCount(data.length))
      .catch(() => setPendingCount(null));
  }, []);

  const menuItems = BASE_MENU_ITEMS.map((item) =>
    item.path === "/admin/approvals" && pendingCount
      ? { ...item, badge: pendingCount }
      : item,
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: "POST",
        credentials: "include", // required so the session cookie is sent
      });
    } catch (err) {
      // Even if the request fails (e.g. server down), still send the
      // admin to the login screen — AdminProtectedRoute will re-check
      // the session on the next visit regardless.
    }
    // `replace: true` so the dashboard isn't left in browser history —
    // pressing "back" after logout won't flash the old dashboard.
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <div className="logo-placeholder" aria-hidden="true" />
        <span>Dr.-Fix</span>
      </div>

      <nav className="admin-sidebar__nav">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className={`admin-sidebar__item ${
              location.pathname === item.path ? "is-active" : ""
            }`}
          >
            <span className="admin-sidebar__icon">{item.icon}</span>
            <span className="admin-sidebar__label">{item.label}</span>
            {item.badge && (
              <span className="admin-sidebar__badge">{item.badge}</span>
            )}
          </Link>
        ))}
      </nav>

      <div className="admin-sidebar__profile">
        <div className="avatar-placeholder" aria-hidden="true" />
        <div>
          <p className="admin-sidebar__profile-name">{MOCK_ADMIN.name}</p>
          <p className="admin-sidebar__profile-role">{MOCK_ADMIN.role}</p>
        </div>
        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={handleLogout}
          disabled={isLoggingOut}
          aria-label="Logout"
          title="Logout"
        >
          ⏻
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;

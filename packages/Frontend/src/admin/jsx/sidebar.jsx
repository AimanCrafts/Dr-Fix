import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ClipboardCheck, Home, LogOut, Tag } from "lucide-react";
import { listTechnicians } from "../api/technicians";
import "../css/sidebar.css";

const MENU_ITEMS = [
  {
    label: "Overview",
    icon: Home,
    path: "/admin/dashboard",
  },
  {
    label: "Provider Approvals",
    icon: ClipboardCheck,
    path: "/admin/approvals",
  },
  {
    label: "Services & Prices",
    icon: Tag,
    path: "/admin/services",
  },
];

const API_BASE = "/api";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [pendingCount, setPendingCount] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/admin/me`, {
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json();
      })
      .then((data) => setAdmin(data?.admin || null))
      .catch(() => setAdmin(null));

    listTechnicians("pending")
      .then((data) => setPendingCount(data.length))
      .catch(() => setPendingCount(null));
  }, []);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      const response = await fetch(`${API_BASE}/admin/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Logout request failed");
      }
    } catch {
      // We still redirect. The protected route will verify the backend session
      // before allowing the admin back into the dashboard.
    } finally {
      navigate("/admin/login", { replace: true });
      setIsLoggingOut(false);
    }
  };

  const adminEmail = admin?.email || "Admin";
  const adminInitial = adminEmail.charAt(0).toUpperCase();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar__logo">
        <div className="logo-placeholder" aria-hidden="true" />
        <span>Dr.-Fix</span>
      </div>

      <nav className="admin-sidebar__nav" aria-label="Admin navigation">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-sidebar__item ${
                isActive ? "is-active" : ""
              }`}
            >
              <span className="admin-sidebar__icon" aria-hidden="true">
                <Icon size={17} />
              </span>
              <span className="admin-sidebar__label">{item.label}</span>

              {item.path === "/admin/approvals" && pendingCount > 0 && (
                <span className="admin-sidebar__badge">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="admin-sidebar__profile">
        <div className="avatar-placeholder" aria-hidden="true">
          {adminInitial}
        </div>

        <div className="admin-sidebar__profile-info">
          <p className="admin-sidebar__profile-name">{adminEmail}</p>
          <p className="admin-sidebar__profile-role">Administrator</p>
        </div>
      </div>

      <button
        type="button"
        className="admin-sidebar__logout-button"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        <LogOut size={17} />
        <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
      </button>
    </aside>
  );
}

export default Sidebar;

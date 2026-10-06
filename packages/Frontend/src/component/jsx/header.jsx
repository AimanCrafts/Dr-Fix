import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
  Briefcase,
  CalendarCheck,
  CalendarDays,
  LayoutDashboard,
  MapPin,
  Settings,
  UserRound,
  Wallet,
} from "lucide-react";
import UserMenu from "./user-menu.jsx";
import NotificationBell from "./notification-bell.jsx";
import { notificationApi as clientNotificationApi } from "../../client/api/notifications";
import { notificationApi as technicianNotificationApi } from "../../technician/api/notifications-api";
import { useAuth } from "../../client/context/AuthContext.jsx";
import "../css/header.css";
import logo from "../../assets/logo.png";

/*
 * Settings pages exist (/settings and /technician/settings), so the
 * "Settings" item is shown in the avatar menu. Set to false to hide it.
 */
const SETTINGS_ENABLED = true;

function Header({ variant = "marketing" }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, isLoggedIn } = useAuth();

  /*
   * Several pages (services, profile, checkout, booking-tracking,
   * confirmation) pass variant="app". Header never had an "app" layout,
   * so it rendered only the logo - no nav, no avatar. "app" now means
   * "pick the right header for whoever is looking": the client header
   * when logged in, the marketing header when not.
   */
  const resolvedVariant =
    variant === "app" ? (isLoggedIn ? "client" : "marketing") : variant;

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About Us", href: "/about" },
  ];

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  let technicianUser = null;

  try {
    technicianUser = JSON.parse(localStorage.getItem("technician_user"));
  } catch {
    technicianUser = null;
  }

  const technicianInitial = technicianUser?.name
    ? technicianUser.name.charAt(0).toUpperCase()
    : "?";

  const handleTechnicianLogout = () => {

    localStorage.removeItem("technician_token");
    localStorage.removeItem("technician_user");

    navigate("/technician/login");
  };

  const clientMenuItems = [
    { label: "Overview", to: "/client_dashboard", icon: LayoutDashboard },
    { label: "My Bookings", to: "/my-bookings", icon: CalendarCheck },
    { label: "Saved Addresses", to: "/addresses", icon: MapPin },
    { label: "Profile", to: "/profile", icon: UserRound },
    ...(SETTINGS_ENABLED
      ? [{ label: "Settings", to: "/settings", icon: Settings }]
      : []),
  ];

  const technicianMenuItems = [
    { label: "Overview", to: "/technician/dashboard", icon: LayoutDashboard },
    { label: "Job Requests", to: "/technician/job-requests", icon: Briefcase },
    { label: "My Bookings", to: "/technician/my-bookings", icon: CalendarCheck },
    { label: "Schedule", to: "/technician/schedule", icon: CalendarDays },
    { label: "Earnings", to: "/technician/earnings", icon: Wallet },
    { label: "Profile", to: "/technician/profile", icon: UserRound },
    ...(SETTINGS_ENABLED
      ? [{ label: "Settings", to: "/technician/settings", icon: Settings }]
      : []),
  ];

  /*
   * CLIENT ACTIVE LINK
   *
   * This is intentionally centralized so every client page
   * gets the same active-link behavior.
   */
  const isClientActive = (href) => {
    const path = location.pathname;

    if (href === "/client_dashboard") {
      return path === "/client_dashboard";
    }

    if (href === "/my-bookings") {
      return path === "/my-bookings";
    }

    if (href === "/services") {
      return [
        "/services",
        "/checkout",
        "/booking-confirmed",
        "/booking-tracking",
      ].some((route) => path === route || path.startsWith(`${route}/`));
    }

    if (href === "/addresses") {
      return path === "/addresses";
    }

    if (href === "/profile") {
      return path === "/profile";
    }

    return path === href;
  };

  return (
    <header className={`site-header site-header--${resolvedVariant}`}>
      <div className="site-header__inner">
        {/* LOGO */}
        <Link to="/" className="site-header__logo" aria-label="Dr.-Fix home">
          <img
            src={logo}
            alt="Dr.-Fix logo"
            className="site-header__logo-icon"
          />

          <span className="site-header__wordmark">Dr.-Fix</span>
        </Link>

        {/* =====================================================
            MARKETING HEADER
        ====================================================== */}
        {resolvedVariant === "marketing" && (
          <>
            <nav
              className={`site-header__nav ${isMenuOpen ? "is-open" : ""}`}
              aria-label="Primary"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className={`site-header__link ${
                    location.pathname === link.href ? "is-active" : ""
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="site-header__actions">
              <Link to="/login" className="site-header__login-link">
                Login
              </Link>

              <Link
                to="/services"
                className="btn btn--primary site-header__cta"
              >
                Book a Fix
              </Link>

              <button
                type="button"
                className="site-header__menu-btn"
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                onClick={() => setIsMenuOpen((open) => !open)}
              >
                <span />
                <span />
                <span />
              </button>
            </div>
          </>
        )}

        {/* =====================================================
            CLIENT HEADER
        ====================================================== */}
        {resolvedVariant === "client" && (
          <>
            <nav className="site-header__app-nav" aria-label="Client dashboard">
              <Link
                to="/client_dashboard"
                className={`app-nav__item ${
                  isClientActive("/client_dashboard") ? "is-active" : ""
                }`}
              >
                Overview
              </Link>

              <Link
                to="/my-bookings"
                className={`app-nav__item ${
                  isClientActive("/my-bookings") ? "is-active" : ""
                }`}
              >
                My Bookings
              </Link>

              <Link
                to="/services"
                className={`app-nav__item ${
                  isClientActive("/services") ? "is-active" : ""
                }`}
              >
                Services
              </Link>

              <Link
                to="/addresses"
                className={`app-nav__item ${
                  isClientActive("/addresses") ? "is-active" : ""
                }`}
              >
                Addresses
              </Link>

              <Link
                to="/profile"
                className={`app-nav__item ${
                  isClientActive("/profile") ? "is-active" : ""
                }`}
              >
                Profile
              </Link>
            </nav>

            <div className="site-header__actions">
              <NotificationBell api={clientNotificationApi} />

              <UserMenu
                initial={initial}
                name={user?.name || "Guest"}
                subtitle={user?.email || "Customer account"}
                items={clientMenuItems}
                currentPath={location.pathname}
                onLogout={handleLogout}
                ariaLabel="Account menu"
              />
            </div>
          </>
        )}

        {/* =====================================================
            TECHNICIAN HEADER
        ====================================================== */}
        {resolvedVariant === "technician" && (
          <>
            <nav className="site-header__pill-nav" aria-label="Technician">
              <Link
                to="/technician/dashboard"
                className={`pill-nav__item ${
                  location.pathname === "/technician/dashboard"
                    ? "is-active"
                    : ""
                }`}
              >
                Overview
              </Link>

              <Link
                to="/technician/job-requests"
                className={`pill-nav__item ${
                  location.pathname === "/technician/job-requests"
                    ? "is-active"
                    : ""
                }`}
              >
                Job Requests
              </Link>

              <Link
                to="/technician/earnings"
                className={`pill-nav__item ${
                  location.pathname === "/technician/earnings"
                    ? "is-active"
                    : ""
                }`}
              >
                Earnings
              </Link>

              <Link
                to="/technician/schedule"
                className={`pill-nav__item ${
                  location.pathname === "/technician/schedule"
                    ? "is-active"
                    : ""
                }`}
              >
                Schedule
              </Link>

              <Link
                to="/technician/my-bookings"
                className={`pill-nav__item ${
                  location.pathname === "/technician/my-bookings"
                    ? "is-active"
                    : ""
                }`}
              >
                My Bookings
              </Link>

              <Link
                to="/technician/profile"
                className={`pill-nav__item ${
                  location.pathname === "/technician/profile" ? "is-active" : ""
                }`}
              >
                Profile
              </Link>
            </nav>

            <div className="site-header__actions">
              <NotificationBell api={technicianNotificationApi} />

              <UserMenu
                initial={technicianInitial}
                name={technicianUser?.name || "Technician"}
                subtitle={technicianUser?.service_category || "Technician account"}
                items={technicianMenuItems}
                currentPath={location.pathname}
                onLogout={handleTechnicianLogout}
                ariaLabel="Technician account menu"
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

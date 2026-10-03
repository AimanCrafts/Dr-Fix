import { Link, useLocation, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { useAuth } from "../../client/context/AuthContext.jsx";
import "../css/header.css";
import logo from "../../assets/logo.png";

function Header({
  variant = "marketing",
  isDarkMode = false,
  onToggleDarkMode = () => {},
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout } = useAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "About Us", href: "/about" },
  ];

  useEffect(() => {
    if (!isUserMenuOpen) return undefined;

    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "?";

  const handleLogout = () => {
    setIsUserMenuOpen(false);
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
    setIsUserMenuOpen(false);

    localStorage.removeItem("technician_token");
    localStorage.removeItem("technician_user");

    navigate("/technician/login");
  };

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
    <header className={`site-header site-header--${variant}`}>
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
        {variant === "marketing" && (
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
        {variant === "client" && (
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
              <button
                type="button"
                className="site-header__icon-button"
                onClick={onToggleDarkMode}
                aria-label={
                  isDarkMode ? "Switch to light mode" : "Switch to dark mode"
                }
                title={isDarkMode ? "Light mode" : "Dark mode"}
              >
                {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              </button>

              <button
                type="button"
                className="site-header__icon-button"
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell size={18} />
              </button>

              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="avatar-placeholder avatar-placeholder--button"
                  aria-label="Account menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                >
                  {initial}
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu__dropdown" role="menu">
                    <p className="user-menu__name">{user?.name || "Guest"}</p>

                    <Link
                      to="/profile"
                      className="user-menu__option"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    <button
                      type="button"
                      className="user-menu__option user-menu__option--danger"
                      role="menuitem"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* =====================================================
            TECHNICIAN HEADER
        ====================================================== */}
        {variant === "technician" && (
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
              <div className="user-menu" ref={userMenuRef}>
                <button
                  type="button"
                  className="avatar-placeholder avatar-placeholder--button"
                  aria-label="Technician account menu"
                  aria-expanded={isUserMenuOpen}
                  onClick={() => setIsUserMenuOpen((open) => !open)}
                >
                  {technicianInitial}
                </button>

                {isUserMenuOpen && (
                  <div className="user-menu__dropdown" role="menu">
                    <p className="user-menu__name">
                      {technicianUser?.name || "Technician"}
                    </p>

                    <Link
                      to="/technician/profile"
                      className="user-menu__option"
                      role="menuitem"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Profile
                    </Link>

                    <button
                      type="button"
                      className="user-menu__option user-menu__option--danger"
                      role="menuitem"
                      onClick={handleTechnicianLogout}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;

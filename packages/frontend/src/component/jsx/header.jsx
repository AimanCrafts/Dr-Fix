import { Link, useNavigate } from "react-router-dom";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../client/context/AuthContext.jsx";
import "../css/header.css";


function Header({
  variant = "marketing",
  isDarkMode = false,
  onToggleDarkMode = () => {},
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "About Us", href: "/about" },
  ];

  // Close the dropdown when clicking anywhere outside of it.
  useEffect(() => {
    if (!isUserMenuOpen) return undefined;
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
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

  return (
    <header className={`site-header site-header--${variant}`}>
      <div className="site-header__inner">
        {/* Logo area intentionally left empty — no logo asset yet. */}
        <a href="/" className="site-header__logo" aria-label="Dr.-Fix home">
          <div className="logo-placeholder" aria-hidden="true">
            {/* LOGO ICON: to be added later */}
          </div>
          <span className="site-header__wordmark">Dr.-Fix</span>
        </a>

        {variant === "marketing" && (
          <>
            <nav
              className={`site-header__nav ${isMenuOpen ? "is-open" : ""}`}
              aria-label="Primary"
            >
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="site-header__link"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="site-header__actions">
              <Link to="/login" className="site-header__login-link">
                Login
              </Link>

              <button
                type="button"
                className="site-header__theme-toggle"
                onClick={onToggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? "🌙" : "☀️"}
              </button>

              <a href="/services" className="btn btn--primary site-header__cta">
                Book a Fix
              </a>

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

        {variant === "app" && (
          <>
            <nav className="site-header__pill-nav" aria-label="Dashboard">
              <a href="/client_dashboard" className="pill-nav__item is-active">
                Overview
              </a>
              <a href="/bookings" className="pill-nav__item">
                My Bookings
              </a>
              <a href="/services" className="pill-nav__item">
                Services
              </a>
              <a href="/addresses" className="pill-nav__item">
                Addresses
              </a>
              <a href="/profile" className="pill-nav__item">
                Profile
              </a>
            </nav>

            <div className="site-header__actions">
              <button
                type="button"
                className="site-header__theme-toggle"
                onClick={onToggleDarkMode}
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? "🌙" : "☀️"}
              </button>
              <button
                type="button"
                className="site-header__bell"
                aria-label="Notifications"
              >
                🔔
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
      </div>
    </header>
  );
}

export default Header;

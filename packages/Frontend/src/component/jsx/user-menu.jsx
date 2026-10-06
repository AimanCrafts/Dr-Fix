import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { LogOut } from "lucide-react";
import "../css/user-menu.css";

/**
 * UserMenu (component/jsx/user-menu.jsx)
 * ---------------------------------------
 * The avatar dropdown shared by the client header and the technician
 * header. The header decides WHAT goes in it (items, name, subtitle,
 * logout behaviour); this component only handles HOW it looks and
 * behaves, so both roles always feel the same.
 *
 * Props
 *   initial      single letter shown on the avatar
 *   name         full name (top of the panel)
 *   subtitle     email for customers, service category for technicians
 *   items        [{ label, to, icon }]  icon = a lucide-react component
 *   currentPath  location.pathname, used to highlight the current page
 *   onLogout     called when "Log out" is chosen
 *   ariaLabel    accessible name for the avatar button
 *
 * Behaviour: closes on outside click, on Escape (focus returns to the
 * avatar), and after choosing an item. Arrow Up / Down move between items.
 */
function UserMenu({
  initial,
  name,
  subtitle,
  items = [],
  currentPath = "",
  onLogout,
  ariaLabel = "Account menu",
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handlePointerDown = (event) => {
      if (wrapRef.current && !wrapRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        const focusable = panelRef.current?.querySelectorAll(
          "[data-um-item]",
        );
        if (!focusable || focusable.length === 0) return;

        event.preventDefault();
        const list = Array.from(focusable);
        const index = list.indexOf(document.activeElement);
        const step = event.key === "ArrowDown" ? 1 : -1;
        const next = (index + step + list.length) % list.length;
        list[next].focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const isActive = (to) =>
    currentPath === to || currentPath.startsWith(`${to}/`);

  const handleLogoutClick = () => {
    setOpen(false);
    onLogout?.();
  };

  return (
    <div className="um" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className="um__trigger"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        {initial}
      </button>

      {open && (
        <div className="um__panel" role="menu" ref={panelRef}>
          <div className="um__identity">
            <span className="um__avatar" aria-hidden="true">
              {initial}
            </span>
            <span className="um__who">
              <span className="um__name" title={name}>
                {name}
              </span>
              {subtitle && (
                <span className="um__subtitle" title={subtitle}>
                  {subtitle}
                </span>
              )}
            </span>
          </div>

          <div className="um__group">
            {items.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                role="menuitem"
                data-um-item
                className={`um__item ${isActive(to) ? "is-current" : ""}`}
                aria-current={isActive(to) ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {Icon && <Icon size={17} aria-hidden="true" />}
                <span>{label}</span>
              </Link>
            ))}
          </div>

          <div className="um__group um__group--last">
            <button
              type="button"
              role="menuitem"
              data-um-item
              className="um__item um__item--danger"
              onClick={handleLogoutClick}
            >
              <LogOut size={17} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserMenu;

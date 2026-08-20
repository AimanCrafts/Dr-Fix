import { Link, NavLink } from "react-router-dom";
import {
  Wrench,
  LayoutDashboard,
  CalendarDays,
  MessageSquare,
  Receipt,
  Star,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import { logout } from "../../lib/auth";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/bookings", label: "My Bookings", icon: CalendarDays },
  { to: "/dashboard/messages", label: "Messages", icon: MessageSquare },
  { to: "/dashboard/payments", label: "Payments", icon: Receipt },
  { to: "/dashboard/reviews", label: "Reviews", icon: Star },
  { to: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar({ open, onClose }) {
  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-[var(--color-ink)]/40 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 -translate-x-full flex-col border-r border-[var(--color-sidebar-border)] bg-[var(--color-sidebar-bg)] transition-transform duration-200 md:translate-x-0 ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-amber)] text-white">
              <Wrench size={18} strokeWidth={2.5} />
            </span>
            <span className="font-[var(--font-display)] text-lg font-semibold tracking-tight text-[var(--color-ink)]">
              Dr<span className="text-[var(--color-amber)]">.</span>Fix
            </span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-[var(--color-sidebar-text-muted)] hover:text-[var(--color-ink)] md:hidden"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="mt-2 flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--color-sidebar-active-bg)] text-[var(--color-sidebar-active-text)]"
                    : "text-[var(--color-sidebar-text)] hover:bg-slate-100"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[var(--color-sidebar-border)] p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--color-sidebar-text)] transition-colors hover:bg-slate-100"
          >
            <LogOut size={18} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

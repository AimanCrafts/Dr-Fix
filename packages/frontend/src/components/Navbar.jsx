import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, Wrench, LogOut, LayoutDashboard } from 'lucide-react'
import { isAuthenticated, logout, getUser } from '../lib/auth'

const navLinks = [
  { to: '/services', label: 'Services' },
  { to: '/#how-it-works', label: 'How it works' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const navigate = useNavigate()
  const authed = isAuthenticated()
  const user = getUser()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled
          ? 'border-[var(--color-line)] bg-[var(--color-paper)]/95 backdrop-blur'
          : 'border-transparent bg-[var(--color-paper)]/70 backdrop-blur'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-ink)] text-[var(--color-amber)]">
            <Wrench size={18} strokeWidth={2.5} />
          </span>
          <span className="font-[var(--font-display)] text-xl font-semibold tracking-tight text-[var(--color-ink)]">
            Dr<span className="text-[var(--color-amber)]">.</span>Fix
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <NavLink
              key={l.label}
              to={l.to}
              className="font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-amber)]"
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authed ? (
            <>
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-amber)]"
              >
                <LayoutDashboard size={17} />
                {user?.name?.split(' ')[0] || 'Dashboard'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-amber)]"
              >
                <LogOut size={17} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-amber)]"
              >
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-sm">
                Get started
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--color-line)] text-[var(--color-ink)] md:hidden"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-line)] px-5 pb-5 md:hidden">
          <nav className="flex flex-col gap-4 pt-4">
            {navLinks.map((l) => (
              <NavLink key={l.label} to={l.to} onClick={() => setOpen(false)} className="font-medium">
                {l.label}
              </NavLink>
            ))}
            {authed ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-1.5 font-medium">
                  <LayoutDashboard size={17} /> Dashboard
                </Link>
                <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 text-left font-medium">
                  <LogOut size={17} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="font-medium">
                  Sign in
                </Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary text-center text-sm">
                  Get started
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

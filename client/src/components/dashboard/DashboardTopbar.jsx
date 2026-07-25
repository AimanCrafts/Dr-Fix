import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import { getUser, logout } from '../../lib/auth'
import { notifications as seedNotifications } from '../../data/placeholder'

export default function DashboardTopbar({ title, onMenuClick }) {
  const navigate = useNavigate()
  const user = getUser() ?? { name: 'there' }

  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(seedNotifications)

  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = (user.name || 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--color-line)] bg-[var(--color-paper)]/95 px-5 py-4 backdrop-blur md:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-line)] text-[var(--color-ink)] md:hidden"
          aria-label="Open menu"
        >
          <Menu size={18} />
        </button>
        <h1 className="font-[var(--font-display)] text-lg font-semibold tracking-tight md:text-xl">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative grid h-10 w-10 place-items-center rounded-lg text-[var(--color-ink-soft)] transition-colors hover:bg-[var(--color-card)]"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-[var(--color-amber)] text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] shadow-[0_20px_40px_-20px_rgba(15,37,70,0.35)]">
              <div className="flex items-center justify-between border-b border-[var(--color-line)] px-4 py-3">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllRead}
                    className="text-xs font-medium text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-[var(--color-muted)]">
                    You&apos;re all caught up.
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex gap-3 border-b border-[var(--color-line)] px-4 py-3 last:border-b-0 ${
                        n.read ? '' : 'bg-[var(--color-amber-soft)]/40'
                      }`}
                    >
                      <span
                        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                          n.read ? 'bg-transparent' : 'bg-[var(--color-amber)]'
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{n.title}</p>
                        <p className="mt-0.5 text-xs text-[var(--color-muted)]">{n.body}</p>
                        <p className="mt-1 text-[11px] text-[var(--color-muted-2)]">{n.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User avatar menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-lg py-1.5 pl-1.5 pr-2 transition-colors hover:bg-[var(--color-card)]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[var(--color-ink)] text-xs font-semibold text-[var(--color-amber)]">
              {initials}
            </span>
            <span className="hidden text-sm font-medium text-[var(--color-ink-soft)] sm:block">
              {user.name?.split(' ')[0] || 'Account'}
            </span>
            <ChevronDown size={15} className="hidden text-[var(--color-muted-2)] sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] py-1.5 shadow-[0_20px_40px_-20px_rgba(15,37,70,0.35)]">
              <div className="border-b border-[var(--color-line)] px-4 py-2.5">
                <p className="truncate text-sm font-medium">{user.name}</p>
                <p className="truncate text-xs text-[var(--color-muted)]">{user.email}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  navigate('/dashboard/settings')
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-paper)]"
              >
                <User size={16} /> Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  navigate('/dashboard/settings')
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-ink-soft)] hover:bg-[var(--color-paper)]"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-sm text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]"
              >
                <LogOut size={16} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

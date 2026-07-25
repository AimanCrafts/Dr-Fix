import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import DashboardSidebar from './DashboardSidebar'
import DashboardTopbar from './DashboardTopbar'

const titles = {
  '/dashboard': 'Overview',
  '/dashboard/bookings': 'My Bookings',
  '/dashboard/messages': 'Messages',
  '/dashboard/payments': 'Payments',
  '/dashboard/reviews': 'Reviews',
  '/dashboard/settings': 'Settings',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = titles[location.pathname] || 'Dashboard'

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-h-screen flex-col md:pl-64">
        <DashboardTopbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 px-5 py-8 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

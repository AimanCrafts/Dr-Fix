import { useState } from 'react'
import { bookings } from '../../data/placeholder'
import StatusBadge from '../../components/dashboard/StatusBadge'

const tabs = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled']

export default function Bookings() {
  const [activeTab, setActiveTab] = useState('All')

  const filtered =
    activeTab === 'All' ? bookings : bookings.filter((b) => b.status === activeTab)

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'border-[var(--color-ink)] bg-[var(--color-ink)] text-white'
                : 'border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-muted-2)]'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)]">
        {filtered.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-[var(--color-muted)]">
            No bookings in this category yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="field-label border-b border-[var(--color-line)] text-left text-xs uppercase text-[var(--color-muted)]">
                  <th className="px-6 py-3 font-medium">Service</th>
                  <th className="px-6 py-3 font-medium">Provider</th>
                  <th className="px-6 py-3 font-medium">Date &amp; time</th>
                  <th className="px-6 py-3 font-medium">Price</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-line)]">
                {filtered.map((b) => (
                  <tr key={b.id} className="transition-colors hover:bg-[var(--color-paper)]">
                    <td className="px-6 py-4 font-medium">{b.service}</td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">{b.provider}</td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">
                      {b.date} · {b.time}
                    </td>
                    <td className="px-6 py-4 text-[var(--color-muted)]">৳{b.price}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

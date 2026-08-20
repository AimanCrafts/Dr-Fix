const styles = {
  Completed: 'badge-success',
  Pending: 'badge-warning',
  'In Progress': 'bg-[var(--color-teal-soft)] text-[var(--color-teal-dark)]',
  Cancelled: 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
}

export default function StatusBadge({ status }) {
  const extra = styles[status] || 'badge-warning'
  const isCustom = status === 'In Progress' || status === 'Cancelled'

  return (
    <span
      className={
        isCustom
          ? `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${extra}`
          : extra
      }
    >
      {status}
    </span>
  )
}

export default function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-card)] px-6 py-20 text-center">
      <h2 className="font-[var(--font-display)] text-xl font-semibold">{title}</h2>
      <p className="mt-2 max-w-sm text-sm text-[var(--color-muted)]">
        This section is on its way. Check back soon.
      </p>
    </div>
  )
}

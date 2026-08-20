import { Link } from 'react-router-dom'
import { Wrench, Facebook, Instagram, Twitter, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

const columns = [
  {
    title: 'For Customers',
    links: [
      { label: 'How it works', to: '/#how-it-works' },
      { label: 'Browse services', to: '/services' },
      { label: 'Track a booking', to: '/dashboard' },
    ],
  },
  {
    title: 'For Providers',
    links: [
      { label: 'Become a provider', to: '/register?role=provider' },
      { label: 'Provider login', to: '/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Dr. Fix', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="bg-[var(--color-ink)] text-white">
      <div
        aria-hidden="true"
        className="h-4"
        style={{
          background:
            'radial-gradient(circle at 12px 0, transparent 12px, var(--color-ink) 13px) repeat-x',
          backgroundSize: '24px 24px',
        }}
      />
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-4 md:px-8">
        <div className="grid gap-10 border-b border-white/10 pb-10 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--color-amber)] text-[var(--color-ink)]">
                <Wrench size={18} strokeWidth={2.5} />
              </span>
              <span className="font-[var(--font-display)] text-xl font-semibold">Dr.Fix</span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-white/60">
              Connecting Dhaka homeowners with verified electricians, plumbers, cleaners and more —
              tracked from request to finished job.
            </p>
            <div className="mt-5 space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2.5">
                <MapPin size={15} className="text-[var(--color-amber)]" /> Dhaka, Bangladesh
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={15} className="text-[var(--color-amber)]" /> support@drfix.app
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={15} className="text-[var(--color-amber)]" /> +880 1XXX-XXXXXX
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition-colors hover:border-[var(--color-amber)] hover:text-[var(--color-amber)]"
                  aria-label="Social link"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="job-tag text-xs uppercase tracking-widest text-white/50">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link to={l.to} className="text-sm text-white/75 transition-colors hover:text-[var(--color-amber)]">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="job-tag pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} Dr. Fix — CSE-3100 project build. All rights reserved.
        </p>
      </div>
    </footer>
  )
}

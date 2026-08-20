import { Link } from 'react-router-dom'
import { Wrench } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-paper)]">
      <Navbar />
      <div className="mx-auto flex max-w-6xl flex-1 flex-col items-center justify-center px-5 py-20 text-center md:px-8">
        <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--color-amber-soft)] text-[var(--color-amber)]">
          <Wrench size={28} />
        </span>
        <p className="job-tag mt-6 text-sm text-[var(--color-muted)]">ERROR 404</p>
        <h1 className="mt-2 font-[var(--font-display)] text-3xl font-semibold tracking-tight">
          This job ticket doesn&apos;t exist.
        </h1>
        <p className="mt-3 max-w-md text-[var(--color-muted)]">
          The page you&apos;re looking for may have been moved or never existed. Let&apos;s get you back on route.
        </p>
        <Link to="/" className="btn-primary mt-8">
          Back to home
        </Link>
      </div>
      <Footer />
    </div>
  )
}

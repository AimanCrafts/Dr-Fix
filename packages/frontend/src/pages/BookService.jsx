import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Star, ArrowLeft, Calendar, MapPin, CheckCircle } from 'lucide-react'
import { services } from '../data/placeholder'
import { isAuthenticated } from '../lib/auth'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function BookService() {
  const { id } = useParams()
  const navigate = useNavigate()
  const service = services.find((s) => s.id === id)
  const [address, setAddress] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/book/${id}` } } })
      return
    }

    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setSubmitting(false)
    setConfirmed(true)
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[var(--color-paper)]">
        <Navbar />
        <div className="mx-auto max-w-6xl px-5 py-20 text-center md:px-8">
          <p className="text-[var(--color-muted)]">We couldn&apos;t find that service.</p>
          <Link to="/services" className="mt-4 inline-block font-semibold text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]">
            Browse all services
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Navbar />

      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/services"
            className="mb-6 inline-flex items-center gap-2 font-medium text-[var(--color-ink-soft)] transition-colors hover:text-[var(--color-amber)]"
          >
            <ArrowLeft size={18} /> Back to services
          </Link>

          <div className="ticket-notch rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-8 shadow-[0_25px_50px_-20px_rgba(15,37,70,0.35)]">
            {confirmed ? (
              <div className="py-6 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-teal-soft)]">
                  <CheckCircle size={32} className="text-[var(--color-teal-dark)]" />
                </div>
                <h1 className="mt-5 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
                  Booking confirmed
                </h1>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  Your {service.name.toLowerCase()} request has been logged. A technician will be
                  assigned shortly.
                </p>
                <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
                  Go to dashboard
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="job-tag text-xs text-[var(--color-muted)]">{service.id}</span>
                    <h1 className="mt-1 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
                      {service.name}
                    </h1>
                    <p className="text-sm text-[var(--color-muted)]">
                      {service.category} · ETA {service.eta}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-[var(--color-amber-soft)] px-2.5 py-1">
                    <Star size={15} className="fill-[var(--color-amber)] text-[var(--color-amber)]" />
                    <span className="text-sm font-semibold text-[var(--color-amber-dark)]">{service.rating}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between rounded-xl bg-[var(--color-teal-soft)] px-4 py-3">
                  <span className="text-sm text-[var(--color-ink-soft)]">Starting from</span>
                  <span className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-teal-dark)]">
                    ৳{service.price}
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  <div>
                    <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                      Service address
                    </label>
                    <div className="relative mt-1.5">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]" size={18} />
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="input-field pl-10"
                        placeholder="House, road, area — Dhaka"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                      Preferred date &amp; time
                    </label>
                    <div className="relative mt-1.5">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]" size={18} />
                      <input
                        type="datetime-local"
                        required
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                      Additional notes (optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="input-field mt-1.5 min-h-[100px] resize-y"
                      placeholder="Any special instructions for the technician…"
                    />
                  </div>

                  <button type="submit" disabled={submitting} className="btn-primary w-full py-3 text-base">
                    {submitting ? 'Confirming…' : 'Confirm booking'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

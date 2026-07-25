import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 700))
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Navbar />

      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-5 py-12 md:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="ticket-notch rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-8 shadow-[0_25px_50px_-20px_rgba(15,37,70,0.35)]">
            {!sent ? (
              <>
                <div className="text-center">
                  <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight">
                    Reset your password
                  </h1>
                  <p className="mt-2 text-sm text-[var(--color-muted)]">
                    Enter your email and we&apos;ll send you a reset link.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                  <div>
                    <label htmlFor="email" className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                      Email address
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]" size={18} />
                      <input
                        id="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field pl-10"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
                    {loading ? 'Sending…' : 'Send reset link'}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center">
                <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight">
                  Check your inbox
                </h1>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  If an account exists for{' '}
                  <span className="font-medium text-[var(--color-ink)]">{email}</span>, a reset link is on its way.
                </p>
              </div>
            )}

            <div className="perforation my-6" />

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:text-[var(--color-amber)]"
            >
              <ArrowLeft size={15} /> Back to sign in
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

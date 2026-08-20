import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Star, Wrench } from 'lucide-react'
import { services, categories } from '../data/placeholder'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Services() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [searchTerm, selectedCategory])

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">
      <Navbar />

      <section className="border-b border-[var(--color-line)] bg-[var(--color-card)] py-12">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <span className="job-tag inline-block rounded-full border border-[var(--color-line)] px-3 py-1 text-xs uppercase tracking-widest text-[var(--color-muted)]">
            Service board
          </span>
          <h1 className="mt-3 font-[var(--font-display)] text-3xl font-semibold tracking-tight md:text-4xl">
            All services
          </h1>
          <p className="mt-2 text-[var(--color-muted)]">Find the right professional for your home needs.</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-8 md:px-8">
        <div className="flex flex-col gap-4 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]" size={20} />
            <input
              type="text"
              placeholder="Search services…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`job-tag whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-[var(--color-ink)] text-white'
                  : 'border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-amber)]'
              }`}
            >
              All
            </button>
            {categories.map(({ label }) => (
              <button
                key={label}
                onClick={() => setSelectedCategory(label)}
                className={`job-tag whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  selectedCategory === label
                    ? 'bg-[var(--color-ink)] text-white'
                    : 'border border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-amber)]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        {filteredServices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--color-line)] bg-[var(--color-card)] py-16 text-center">
            <Wrench className="mx-auto text-[var(--color-muted-2)]" size={40} />
            <p className="mt-4 text-[var(--color-muted)]">No services found matching your search.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredServices.map((service) => (
              <div key={service.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="job-tag text-xs text-[var(--color-muted)]">{service.id}</span>
                    <h3 className="mt-1 font-[var(--font-display)] text-lg font-semibold">{service.name}</h3>
                    <p className="text-sm text-[var(--color-muted)]">{service.category}</p>
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-[var(--color-amber-soft)] px-2 py-1">
                    <Star size={14} className="fill-[var(--color-amber)] text-[var(--color-amber)]" />
                    <span className="text-sm font-semibold text-[var(--color-amber-dark)]">{service.rating}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-[var(--color-muted)]">{service.description}</p>
                <div className="perforation on-card my-4" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="job-tag text-xs uppercase tracking-widest text-[var(--color-muted)]">Starting from</p>
                    <p className="font-[var(--font-display)] text-xl font-semibold">৳{service.price}</p>
                  </div>
                  <span className="job-tag text-xs text-[var(--color-muted)]">ETA {service.eta}</span>
                </div>
                <Link to={`/book/${service.id}`} className="btn-primary mt-4 block w-full text-center text-sm">
                  Book now
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  )
}

import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Star,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { categories, services, testimonials } from "../data/placeholder";

const stats = [
  { icon: Users, label: "Active professionals", value: "1,200+" },
  { icon: CheckCircle, label: "Jobs completed", value: "5,000+" },
  { icon: Star, label: "Customer rating", value: "4.8/5" },
  { icon: Clock, label: "Avg. response", value: "15 min" },
];

const steps = [
  {
    n: "01",
    title: "Open a ticket",
    body: "Tell us what broke and where — takes under a minute.",
  },
  {
    n: "02",
    title: "Get matched & dispatched",
    body: "A verified technician near you accepts the job.",
  },
  {
    n: "03",
    title: "Track it live",
    body: "Watch status move from accepted to en route to in progress.",
  },
  {
    n: "04",
    title: "Close the ticket",
    body: "Pay, rate the job, and it lands in your booking history.",
  },
];

const categoryDetails = {
  Electrician: {
    description:
      "From flickering lights to full rewiring jobs, our verified electricians handle residential and commercial work safely and up to code. Every technician carries insured tools and reports back with photos before and after the job.",
    image: "https://picsum.photos/seed/electrician/700/500",
  },
  Plumber: {
    description:
      "Leaky pipes, clogged drains, or a full bathroom fit-out — our plumbers arrive with the right parts on the first visit. Emergency leak response is available around the clock in most service areas.",
    image: "https://picsum.photos/seed/plumber/700/500",
  },
  "AC Technician": {
    description:
      "Gas refills, deep cleaning, and compressor repairs for split and window units. Our AC technicians are trained on all major local brands and carry diagnostic tools to spot issues before they become breakdowns.",
    image: "https://picsum.photos/seed/actechnician/700/500",
  },
  Cleaner: {
    description:
      "Book a one-time deep clean or a recurring schedule. Our cleaning teams bring their own eco-friendly supplies and follow a standard checklist so every visit meets the same quality bar.",
    image: "https://picsum.photos/seed/cleaner/700/500",
  },
};

const defaultDetail = {
  description:
    "Verified, background-checked professionals for every job in this category — booked in minutes and tracked live from dispatch to completion.",
  image: "https://picsum.photos/seed/service/700/500",
};

export default function Landing() {
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0]?.label ?? null,
  );

  const activeDetail = categoryDetails[selectedCategory] ?? defaultDetail;

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)]">
      <Navbar />

      {/* HERO */}
      <section className="mx-auto max-w-4xl px-5 pb-16 pt-16 text-center md:px-8 md:pt-24">
        <h1 className="font-[var(--font-display)] text-[2.6rem] font-semibold leading-[1.05] tracking-tight md:text-[3.4rem]">
          Reliable help, <br />
          <span className="text-[var(--color-amber)]">dispatched</span> to your
          door.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-lg text-[var(--color-muted)]">
          Book verified electricians, plumbers, cleaners and more — tracked live
          from request to finished job, like a delivery for your home repairs.
        </p>

        <form className="mx-auto mt-8 flex w-full max-w-2xl items-center gap-2 rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-2.5 shadow-[0_10px_30px_-15px_rgba(15,37,70,0.25)]">
          <Search
            className="ml-2 shrink-0 text-[var(--color-muted-2)]"
            size={22}
          />
          <input
            type="text"
            placeholder="What service do you need?"
            className="w-full bg-transparent py-2.5 text-base outline-none placeholder:text-[var(--color-muted-2)]"
          />
          <button type="submit" className="btn-primary shrink-0 text-sm">
            Find help
          </button>
        </form>

        <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-start justify-between gap-y-8">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex-1 min-w-[120px]">
              <div className="flex items-center justify-center gap-1.5">
                <Icon size={17} className="text-[var(--color-amber)]" />
                <span className="font-[var(--font-display)] text-lg font-semibold">
                  {value}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--color-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CATEGORY TOOLBELT */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="grid grid-cols-3 gap-x-6 gap-y-10 sm:grid-cols-6">
            {categories.map(({ icon: Icon, label }) => {
              const isActive = selectedCategory === label;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setSelectedCategory(label)}
                  className="group flex flex-col items-center gap-3 text-center"
                >
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-full border-2 transition-colors ${
                      isActive
                        ? "border-[var(--color-amber)] text-[var(--color-amber)]"
                        : "border-transparent text-[var(--color-ink)] group-hover:border-[var(--color-line)]"
                    }`}
                  >
                    <Icon size={22} />
                  </span>
                  <span className="text-sm font-medium">{label}</span>
                  <span
                    className={`h-[3px] w-8 rounded-full transition-colors ${
                      isActive ? "bg-[var(--color-amber)]" : "bg-transparent"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* SELECTED CATEGORY DETAIL CARD */}
          {selectedCategory && (
            <div className="mt-10 grid overflow-hidden rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] shadow-[0_10px_30px_-20px_rgba(15,37,70,0.25)] md:grid-cols-2">
              <div className="flex flex-col justify-center p-8 md:p-10">
                <span className="job-tag text-xs uppercase tracking-widest text-[var(--color-amber)]">
                  {selectedCategory}
                </span>
                <h3 className="mt-3 font-[var(--font-display)] text-2xl font-semibold tracking-tight md:text-3xl">
                  {selectedCategory} services, on demand.
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)] md:text-base">
                  {activeDetail.description}
                </p>
                <Link
                  to="/services"
                  className="btn-primary mt-6 inline-flex w-fit items-center gap-1.5 text-sm"
                >
                  Book a {selectedCategory.toLowerCase()}{" "}
                  <ArrowRight size={16} />
                </Link>
              </div>
              <div className="h-64 w-full md:h-auto">
                <img
                  src={activeDetail.image}
                  alt={selectedCategory}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="mx-auto max-w-6xl px-5 py-20 md:px-8"
      >
        <h2 className="section-title">Every job runs the same route.</h2>
        <p className="section-subtitle">
          Four checkpoints, start to finish — so you always know exactly where
          your job stands.
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <div className="ticket-notch rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-5">
                <span className="job-tag text-2xl font-semibold text-[var(--color-amber)]">
                  {s.n}
                </span>
                <h3 className="mt-3 font-[var(--font-display)] text-lg font-semibold">
                  {s.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--color-muted)]">
                  {s.body}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="perforation absolute -right-3 top-1/2 hidden w-6 -translate-y-1/2 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* POPULAR SERVICES */}
      <section className="border-y border-[var(--color-line)] bg-[var(--color-paper)] py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-[var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--color-ink)] md:text-4xl">
                Popular services
              </h2>
              <p className="mt-2 max-w-md text-[var(--color-muted)]">
                Starting prices for the jobs booked most this month.
              </p>
            </div>
            <Link
              to="/services"
              className="flex items-center gap-1 text-sm font-semibold text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]"
            >
              View all <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((s) => (
              <div
                key={s.id}
                className="rounded-xl border border-[var(--color-line)] bg-[var(--color-card)] p-5 shadow-[0_6px_20px_-12px_rgba(15,37,70,0.18)] transition-colors hover:border-[var(--color-amber)]/60"
              >
                <div className="flex items-center justify-between">
                  <span className="job-tag text-xs text-[var(--color-muted-2)]">
                    {s.id}
                  </span>
                  <span className="job-tag inline-flex items-center gap-1 text-xs text-[var(--color-muted)]">
                    <Star
                      size={12}
                      className="fill-[var(--color-amber)] text-[var(--color-amber)]"
                    />
                    {s.rating}
                  </span>
                </div>
                <h3 className="mt-3 font-[var(--font-display)] text-lg font-semibold">
                  {s.name}
                </h3>
                <p className="text-sm text-[var(--color-muted)]">
                  {s.category}
                </p>
                <div className="my-4 h-px w-full bg-[var(--color-line)]" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="job-tag text-xs uppercase tracking-widest text-[var(--color-muted-2)]">
                      Starting from
                    </p>
                    <p className="font-[var(--font-display)] text-xl font-semibold">
                      ৳{s.price}
                    </p>
                  </div>
                  <span className="job-tag text-xs text-[var(--color-muted)]">
                    ETA {s.eta}
                  </span>
                </div>
                <Link
                  to={`/book/${s.id}`}
                  className="btn-primary mt-4 block w-full text-center text-sm"
                >
                  Book now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-5 py-20 md:px-8">
        <h2 className="section-title">What our customers say</h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <div key={t.name} className="card p-6">
              <div className="flex gap-1 text-[var(--color-amber)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-[var(--color-amber)]"
                  />
                ))}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="perforation on-card my-4" />
              <p className="text-sm font-semibold">{t.name}</p>
              <p className="job-tag text-xs text-[var(--color-muted)]">
                Booked: {t.job}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 pb-20 md:px-8">
        <div className="ticket-notch flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--color-line)] bg-[var(--color-amber-soft)] p-8 md:flex-row md:items-center md:p-10">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight">
              Skilled with tools? Get on the dispatch board.
            </h2>
            <p className="mt-2 max-w-md text-sm text-[var(--color-ink-soft)]">
              Join as a verified provider and start receiving job tickets in
              your area.
            </p>
          </div>
          <Link to="/register?role=provider" className="btn-secondary shrink-0">
            Become a provider
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

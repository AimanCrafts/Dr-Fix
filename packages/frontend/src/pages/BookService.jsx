<<<<<<< HEAD:client/src/pages/BookService.jsx
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  Star,
  X,
  MapPin,
  CalendarDays,
  Phone,
  Pencil,
  MessageSquare,
  Banknote,
  Wallet,
  CreditCard,
  Tag,
  ShieldCheck,
  BadgeCheck,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { services } from "../data/placeholder";
import { isAuthenticated, getUser } from "../lib/auth";

const AREAS = [
  "Dhanmondi",
  "Gulshan",
  "Banani",
  "Mirpur",
  "Uttara",
  "Mohammadpur",
  "Bashundhara R/A",
  "Motijheel",
];

const TIME_SLOTS = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "12:00 PM - 02:00 PM",
  "02:00 PM - 04:00 PM",
  "04:00 PM - 06:00 PM",
  "06:00 PM - 08:00 PM",
];

const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash on Service",
    hint: "Pay the technician directly",
    icon: Banknote,
  },
  { id: "bkash", label: "bKash", hint: "Pay via bKash wallet", icon: Wallet },
  { id: "nagad", label: "Nagad", hint: "Pay via Nagad wallet", icon: Wallet },
  {
    id: "card",
    label: "Card",
    hint: "Visa, Mastercard, Amex",
    icon: CreditCard,
  },
];

const PLATFORM_FEE = 49;
const PROMO_CODE = "DRFIX50";
const PROMO_DISCOUNT = 50;

export default function BookService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const service = services.find((s) => s.id === id);
  const user = getUser();

  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [phone, setPhone] = useState(user?.phone || "+880 1XXX-XXXXXX");
  const [editingPhone, setEditingPhone] = useState(false);
  const [notes, setNotes] = useState("");
  const [payment, setPayment] = useState("cash");
  const [promoInput, setPromoInput] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoError, setPromoError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const applyPromo = () => {
    if (!promoInput.trim()) return;
    if (promoInput.trim().toUpperCase() === PROMO_CODE) {
      setPromoApplied(true);
      setPromoError("");
    } else {
      setPromoApplied(false);
      setPromoError("Invalid or expired code");
    }
  };

  const basePrice = service?.price ?? 0;
  const discount = promoApplied ? PROMO_DISCOUNT : 0;
  const total = basePrice + PLATFORM_FEE - discount;

  const [slotError, setSlotError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Time slot is a custom chip control (not a native input), so the
    // browser's built-in "required" validation can't catch it — check
    // it here and surface an inline message instead of doing nothing.
    if (!slot) {
      setSlotError("Please select a time slot");
      document
        .getElementById("time-slot-section")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSlotError("");

    if (!isAuthenticated()) {
      navigate("/login", { state: { from: { pathname: `/book/${id}` } } });
      return;
    }

    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 700));
    setSubmitting(false);
    setConfirmed(true);
  };

  if (!service) {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <header className="checkout-header">
          <span className="justify-self-start" />
          <span />
          <Link
            to="/dashboard"
            className="grid h-9 w-9 place-items-center justify-self-end rounded-full border border-[var(--color-line)] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-amber)] hover:text-[var(--color-amber)]"
            aria-label="Close"
          >
            <X size={16} />
          </Link>
        </header>
        <div className="mx-auto max-w-xl px-5 py-24 text-center">
          <p className="text-[var(--color-muted)]">
            We couldn&apos;t find that service.
          </p>
          <Link
            to="/services"
            className="mt-4 inline-block font-semibold text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]"
          >
            Browse all services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Minimal, focused checkout header — no marketing nav */}
      <header className="checkout-header">
        <span className="justify-self-start" />

        <h1 className="justify-self-center font-[var(--font-display)] text-2xl font-semibold tracking-tight text-[var(--color-ink)] md:text-3xl">
          {confirmed ? "Confirmation" : "Complete Your Booking"}
        </h1>

        <Link
          to="/dashboard"
          className="grid h-9 w-9 place-items-center justify-self-end rounded-full border border-[var(--color-line)] text-[var(--color-ink-soft)] transition-colors hover:border-[var(--color-amber)] hover:text-[var(--color-amber)]"
          aria-label="Cancel and return to dashboard"
        >
          <X size={16} />
        </Link>
      </header>

      {confirmed ? (
        <div className="mx-auto max-w-lg px-5 py-20 text-center md:px-8">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--color-teal-soft)]">
            <CheckCircle size={32} className="text-[var(--color-teal-dark)]" />
          </div>
          <h2 className="mt-5 font-[var(--font-display)] text-2xl font-semibold tracking-tight">
            Booking confirmed
          </h2>
          <p className="mt-2 text-sm text-[var(--color-muted)]">
            Your {service.name.toLowerCase()} request for{" "}
            {date || "your selected date"} has been logged. A verified
            technician will be dispatched to {city || "your area"} shortly.
          </p>
          <Link to="/dashboard" className="btn-primary mt-6 inline-flex">
            Go to dashboard
          </Link>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-5 py-8 md:px-8 md:py-10 lg:grid-cols-5 lg:items-start lg:gap-8"
        >
          {/* ============ LEFT COLUMN — customer input (~60%) ============ */}
          <div className="space-y-6 lg:col-span-3">
            {/* Service location */}
            <section className="card p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-amber-soft)] text-[var(--color-amber-dark)]">
                  <MapPin size={16} />
                </span>
                <h2 className="font-[var(--font-display)] text-base font-semibold">
                  Service location
                </h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    City / Area
                  </label>
                  <div className="relative mt-1.5">
                    <select
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field appearance-none pr-9"
                    >
                      <option value="" disabled>
                        Select an area
                      </option>
                      {AREAS.map((area) => (
                        <option key={area} value={area}>
                          {area}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    Landmark note
                    <span className="ml-1 normal-case tracking-normal text-[var(--color-muted-2)]">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="input-field mt-1.5"
                    placeholder="e.g. Near City Hospital"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    Full street address
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="input-field mt-1.5"
                    placeholder="House no, road, block"
                  />
                </div>
              </div>
            </section>

            {/* Schedule & slot */}
            <section className="card p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-amber-soft)] text-[var(--color-amber-dark)]">
                  <CalendarDays size={16} />
                </span>
                <h2 className="font-[var(--font-display)] text-base font-semibold">
                  Schedule &amp; slot
                </h2>
              </div>

              <div className="mt-5">
                <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Preferred date
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="input-field mt-1.5 sm:max-w-xs"
                />
              </div>

              <div id="time-slot-section" className="mt-5">
                <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Time slot
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {TIME_SLOTS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        setSlot(s);
                        setSlotError("");
                      }}
                      className={`slot-chip ${slot === s ? "selected" : ""}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
                {slotError && (
                  <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">
                    {slotError}
                  </p>
                )}
              </div>
            </section>

            {/* Contact details */}
            <section className="card p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-amber-soft)] text-[var(--color-amber-dark)]">
                  <Phone size={16} />
                </span>
                <h2 className="font-[var(--font-display)] text-base font-semibold">
                  Contact details
                </h2>
              </div>

              <div className="mt-5">
                <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Phone number
                </label>
                <div className="relative mt-1.5 sm:max-w-xs">
                  <input
                    type="tel"
                    required
                    readOnly={!editingPhone}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={`input-field pr-10 ${!editingPhone ? "text-[var(--color-muted)]" : ""}`}
                  />
                  <button
                    type="button"
                    onClick={() => setEditingPhone((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)] transition-colors hover:text-[var(--color-amber)]"
                    aria-label="Edit phone number"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            </section>

            {/* Special instructions */}
            <section className="card p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-amber-soft)] text-[var(--color-amber-dark)]">
                  <MessageSquare size={16} />
                </span>
                <h2 className="font-[var(--font-display)] text-base font-semibold">
                  Special instructions
                  <span className="ml-1.5 font-[var(--font-body)] text-xs font-normal text-[var(--color-muted-2)]">
                    (optional)
                  </span>
                </h2>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field mt-4 min-h-[96px] resize-y"
                placeholder="Anything the technician should know before arriving…"
              />
            </section>

            {/* Payment method */}
            <section className="card p-6">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-amber-soft)] text-[var(--color-amber-dark)]">
                  <Wallet size={16} />
                </span>
                <h2 className="font-[var(--font-display)] text-base font-semibold">
                  Payment method
                </h2>
              </div>

              <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
                {PAYMENT_METHODS.map(({ id: pid, label, hint, icon: Icon }) => (
                  <label
                    key={pid}
                    className={`pay-option ${payment === pid ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={pid}
                      checked={payment === pid}
                      onChange={() => setPayment(pid)}
                      className="sr-only"
                    />
                    <span className="pay-radio-dot" />
                    <Icon size={18} className="text-[var(--color-ink-soft)]" />
                    <span>
                      <span className="block text-sm font-semibold text-[var(--color-ink)]">
                        {label}
                      </span>
                      <span className="block text-xs text-[var(--color-muted)]">
                        {hint}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* ============ RIGHT COLUMN — sticky summary (~40%) ============ */}
          <aside className="lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
            <div className="card p-6">
              {/* Service summary */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="job-tag text-xs text-[var(--color-muted)]">
                    {service.id}
                  </span>
                  <h2 className="mt-1 font-[var(--font-display)] text-lg font-semibold tracking-tight">
                    {service.name}
                  </h2>
                  <p className="text-sm text-[var(--color-muted)]">
                    {service.category} · ETA {service.eta}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1 rounded-lg bg-[var(--color-amber-soft)] px-2.5 py-1">
                  <Star
                    size={14}
                    className="fill-[var(--color-amber)] text-[var(--color-amber)]"
                  />
                  <span className="text-sm font-semibold text-[var(--color-amber-dark)]">
                    {service.rating}
                  </span>
                </div>
              </div>

              <div className="perforation on-card my-5" />

              {/* Promo code */}
              <div>
                <label className="job-tag block text-xs uppercase tracking-widest text-[var(--color-muted)]">
                  Promo code
                </label>
                <div className="mt-1.5 flex items-stretch gap-2">
                  <div className="relative flex-1">
                    <Tag
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    />
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value);
                        setPromoError("");
                      }}
                      className="input-field pl-9"
                      placeholder="Enter code"
                      disabled={promoApplied}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={applyPromo}
                    disabled={promoApplied || !promoInput.trim()}
                    className="btn-secondary shrink-0 !px-4 !py-0 text-sm disabled:opacity-50"
                  >
                    {promoApplied ? "Applied" : "Apply"}
                  </button>
                </div>
                {promoError && (
                  <p className="mt-1.5 text-xs font-medium text-[var(--color-danger)]">
                    {promoError}
                  </p>
                )}
                {promoApplied && (
                  <p className="mt-1.5 text-xs font-medium text-[var(--color-teal-dark)]">
                    Code applied — ৳{PROMO_DISCOUNT} off
                  </p>
                )}
              </div>

              <div className="perforation on-card my-5" />

              {/* Price breakdown */}
              <div className="space-y-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted)]">Base price</span>
                  <span className="font-medium text-[var(--color-ink)]">
                    ৳{basePrice}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--color-muted)]">
                    Platform fee
                  </span>
                  <span className="font-medium text-[var(--color-ink)]">
                    ৳{PLATFORM_FEE}
                  </span>
                </div>
                {promoApplied && (
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-teal-dark)]">
                      Promo discount
                    </span>
                    <span className="font-medium text-[var(--color-teal-dark)]">
                      -৳{discount}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--color-teal-soft)] px-4 py-3">
                <span className="text-sm font-semibold text-[var(--color-ink-soft)]">
                  Total amount
                </span>
                <span className="font-[var(--font-display)] text-2xl font-semibold text-[var(--color-teal-dark)]">
                  ৳{total}
                </span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary mt-5 w-full py-3 text-base disabled:opacity-50"
              >
                {submitting ? "Confirming…" : "Confirm & Book Now"}
              </button>

              {/* Trust badges */}
              <div className="mt-5 grid grid-cols-2 gap-2 border-t border-[var(--color-line)] pt-4">
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <ShieldCheck
                    size={16}
                    className="shrink-0 text-[var(--color-teal-dark)]"
                  />
                  Verified technicians
                </div>
                <div className="flex items-center gap-2 text-xs text-[var(--color-muted)]">
                  <BadgeCheck
                    size={16}
                    className="shrink-0 text-[var(--color-teal-dark)]"
                  />
                  100% satisfaction guarantee
                </div>
              </div>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
=======
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
>>>>>>> origin/develop:packages/frontend/src/pages/BookService.jsx
}

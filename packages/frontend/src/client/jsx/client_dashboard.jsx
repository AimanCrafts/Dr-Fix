import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import "../css/client_dashboard.css";


const MOCK_USER = {
  name: "Rahim",
  membershipTier: "Silver",
};


const MOCK_ACTIVE_BOOKING = {
  technicianName: "Arif M.",
  technicianRole: "AC Specialist",
  eta: "Arriving in 15 minutes",
  vehicleNo: "DL 12 AB 1234",
  steps: [
    { label: "Booked", time: "10:30 AM", status: "done" },
    { label: "Assigned", time: "10:32 AM", status: "done" },
    { label: "On the way", time: "10:40 AM", status: "current" },
    { label: "Completed", time: "", status: "upcoming" },
  ],
};


const MOCK_PENDING_REVIEW = {
  serviceName: "AC repair",
  technicianName: "Arif M.",
};

const MOCK_MEMBERSHIP = {
  completed: 8,
  target: 10,
  tiers: ["Bronze", "Silver", "Gold"],
  currentTier: "Silver",
};

// Empty array -> "no bookings yet" empty state.
const MOCK_RECENT_SERVICES = [
  {
    id: 1,
    name: "AC Repair",
    date: "12 May 2025",
    technician: "Arif M.",
    status: "Completed",
  },
  {
    id: 2,
    name: "Plumbing Fix",
    date: "02 May 2025",
    technician: "Imran K.",
    status: "Completed",
  },
  {
    id: 3,
    name: "Electrical Repair",
    date: "22 Apr 2025",
    technician: "Sajjad H.",
    status: "Cancelled",
  },
];

// Empty array -> warranty section hidden entirely.
const MOCK_WARRANTIES = [
  {
    id: 1,
    name: "AC Repair",
    invoice: "#DFX1248",
    daysLeft: 23,
    status: "Active",
  },
  {
    id: 2,
    name: "Plumbing Fix",
    invoice: "#DFX1198",
    daysLeft: 15,
    status: "Active",
  },
  {
    id: 3,
    name: "Electrical Repair",
    invoice: "#DFX1130",
    daysLeft: 5,
    status: "Expiring Soon",
  },
];

const MOCK_ADDRESSES = [
  { id: 1, label: "Home", detail: "House 45, Road 12, Dhanmondi, Dhaka 1209" },
  { id: 2, label: "Office", detail: "Level 5, House 12, Banani, Dhaka 1213" },
];

const REFERRAL_CODE = "RAHIM100";

/* ---------------------------------------------------------------------- */

function ClientDashboard() {
  const [rating, setRating] = useState(0);

  const hasActiveBooking = Boolean(MOCK_ACTIVE_BOOKING);
  const hasPendingReview = Boolean(MOCK_PENDING_REVIEW);
  const hasRecentServices = MOCK_RECENT_SERVICES.length > 0;
  const hasWarranties = MOCK_WARRANTIES.length > 0;

  return (
    <div className="client-dashboard">
      <Header variant="app" />

      <div className="dashboard-container">
        {/* ---------------- Greeting ---------------- */}
        <section className="greeting">
          <h1>
            Hi {MOCK_USER.name},<br />
            how can we help your home today?
          </h1>
          <span className="membership-badge">
            🏅 {MOCK_USER.membershipTier} Member
          </span>
        </section>

        {/* ---------------- Quick actions ---------------- */}
        <section className="quick-actions">
          <Link to="/services" className="action-card action-card--primary">
            <span className="action-card__icon">+</span>
            <div>
              <h3>Book a New Fix</h3>
              <p>Find experts and book instantly</p>
            </div>
          </Link>

          <Link
            to="/booking-tracking"
            className={`action-card ${!hasActiveBooking ? "is-disabled" : ""}`}
            aria-disabled={!hasActiveBooking}
          >
            <span className="action-card__icon action-card__icon--outline">
              📍
            </span>
            <div>
              <h3>Track Active Service</h3>
              <p>See technician location and live status</p>
            </div>
          </Link>

          <Link
            to={
              hasRecentServices
                ? `/checkout?rebook=${MOCK_RECENT_SERVICES[0].id}`
                : "/services"
            }
            className="action-card"
          >
            <span className="action-card__icon action-card__icon--outline">
              🔄
            </span>
            <div>
              <h3>Rebook Last Service</h3>
              <p>Book the same service again in one tap</p>
            </div>
          </Link>
        </section>

        {/* ---------------- Active booking (conditional) ---------------- */}
        {hasActiveBooking && (
          <section className="card active-booking">
            <h2>Your Active Booking</h2>
            <div className="active-booking__row">
              <div className="active-booking__technician">
                <div className="avatar-placeholder" aria-hidden="true" />
                <div>
                  <p className="technician-name">
                    {MOCK_ACTIVE_BOOKING.technicianName}
                  </p>
                  <p className="technician-role">
                    {MOCK_ACTIVE_BOOKING.technicianRole}
                  </p>
                  <p className="technician-eta">{MOCK_ACTIVE_BOOKING.eta}</p>
                  <p className="technician-vehicle">
                    🚗 {MOCK_ACTIVE_BOOKING.vehicleNo}
                  </p>
                </div>
              </div>

              <div className="progress-steps">
                {MOCK_ACTIVE_BOOKING.steps.map((step, idx) => (
                  <div
                    key={step.label}
                    className={`progress-step progress-step--${step.status}`}
                  >
                    <div className="progress-step__dot" />
                    <p className="progress-step__label">{step.label}</p>
                    {step.time && (
                      <p className="progress-step__time">{step.time}</p>
                    )}
                    {idx < MOCK_ACTIVE_BOOKING.steps.length - 1 && (
                      <div className="progress-step__line" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ---------------- Rate last service + Membership ---------------- */}
        <section className="two-col">
          {hasPendingReview ? (
            <div className="card rate-service">
              <h2>Rate Your Last Service</h2>
              <div className="rate-service__row">
                <div
                  className="image-placeholder image-placeholder--sm"
                  aria-hidden="true"
                />
                <p>
                  How was your {MOCK_PENDING_REVIEW.serviceName} with{" "}
                  {MOCK_PENDING_REVIEW.technicianName}?
                </p>
              </div>
              <div className="rate-service__stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`star-btn ${n <= rating ? "is-filled" : ""}`}
                    onClick={() => setRating(n)}
                    aria-label={`${n} star`}
                  >
                    ★
                  </button>
                ))}
                <button type="button" className="btn btn--primary btn--sm">
                  Submit
                </button>
              </div>
            </div>
          ) : (
            <div className="card empty-card">
              <p>No pending reviews right now.</p>
            </div>
          )}

          <div className="card membership-progress">
            <div className="membership-progress__header">
              <h2>
                {MOCK_MEMBERSHIP.target - MOCK_MEMBERSHIP.completed > 0
                  ? `You're ${MOCK_MEMBERSHIP.target - MOCK_MEMBERSHIP.completed} services away from Gold Member`
                  : "You've reached Gold Member!"}
              </h2>
            </div>
            <div className="membership-progress__meta">
              <span>
                {MOCK_MEMBERSHIP.completed} of {MOCK_MEMBERSHIP.target} services
                completed
              </span>
              <span>
                {Math.round(
                  (MOCK_MEMBERSHIP.completed / MOCK_MEMBERSHIP.target) * 100,
                )}
                %
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-bar__fill"
                style={{
                  width: `${Math.round((MOCK_MEMBERSHIP.completed / MOCK_MEMBERSHIP.target) * 100)}%`,
                }}
              />
            </div>
            <div className="tier-row">
              {MOCK_MEMBERSHIP.tiers.map((tier) => (
                <div
                  key={tier}
                  className={`tier-badge ${tier === MOCK_MEMBERSHIP.currentTier ? "is-current" : ""}`}
                >
                  {tier}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- Recent services ---------------- */}
        <section className="section-block">
          <div className="section-block__header">
            <h2>Recent Services</h2>
            {hasRecentServices && <Link to="/bookings">View All</Link>}
          </div>

          {hasRecentServices ? (
            <div className="recent-services-grid">
              {MOCK_RECENT_SERVICES.map((service) => (
                <div key={service.id} className="card recent-service-card">
                  <div
                    className="image-placeholder image-placeholder--sm"
                    aria-hidden="true"
                  />
                  <p className="recent-service-card__name">{service.name}</p>
                  <p className="recent-service-card__meta">{service.date}</p>
                  <p className="recent-service-card__meta">
                    {service.technician}
                  </p>
                  <span
                    className={`status-badge status-badge--${
                      service.status === "Completed" ? "success" : "muted"
                    }`}
                  >
                    {service.status}
                  </span>
                  <Link to="/services" className="btn btn--outline-sm">
                    Book Again
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card empty-card empty-card--large">
              <div
                className="image-placeholder image-placeholder--sm"
                aria-hidden="true"
              />
              <p>
                No bookings yet. Book your first service and it&apos;ll show up
                here.
              </p>
              <Link to="/services" className="btn btn--primary btn--sm">
                Book Now
              </Link>
            </div>
          )}
        </section>

        {/* ---------------- Warranty + Addresses ---------------- */}
        <section className="two-col">
          {hasWarranties && (
            <div className="card warranty-tracker">
              <h2>Warranty Tracker</h2>
              {MOCK_WARRANTIES.map((w) => (
                <div key={w.id} className="warranty-row">
                  <div
                    className="image-placeholder image-placeholder--xs"
                    aria-hidden="true"
                  />
                  <div className="warranty-row__info">
                    <p className="warranty-row__name">{w.name}</p>
                    <p className="warranty-row__meta">
                      {w.date} · Invoice {w.invoice}
                    </p>
                  </div>
                  <span className="warranty-row__days">
                    {w.daysLeft} days left
                  </span>
                  <span
                    className={`status-badge status-badge--${
                      w.status === "Active" ? "success" : "warning"
                    }`}
                  >
                    {w.status}
                  </span>
                </div>
              ))}
              <Link to="/warranties" className="link-arrow">
                View All Warranties
              </Link>
            </div>
          )}

          <div className="card addresses">
            <h2>Saved Addresses</h2>
            {MOCK_ADDRESSES.map((addr) => (
              <div key={addr.id} className="address-chip">
                <span className="address-chip__icon">
                  {addr.label === "Home" ? "🏠" : "🏢"}
                </span>
                <div>
                  <p className="address-chip__label">{addr.label}</p>
                  <p className="address-chip__detail">{addr.detail}</p>
                </div>
                <button
                  type="button"
                  className="address-chip__more"
                  aria-label="More options"
                >
                  ⋯
                </button>
              </div>
            ))}
            <button type="button" className="add-address-btn">
              + Add New Address
            </button>
          </div>
        </section>

        {/* ---------------- Referral ---------------- */}
        <section className="card referral">
          <div
            className="image-placeholder image-placeholder--sm"
            aria-hidden="true"
          />
          <div className="referral__text">
            <h2>
              Invite a friend, both get{" "}
              <span className="text-accent">৳100 off</span>
            </h2>
            <p>Share your referral code and save on your next service.</p>
          </div>
          <div className="referral__code">
            <span>{REFERRAL_CODE}</span>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => navigator.clipboard?.writeText(REFERRAL_CODE)}
            >
              Copy
            </button>
          </div>
        </section>
      </div>

     
      <button type="button" className="support-fab">
        💬 Need Help?
      </button>

     
    </div>
  );
}

export default ClientDashboard;

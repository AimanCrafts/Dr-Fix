import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  CalendarCheck2,
  Check,
  ChevronRight,
  Home as HomeIcon,
  MapPin,
  RotateCcw,
  Star,
  Trash2,
  X,
} from "lucide-react";
import Header from "../../component/jsx/header.jsx";
import { listMyBookings } from "../api/bookings";
import { getCurrentUser } from "../api/auth";
import { createReview } from "../api/reviews";
import {
  listAddresses,
  createAddress,
  deleteAddress,
  makeAddressDefault,
} from "../api/addresses";
import "../css/client_dashboard.css";

const RATING_LABELS = {
  1: "Bad",
  2: "Below Average",
  3: "Average",
  4: "Good",
  5: "Great",
};

const STAGE_ORDER = ["pending", "accepted", "in_progress", "completed"];

function ClientDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [user, setUser] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ label: "", detail: "" });
  const [addingAddress, setAddingAddress] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState("");

  useEffect(() => {
    Promise.allSettled([
      listMyBookings(),
      getCurrentUser(),
      listAddresses(),
    ]).then(([bookingResult, userResult, addressResult]) => {
      if (bookingResult.status === "fulfilled") {
        setBookings(bookingResult.value.data);
      } else {
        setBookings([]);
      }

      if (userResult.status === "fulfilled") {
        setUser(userResult.value.data);
      } else {
        setUser(null);
      }

      if (addressResult.status === "fulfilled") {
        setAddresses(addressResult.value.data);
      } else {
        setAddresses([]);
      }

      setLoadingBookings(false);
    });
  }, []);

  const activeBooking = useMemo(
    () =>
      bookings.find(
        (booking) =>
          booking.status !== "completed" && booking.status !== "cancelled",
      ),
    [bookings],
  );

  const recentServices = useMemo(
    () => bookings.filter((booking) => booking.status === "completed"),
    [bookings],
  );

  const lastCompletedService = recentServices[0] || null;
  const pendingReview =
    lastCompletedService && !lastCompletedService.review
      ? lastCompletedService
      : null;

  const hasActiveBooking = Boolean(activeBooking);
  const hasRecentServices = recentServices.length > 0;
  const defaultAddress = addresses.find((address) => address.is_default);

  const activeStageIndex = activeBooking
    ? STAGE_ORDER.indexOf(activeBooking.status)
    : -1;

  const activeBookingSteps = activeBooking
    ? [
        { label: "Booked" },
        { label: "Assigned" },
        { label: "Service In Progress" },
        { label: "Completed" },
      ].map((step, index) => ({
        ...step,
        status:
          index < activeStageIndex
            ? "done"
            : index === activeStageIndex
              ? "current"
              : "upcoming",
      }))
    : [];

  const openRatingDialog = () => {
    if (!pendingReview) return;
    setRating(0);
    setHoveredRating(0);
    setReviewText("");
    setReviewError("");
    setReviewSuccess("");
    setIsRatingOpen(true);
  };

  const closeRatingDialog = () => {
    if (submittingReview) return;
    setIsRatingOpen(false);
  };

  const handleSubmitReview = async (event) => {
    event.preventDefault();
    if (!pendingReview || rating < 1) return;

    setSubmittingReview(true);
    setReviewError("");

    try {
      // ১. rating কে Number() বা Number.parseInt() দিয়ে integer করা হলো
      // ২. ৩টি আলাদা প্যারামিটার হিসেবে পাঠানো হলো

      const parsedRating = Number.parseInt(rating, 10);

      const response = await createReview(
        pendingReview.id,
        parsedRating,

        reviewText.trim() || null,
      );

      // reviews.js যদি সরাসরি response.data রিটার্ন করে, তবে response-ই ডাটা
      const data = response.data || response;

      setBookings((current) =>
        current.map((booking) =>
          booking.id === pendingReview.id
            ? { ...booking, review: data }
            : booking,
        ),
      );
      setReviewSuccess("Review submitted successfully.");
      setTimeout(() => {
        setIsRatingOpen(false);
        setReviewSuccess("");
      }, 900);
    } catch (error) {
      setReviewError(
        error.response?.data?.message ||
          "We could not submit your review. Please try again.",
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleAddAddress = async (event) => {
    event.preventDefault();
    if (!newAddress.label.trim() || !newAddress.detail.trim()) return;

    setAddingAddress(true);
    try {
      const { data } = await createAddress(newAddress);
      setAddresses((current) => [data, ...current]);
      setNewAddress({ label: "", detail: "" });
      setShowAddForm(false);
    } catch {
      // Keep the form open so the user can retry.
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    setAddresses((current) => current.filter((address) => address.id !== id));
    try {
      await deleteAddress(id);
    } catch {
      listAddresses()
        .then(({ data }) => setAddresses(data))
        .catch(() => {});
    }
  };

  const handleMakeDefault = async (id) => {
    try {
      await makeAddressDefault(id);
      const { data } = await listAddresses();
      setAddresses(data);
    } catch {
      // The current state remains unchanged if the request fails.
    }
  };

  return (
    <div className="client-dashboard">
      <Header variant="app" />

      <main className="dashboard-container">
        <section className="greeting">
          <h1>
            Hi {user?.name || "there"},<br />
            how can we help your home today?
          </h1>
        </section>

        <section className="quick-actions">
          <Link to="/services" className="action-card action-card--primary">
            <span className="action-card__icon">
              <CalendarCheck2 size={20} strokeWidth={2} />
            </span>
            <div>
              <h3>Book a New Fix</h3>
              <p>Find experts and book instantly</p>
            </div>
          </Link>

          {hasActiveBooking ? (
            <Link
              to={`/booking-tracking?bookingId=${activeBooking.id}`}
              className="action-card"
            >
              <span className="action-card__icon action-card__icon--outline">
                <MapPin size={20} strokeWidth={2} />
              </span>
              <div>
                <h3>Track Active Service</h3>
                <p>See your technician and live status</p>
              </div>
            </Link>
          ) : (
            <div className="action-card is-disabled" aria-disabled="true">
              <span className="action-card__icon action-card__icon--outline">
                <MapPin size={20} strokeWidth={2} />
              </span>
              <div>
                <h3>Track Active Service</h3>
                <p>No active booking right now</p>
              </div>
            </div>
          )}

          <Link
            to={
              hasRecentServices
                ? `/checkout?rebook=${recentServices[0].id}`
                : "/services"
            }
            className="action-card"
          >
            <span className="action-card__icon action-card__icon--outline">
              <RotateCcw size={20} strokeWidth={2} />
            </span>
            <div>
              <h3>Rebook Last Service</h3>
              <p>
                {hasRecentServices
                  ? "Book your last completed service again"
                  : "Choose a service to get started"}
              </p>
            </div>
          </Link>
        </section>

        {hasActiveBooking && (
          <section className="card active-booking">
            <h2>Your Active Booking</h2>
            <div className="active-booking__row">
              <div className="active-booking__technician">
                <div className="technician-avatar" aria-hidden="true">
                  {activeBooking.technician?.name?.charAt(0)?.toUpperCase() ||
                    "T"}
                </div>
                <div>
                  <p className="technician-name">
                    {activeBooking.technician?.name ||
                      "Finding a technician..."}
                  </p>
                  <p className="technician-role">
                    {activeBooking.service_name}
                  </p>
                  <p className="technician-eta">
                    {activeBooking.status === "pending" &&
                      "Waiting for a technician to accept"}
                    {activeBooking.status === "accepted" &&
                      "Technician assigned — service is scheduled"}
                    {activeBooking.status === "in_progress" &&
                      "Work in progress"}
                  </p>
                  <p className="technician-vehicle">
                    <MapPin size={13} /> {activeBooking.address}
                  </p>
                </div>
              </div>

              <div className="progress-steps">
                {activeBookingSteps.map((step, index) => (
                  <div
                    key={step.label}
                    className={`progress-step progress-step--${step.status}`}
                  >
                    <div className="progress-step__dot">
                      {step.status === "done" && <Check size={9} />}
                    </div>
                    <p className="progress-step__label">{step.label}</p>
                    {index < activeBookingSteps.length - 1 && (
                      <div className="progress-step__line" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="dashboard-feature-grid">
          <div className="card rate-service">
            <div className="card-heading-row">
              <div>
                <p className="eyebrow">FEEDBACK</p>
                <h2>Rate Your Last Service</h2>
              </div>
              <div className="heading-icon" aria-hidden="true">
                <Star size={19} />
              </div>
            </div>

            {pendingReview ? (
              <>
                <p className="rate-service__service-name">
                  {pendingReview.service_name}
                </p>
                <p className="rate-service__technician">
                  Technician: {pendingReview.technician?.name || "Technician"}
                </p>
                <button
                  type="button"
                  className="btn btn--primary btn--sm rate-service__open"
                  onClick={openRatingDialog}
                >
                  Rate Service
                </button>
              </>
            ) : (
              <div className="feature-empty-state">
                <p>
                  {lastCompletedService
                    ? "Your latest completed service has already been reviewed."
                    : "No completed service yet. Your completed service will appear here for rating."}
                </p>
              </div>
            )}
          </div>

          <div className="card address-summary" id="addresses">
            <div className="card-heading-row">
              <div>
                <p className="eyebrow">LOCATION</p>
                <h2>Default Address</h2>
              </div>
              <div className="heading-icon" aria-hidden="true">
                <HomeIcon size={19} />
              </div>
            </div>

            {defaultAddress ? (
              <div className="default-address-content">
                <div className="default-address-icon">
                  {defaultAddress.label === "Home" ? (
                    <HomeIcon size={19} />
                  ) : (
                    <Building2 size={19} />
                  )}
                </div>
                <div>
                  <strong>{defaultAddress.label}</strong>
                  <p>{defaultAddress.detail}</p>
                </div>
              </div>
            ) : (
              <div className="feature-empty-state">
                <p>No default address saved yet.</p>
              </div>
            )}

            <a href="#addresses-list" className="inline-link">
              Manage saved addresses <ChevronRight size={14} />
            </a>
          </div>
        </section>

        <section className="section-block" id="recent-services">
          <div className="section-block__header">
            <div>
              <p className="eyebrow">HISTORY</p>
              <h2>Recent Services</h2>
            </div>
            {hasRecentServices && <Link to="/my-bookings">View All</Link>}
          </div>

          {loadingBookings ? (
            <div className="card empty-card empty-card--large">
              <p>Loading your services...</p>
            </div>
          ) : hasRecentServices ? (
            <div className="recent-services-grid">
              {recentServices.slice(0, 3).map((service) => (
                <div key={service.id} className="card recent-service-card">
                  <div className="recent-service-card__top">
                    <div className="service-icon">
                      <Check size={18} />
                    </div>
                    <span className="status-badge status-badge--success">
                      Completed
                    </span>
                  </div>
                  <p className="recent-service-card__name">
                    {service.service_name}
                  </p>
                  <p className="recent-service-card__meta">
                    {service.technician?.name || "Technician"}
                  </p>
                  <p className="recent-service-card__meta">
                    {new Date(
                      service.completed_at ||
                        service.updated_at ||
                        service.created_at,
                    ).toLocaleDateString()}
                  </p>
                  <Link
                    to={`/checkout?rebook=${service.id}`}
                    className="btn btn--outline-sm"
                  >
                    Book Again
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="card empty-card empty-card--large">
              <div className="empty-state-icon">
                <CalendarCheck2 size={24} />
              </div>
              <h3>No completed services yet</h3>
              <p>
                Once you complete a service, it will appear here in your recent
                services.
              </p>
              <Link to="/services" className="btn btn--primary btn--sm">
                Browse Services
              </Link>
            </div>
          )}
        </section>

        <section className="card addresses" id="addresses-list">
          <div className="section-block__header">
            <div>
              <p className="eyebrow">SAVED LOCATIONS</p>
              <h2>Saved Addresses</h2>
            </div>
          </div>

          {addresses.length === 0 && !showAddForm && (
            <p className="empty-text">No saved addresses yet.</p>
          )}

          {addresses.map((address) => (
            <div key={address.id} className="address-chip">
              <span className="address-chip__icon">
                {address.label === "Home" ? (
                  <HomeIcon size={17} />
                ) : (
                  <Building2 size={17} />
                )}
              </span>
              <div className="address-chip__content">
                <p className="address-chip__label">
                  {address.label}
                  {address.is_default && (
                    <span className="address-chip__default">Default</span>
                  )}
                </p>
                <p className="address-chip__detail">{address.detail}</p>
              </div>
              {!address.is_default && (
                <button
                  type="button"
                  className="address-chip__action"
                  onClick={() => handleMakeDefault(address.id)}
                >
                  Set default
                </button>
              )}
              <button
                type="button"
                className="address-chip__delete"
                aria-label="Delete address"
                onClick={() => handleDeleteAddress(address.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}

          {showAddForm ? (
            <form className="add-address-form" onSubmit={handleAddAddress}>
              <input
                type="text"
                placeholder="Label (e.g. Home, Office)"
                value={newAddress.label}
                onChange={(event) =>
                  setNewAddress((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
              />
              <input
                type="text"
                placeholder="Full address"
                value={newAddress.detail}
                onChange={(event) =>
                  setNewAddress((current) => ({
                    ...current,
                    detail: event.target.value,
                  }))
                }
              />
              <div className="add-address-form__actions">
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={addingAddress}
                >
                  {addingAddress ? "Saving..." : "Save Address"}
                </button>
                <button
                  type="button"
                  className="btn btn--outline btn--sm"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="add-address-btn"
              onClick={() => setShowAddForm(true)}
            >
              + Add New Address
            </button>
          )}
        </section>
      </main>

      {isRatingOpen && pendingReview && (
        <div className="rating-modal-backdrop" onMouseDown={closeRatingDialog}>
          <div
            className="rating-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="rating-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="rating-modal__header">
              <div>
                <p className="eyebrow">SERVICE FEEDBACK</p>
                <h2 id="rating-modal-title">Rate Your Service</h2>
              </div>
              <button
                type="button"
                className="rating-modal__close"
                aria-label="Close rating dialog"
                onClick={closeRatingDialog}
              >
                <X size={19} />
              </button>
            </div>

            <div className="rating-modal__service">
              <div className="rating-modal__service-icon">
                <CalendarCheck2 size={20} />
              </div>
              <div>
                <strong>{pendingReview.service_name}</strong>
                <p>
                  Technician: {pendingReview.technician?.name || "Technician"}
                </p>
              </div>
            </div>

            <div className="rating-control">
              <div
                className="rating-stars"
                onMouseLeave={() => setHoveredRating(0)}
                aria-label="Choose a rating from one to five stars"
              >
                {[1, 2, 3, 4, 5].map((value) => {
                  const activeValue = hoveredRating || rating;
                  return (
                    <button
                      key={value}
                      type="button"
                      className={value <= activeValue ? "is-active" : ""}
                      onMouseEnter={() => setHoveredRating(value)}
                      onFocus={() => setHoveredRating(value)}
                      onClick={() => setRating(value)}
                      aria-label={`${value} star${value > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={32}
                        fill={value <= activeValue ? "currentColor" : "none"}
                        strokeWidth={1.8}
                      />
                    </button>
                  );
                })}
              </div>
              <p className="rating-label">
                {RATING_LABELS[hoveredRating || rating] || "Select a rating"}
              </p>
            </div>

            <label className="review-field">
              <span>Your Review</span>
              <textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.target.value)}
                placeholder="Tell us about your experience..."
                maxLength={1000}
                rows={5}
              />
              <small>{reviewText.length}/1000</small>
            </label>

            {reviewError && <p className="rating-form-error">{reviewError}</p>}
            {reviewSuccess && (
              <p className="rating-form-success">{reviewSuccess}</p>
            )}

            <div className="rating-modal__footer">
              <button
                type="button"
                className="btn btn--primary"
                disabled={rating === 0 || submittingReview}
                onClick={handleSubmitReview}
              >
                {submittingReview ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;

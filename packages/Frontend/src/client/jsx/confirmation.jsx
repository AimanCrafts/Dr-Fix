import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getBooking } from "../api/bookings";
import logo from "../../assets/logo.png";
import "../css/confirmation.css";

/**
 * Booking Confirmed (client/jsx/confirmation.jsx)
 * ---------------------------------------------------
 * Previously showed a hardcoded "Arif M." as if a technician was
 * already assigned the moment a booking was made. That's no longer
 * true — a booking starts unassigned ("pending") and only gets a
 * technician once one of them accepts it (see TechnicianBookingController).
 *
 * So this page now polls GET /api/bookings/{id} every few seconds and
 * updates the "Technician" row once someone accepts. No websockets —
 * simple polling is enough for this scope.
 */
function BookingConfirmed() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const paymentStatus = searchParams.get("payment");
  const paymentMethodLabel = searchParams.get("paymentMethod");
  const paymentTransactionId = searchParams.get("transactionId");
  const serviceFallback = searchParams.get("service") || "Service";
  const dateFallback = searchParams.get("date") || "Today";
  const slotFallback = searchParams.get("slot") || "";

  const [booking, setBooking] = useState(null);

  useEffect(() => {
    if (!bookingId) return undefined;

    let cancelled = false;
    let stopped = false;

    const poll = () => {
      if (stopped) return;
      getBooking(bookingId)
        .then(({ data }) => {
          if (cancelled) return;
          setBooking(data);
          if (data.status === "completed" || data.status === "cancelled") {
            stopped = true;
          }
        })
        .catch(() => {
          /* booking might not exist / network hiccup — just keep showing fallback */
        });
    };

    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingId]);

  const service = booking?.service_name || serviceFallback;
  const date = booking?.date_label || dateFallback;
  const slot = booking?.time_slot || slotFallback;
  const address = booking?.address || "—";
  const status = booking?.status || "pending";

  // Prefer what the server saved on the booking; fall back to the checkout link
  // only while the booking is still loading or the API doesn't return payment fields.
  const hasServerPayment = booking && booking.payment_status !== undefined;
  const isPaid = hasServerPayment
    ? /^paid/.test(String(booking.payment_status))
    : paymentStatus === "success";
  const payProvider =
    (hasServerPayment && booking.payment_provider) ||
    paymentMethodLabel ||
    "Mobile banking";
  const payReference =
    (hasServerPayment && booking.payment_transaction_id) ||
    paymentTransactionId ||
    "";

  return (
    <div className="confirmed-page">
      <div className="focus-bar">
        <Link to="/" className="focus-bar__brand" aria-label="Dr.-Fix home">
          <img src={logo} alt="Dr.-Fix logo" className="focus-bar__logo" />
          <span className="focus-bar__name">Dr.-Fix</span>
        </Link>
      </div>

      <div className="confirmed-container">
        <div className="success-icon" aria-hidden="true">
          ✓
        </div>

        <h1>Booking Confirmed!</h1>
        <p className="confirmed-subtext">
          {status === "accepted" || status === "in_progress"
            ? status === "in_progress"
              ? "Your technician is currently working on the service."
              : "A technician has accepted your job and is preparing for the service."
            : status === "completed"
              ? "This service has been completed."
              : "We're matching you with a nearby available technician. This page updates automatically."}
        </p>
        <div className="card summary-card">
          <div className="summary-row summary-row--id">
            <span className="summary-row__icon">📅</span>
            <p>
              Booking ID <span className="text-accent">#{bookingId}</span>
            </p>
          </div>
          <div className="summary-divider" />

          <div className="summary-row">
            <span className="summary-row__icon">🧰</span>
            <span className="summary-row__label">Service:</span>
            <span className="summary-row__value">{service}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__icon">📅</span>
            <span className="summary-row__label">Date &amp; Time:</span>
            <span className="summary-row__value">
              {date}
              {slot ? `, ${slot}` : ""}
            </span>
          </div>
          <div className="summary-row">
            <span className="summary-row__icon">📍</span>
            <span className="summary-row__label">Address:</span>
            <span className="summary-row__value">{address}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__icon">👤</span>
            <span className="summary-row__label">Technician:</span>
            <span className="summary-row__value">
              {booking?.technician?.name || "Finding a technician..."}
            </span>
          </div>
          <div className="summary-divider" />
          <div className="summary-row summary-row--top">
            <span className="summary-row__icon">💳</span>
            <span className="summary-row__label">Payment:</span>
            <div className="summary-row__value summary-row__value--stack">
              <span className="summary-pay-line">
                {isPaid ? payProvider : "Cash on service"}
                <span
                  className={`summary-pill ${isPaid ? "summary-pill--paid" : "summary-pill--due"}`}
                >
                  {isPaid ? "Paid" : "Pay after the job"}
                </span>
              </span>
              {isPaid && payReference && (
                <span className="summary-sub">
                  Transaction ID: {payReference}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="confirmed-actions">
          <Link
            to={`/booking-tracking?bookingId=${bookingId}`}
            className="btn btn--primary"
          >
            Track Booking
          </Link>
          <Link to="/client_dashboard" className="btn btn--outline">
            Go to Dashboard
          </Link>
        </div>

        <p className="confirmed-support">
          Need to make changes? <Link to="/contact">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}

export default BookingConfirmed;

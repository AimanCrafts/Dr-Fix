import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import { getBooking, listMyBookings } from "../api/bookings";
import "../css/confirmation.css";
import "../css/booking-tracking.css";

/**
 * Track Service (client/jsx/booking-tracking.jsx)
 * -------------------------------------------------
 * Was a dead link (/booking-tracking) from both the dashboard's "Track
 * Active Service" card and confirmation.jsx's "Track Booking" button —
 * no route/page existed for it at all.
 *
 * Shows the full technician-reported progress:
 *   Booked -> Accepted -> On The Way -> Arrived -> Work Started -> Completed
 * (each stage set by the matching endpoint in TechnicianBookingController).
 * Polls GET /api/bookings/{id} every few seconds so it updates live as
 * the technician moves through the job on their end.
 *
 * If no ?bookingId= is given (e.g. someone just clicks the sidebar/card
 * link with nothing active), falls back to the customer's own most
 * recent non-finished booking, if any.
 */
const STAGES = [
  { key: "pending", label: "Booked" },
  { key: "accepted", label: "Accepted" },
  { key: "on_the_way", label: "On The Way" },
  { key: "arrived", label: "Arrived" },
  { key: "in_progress", label: "Work Started" },
  { key: "completed", label: "Completed" },
];

const STAGE_INDEX = STAGES.reduce((acc, s, i) => {
  acc[s.key] = i;
  return acc;
}, {});

function BookingTracking() {
  const [searchParams] = useSearchParams();
  const paramId = searchParams.get("bookingId");

  const [bookingId, setBookingId] = useState(paramId);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFoundActive, setNotFoundActive] = useState(false);

  // No bookingId in the URL — fall back to the most recent booking that
  // isn't finished yet (mirrors the "Active Booking" logic on the
  // dashboard).
  useEffect(() => {
    if (bookingId) return;

    listMyBookings()
      .then(({ data }) => {
        const active = data.find(
          (b) => b.status !== "completed" && b.status !== "cancelled",
        );
        if (active) {
          setBookingId(active.id);
        } else {
          setNotFoundActive(true);
          setLoading(false);
        }
      })
      .catch(() => {
        setNotFoundActive(true);
        setLoading(false);
      });
  }, [bookingId]);

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
          setLoading(false);
          if (data.status === "completed" || data.status === "cancelled") {
            stopped = true;
          }
        })
        .catch(() => {
          if (cancelled) return;
          setLoading(false);
        });
    };

    poll();
    const interval = setInterval(poll, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [bookingId]);

  const currentIndex = booking ? (STAGE_INDEX[booking.status] ?? 0) : -1;

  return (
    <div className="confirmed-page">
      <Header variant="app" />

      <div className="confirmed-container tracking-container">
        <h1>Track Service</h1>

        {loading && <p className="empty-text">Loading...</p>}

        {!loading && notFoundActive && !booking && (
          <div className="card empty-card empty-card--large">
            <p>You don&apos;t have any active booking to track right now.</p>
            <Link to="/services" className="btn btn--primary btn--sm">
              Book a Service
            </Link>
          </div>
        )}

        {booking && (
          <>
            <p className="confirmed-subtext">
              {booking.status === "completed"
                ? "This service has been completed."
                : booking.status === "cancelled"
                  ? "This booking was cancelled."
                  : "This page updates automatically as your technician progresses."}
            </p>

            {/* Stage timeline */}
            <div className="tracking-timeline">
              {STAGES.map((stage, idx) => {
                const isDone = idx < currentIndex;
                const isCurrent = idx === currentIndex;
                const state = isDone
                  ? "done"
                  : isCurrent
                    ? "current"
                    : "upcoming";

                return (
                  <div
                    key={stage.key}
                    className={`tracking-step tracking-step--${state}`}
                  >
                    <div className="tracking-step__dot" />
                    <p className="tracking-step__label">{stage.label}</p>
                    {idx < STAGES.length - 1 && (
                      <div className="tracking-step__line" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="card summary-card">
              <div className="summary-row summary-row--id">
                <span className="summary-row__icon">📅</span>
                <p>
                  Booking ID{" "}
                  <span className="text-accent">#{booking.id}</span>
                </p>
              </div>
              <div className="summary-divider" />

              <div className="summary-row">
                <span className="summary-row__icon">🧰</span>
                <span className="summary-row__label">Service:</span>
                <span className="summary-row__value">
                  {booking.service_name}
                </span>
              </div>
              <div className="summary-row">
                <span className="summary-row__icon">📍</span>
                <span className="summary-row__label">Address:</span>
                <span className="summary-row__value">{booking.address}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row__icon">👤</span>
                <span className="summary-row__label">Technician:</span>
                <span className="summary-row__value">
                  {booking.technician?.name || "Finding a technician..."}
                </span>
              </div>
            </div>

            <div className="confirmed-actions">
              <Link to="/client_dashboard" className="btn btn--outline">
                Go to Dashboard
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default BookingTracking;

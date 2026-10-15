import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Wrench } from "lucide-react";
import Header from "../../component/jsx/header.jsx";
import { listMyBookings } from "../api/bookings";
import CancelBooking from "./cancel-booking.jsx";
import "../css/my-bookings.css";

// "pending" counts as active: the request is still live and can be cancelled.
const activeStatuses = ["pending", "accepted", "in_progress"];

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyBookings()
      .then(({ data }) => {
        setBookings(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        setError(e.response?.data?.message || "Could not load bookings.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleCancelled = (updated) =>
    setBookings((prev) =>
      prev.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)),
    );

  const active = useMemo(
    () => bookings.filter((booking) => activeStatuses.includes(booking.status)),
    [bookings],
  );

  const history = useMemo(
    () =>
      bookings.filter((booking) => !activeStatuses.includes(booking.status)),
    [bookings],
  );

  const statusClass = (status) =>
    ["accepted", "in_progress"].includes(status) ? "active" : status;

  const renderBookingCard = (booking) => (
    <article
      className={`booking-card ${
        activeStatuses.includes(booking.status) ? "booking-card--active" : ""
      }`}
      key={booking.id}
    >
      <div className="booking-card__top">
        <span className="booking-card__icon" aria-hidden="true">
          <Wrench size={17} />
        </span>
        <span
          className={`booking-status booking-status--${statusClass(booking.status)}`}
        >
          {String(booking.status || "")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())}
        </span>
      </div>

      <h3>{booking.service_name}</h3>
      <p className="booking-card__id">Booking #{booking.id}</p>

      <div className="booking-card__details">
        <span>
          <CalendarDays size={15} /> {booking.date_label} · {booking.time_slot}
        </span>
        <span>
          <MapPin size={15} /> {booking.address}
        </span>
      </div>

      <div className="booking-card__footer">
        <strong>৳{Number(booking.price || 0).toLocaleString()}</strong>

        <div className="booking-card__actions">
          {activeStatuses.includes(booking.status) && (
            <Link
              className="booking-card__action"
              to={`/booking-tracking?bookingId=${booking.id}`}
            >
              Track Service
            </Link>
          )}

          {booking.status === "completed" && (
            <Link
              className="booking-card__action"
              to={`/booking-tracking?bookingId=${booking.id}`}
            >
              View Details
            </Link>
          )}

          <CancelBooking booking={booking} onCancelled={handleCancelled} />
        </div>
      </div>
    </article>
  );

  return (
    <div className="my-bookings-page">
      <Header variant="client" />

      <main className="my-bookings-container">
        <div className="my-bookings-heading">
          <div>
            <h1>My Bookings</h1>
            <p>Track your current services and review your previous bookings.</p>
          </div>
          <Link to="/services" className="my-bookings-book-btn">
            Book a New Fix
          </Link>
        </div>

        {error && <div className="my-bookings-empty my-bookings-empty--compact">{error}</div>}

        {loading ? (
          <div className="my-bookings-empty my-bookings-empty--compact">
            <p>Loading bookings...</p>
          </div>
        ) : (
          <>
            <section className="my-bookings-section">
              <div className="my-bookings-section__heading">
                <h2>Active Bookings</h2>
                <span>{active.length}</span>
              </div>

              {active.length > 0 ? (
                <div className="my-bookings-grid">
                  {active.map(renderBookingCard)}
                </div>
              ) : (
                <div className="my-bookings-empty my-bookings-empty--compact">
                  <p>No active bookings right now.</p>
                </div>
              )}
            </section>

            <section className="my-bookings-section">
              <div className="my-bookings-section__heading">
                <h2>Booking History</h2>
                <span>{history.length}</span>
              </div>

              {history.length > 0 ? (
                <div className="my-bookings-grid">
                  {history.map(renderBookingCard)}
                </div>
              ) : (
                <div className="my-bookings-empty my-bookings-empty--compact">
                  <p>No previous bookings yet.</p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default MyBookings;

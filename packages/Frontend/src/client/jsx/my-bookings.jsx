import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import { listMyBookings } from "../api/bookings";
import "../css/my-bookings.css";

const activeStatuses = ["accepted", "in_progress"];

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

  const active = useMemo(
    () => bookings.filter((booking) => activeStatuses.includes(booking.status)),
    [bookings],
  );

  const history = useMemo(
    () =>
      bookings.filter((booking) => !activeStatuses.includes(booking.status)),
    [bookings],
  );

  const renderBookingCard = (booking) => (
    <article className="my-booking-card" key={booking.id}>
      <div>
        <span className={`booking-status booking-status--${booking.status}`}>
          {String(booking.status || "")
            .replaceAll("_", " ")
            .replace(/\b\w/g, (letter) => letter.toUpperCase())}
        </span>

        <h2>{booking.service_name}</h2>

        <p>
          {booking.date_label} · {booking.time_slot}
        </p>

        <p>{booking.address}</p>
      </div>

      <div className="my-booking-card__side">
        <strong>৳{Number(booking.price || 0).toLocaleString()}</strong>

        {activeStatuses.includes(booking.status) && (
          <Link to={`/track-service/${booking.id}`}>Track Service</Link>
        )}

        {booking.status === "completed" && (
          <Link to={`/track-service/${booking.id}`}>View Details</Link>
        )}
      </div>
    </article>
  );

  return (
    <div className="my-bookings-page">
      <Header variant="client" />

      <main className="my-bookings-main">
        <p className="my-bookings-eyebrow">Your services</p>

        <h1>My Bookings</h1>

        <p className="my-bookings-intro">
          Track your current services and review your previous bookings.
        </p>

        {error && <div className="my-bookings-error">{error}</div>}

        {loading ? (
          <div className="my-bookings-empty">Loading bookings...</div>
        ) : (
          <>
            <section>
              <h2>Active Bookings</h2>

              {active.length > 0 ? (
                active.map(renderBookingCard)
              ) : (
                <div className="my-bookings-empty">
                  No active bookings right now.
                </div>
              )}
            </section>

            <section>
              <h2>Booking History</h2>

              {history.length > 0 ? (
                history.map(renderBookingCard)
              ) : (
                <div className="my-bookings-empty">
                  No previous bookings yet.
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

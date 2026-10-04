import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import { listMyJobs } from "../api/bookings";
import "../css/my-bookings.css";

// New technician booking flow:
// pending → accepted → in_progress → completed
const activeStatuses = ["pending", "accepted", "in_progress"];

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listMyJobs()
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

  const card = (booking) => (
    <article className="my-booking-card" key={booking.id}>
      <div>
        <span className={`booking-status booking-status--${booking.status}`}>
          {String(booking.status || "").replaceAll("_", " ")}
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
          <Link to={`/booking-tracking?bookingId=${booking.id}`}>
            View Booking
          </Link>
        )}
      </div>
    </article>
  );

  return (
    <div className="my-bookings-page">
      <Header variant="app" />

      <main className="my-bookings-main">
        <p className="my-bookings-eyebrow">Your jobs</p>

        <h1>My Bookings</h1>

        <p className="my-bookings-intro">
          View your accepted jobs and completed service history.
        </p>

        {error && <div className="my-bookings-error">{error}</div>}

        {loading ? (
          <div className="my-bookings-empty">Loading bookings...</div>
        ) : (
          <>
            {/* ACTIVE BOOKINGS */}
            <section>
              <h2>Active Bookings</h2>

              {active.length > 0 ? (
                active.map(card)
              ) : (
                <div className="my-bookings-empty">
                  No active bookings right now.
                </div>
              )}
            </section>

            {/* BOOKING HISTORY */}
            <section>
              <h2>Booking History</h2>

              {history.length > 0 ? (
                history.map(card)
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

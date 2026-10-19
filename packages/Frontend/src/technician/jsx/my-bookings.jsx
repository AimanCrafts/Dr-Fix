import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import { listMyJobs } from "../api/bookings";
import "../css/my-bookings.css";
import "../css/technician-design-system.css";

// New technician booking flow:
// pending → accepted → in_progress → completed
const activeStatuses = ["pending", "accepted", "in_progress"];

// What the technician should expect for payment on this job.
const paymentLine = (booking) => {
  const online = String(booking.payment_method || "").startsWith("online");
  if (online) {
    if (/^paid/.test(String(booking.payment_status || ""))) {
      return "Payment: paid online";
    }
    return booking.status === "completed"
      ? "Payment: waiting for the customer to pay online"
      : "Payment: customer will pay online after the job";
  }
  return "Payment: collect cash from the customer";
};

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
    <article className="tech-booking-card" key={booking.id}>
      <div>
        <span className={`tech-booking-status tech-booking-status--${booking.status}`}>
          {String(booking.status || "").replaceAll("_", " ")}
        </span>

        <h2>{booking.service_name}</h2>

        <p>
          {booking.date_label} · {booking.time_slot}
        </p>

        <p>{booking.address}</p>

        {booking.status !== "cancelled" && <p>{paymentLine(booking)}</p>}
      </div>

      <div className="tech-booking-card__side">
        <strong>৳{Number(booking.price || 0).toLocaleString()}</strong>

        {activeStatuses.includes(booking.status) && (
          <Link to="/technician/schedule">View in Schedule</Link>
        )}
      </div>
    </article>
  );

  return (
    <div className="tech-bookings-page">
      <Header variant="technician" />

      <main className="tech-bookings-main">
        <h1>My Bookings</h1>

        <p className="tech-bookings-intro">
          View your accepted jobs and completed service history.
        </p>

        {error && <div className="tech-bookings-error">{error}</div>}

        {loading ? (
          <div className="tech-bookings-empty">Loading bookings...</div>
        ) : (
          <>
            {/* ACTIVE BOOKINGS */}
            <section>
              <h2>Active Bookings</h2>

              {active.length > 0 ? (
                active.map(card)
              ) : (
                <div className="tech-bookings-empty">
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
                <div className="tech-bookings-empty">
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

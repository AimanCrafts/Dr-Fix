import { useSearchParams, Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import "../css/confirmation.css";



const MOCK_ADDRESS = "Home, Dhanmondi";
const MOCK_TECHNICIAN = "Arif M."; // pretend auto-match already assigned someone

function BookingConfirmed() {
  const [searchParams] = useSearchParams();

  const bookingId = searchParams.get("bookingId") || "DFX00000";
  const service = searchParams.get("service") || "Service";
  const date = searchParams.get("date") || "Today";
  const slot = searchParams.get("slot") || "";

  return (
    <div className="confirmed-page">
      <Header variant="app" />

      <div className="confirmed-container">
        <div className="success-icon" aria-hidden="true">
          ✓
        </div>

        <h1>Booking Confirmed!</h1>
        <p className="confirmed-subtext">
          Your technician will arrive as scheduled. We&apos;ve sent the details
          to your email.
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
            <span className="summary-row__value">{MOCK_ADDRESS}</span>
          </div>
          <div className="summary-row">
            <span className="summary-row__icon">👤</span>
            <span className="summary-row__label">Technician:</span>
            <span className="summary-row__value">{MOCK_TECHNICIAN}</span>
          </div>
        </div>

        <div className="confirmed-actions">
          <Link to="/booking-tracking" className="btn btn--primary">
            Track Booking
          </Link>
          <Link to="/client_dashboard" className="btn btn--outline">
            Go to Dashboard
          </Link>
        </div>

        <p className="confirmed-support">
          Need to make changes? <a href="#">Contact Support</a>
        </p>
      </div>
    </div>
  );
}

export default BookingConfirmed;

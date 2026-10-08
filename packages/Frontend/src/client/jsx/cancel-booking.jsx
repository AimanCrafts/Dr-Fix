import { useState } from "react";
import { cancelBooking } from "../api/bookings";
import "../css/cancel-booking.css";

/** A booking can be cancelled until the technician starts the work. */
export const canCancel = (booking) =>
  Boolean(booking) && ["pending", "accepted"].includes(booking.status);

/**
 * CancelBooking (client/jsx/cancel-booking.jsx)
 * Two-step cancel used on My Bookings and the tracking page: a quiet link
 * first, then an explicit "Yes, cancel" so nobody cancels by accident.
 */
function CancelBooking({ booking, onCancelled }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!canCancel(booking)) return null;

  const handleCancel = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await cancelBooking(booking.id);
      setConfirming(false);
      onCancelled?.(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't cancel this booking. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!confirming) {
    return (
      <button
        type="button"
        className="cancel-booking__link"
        onClick={() => setConfirming(true)}
      >
        Cancel booking
      </button>
    );
  }

  return (
    <div className="cancel-booking__confirm" role="alertdialog">
      <p>
        Cancel this booking?
        {booking.status === "accepted" &&
          " A technician has already accepted it and will be told."}
      </p>

      {error && <p className="cancel-booking__error">{error}</p>}

      <div className="cancel-booking__actions">
        <button
          type="button"
          className="cancel-booking__yes"
          disabled={busy}
          onClick={handleCancel}
        >
          {busy ? "Cancelling..." : "Yes, cancel"}
        </button>
        <button
          type="button"
          className="cancel-booking__no"
          disabled={busy}
          onClick={() => {
            setConfirming(false);
            setError("");
          }}
        >
          Keep booking
        </button>
      </div>
    </div>
  );
}

export default CancelBooking;

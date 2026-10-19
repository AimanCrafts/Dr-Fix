import { useRef, useState } from "react";
import PaymentModal from "./PaymentModal.jsx";
import { payBooking } from "../api/bookings";
import "../css/pay-booking.css";

/**
 * Pay for a booking (client/jsx/pay-booking.jsx)
 * ------------------------------------------------
 * Online payment happens AFTER the work. Flow:
 *   book (nothing is paid) -> technician completes the job -> "Pay now".
 *
 * The gateway screens in PaymentModal are a sandbox (no real money). Once
 * they succeed we call POST /api/bookings/{id}/pay and the SERVER decides
 * the payment status and the transaction id.
 */

const isOnline = (booking) =>
  String(booking?.payment_method || "").startsWith("online");

/** Completed, paid online, and still unpaid -> the customer owes a payment. */
export const needsPayment = (booking) =>
  !!booking &&
  booking.status === "completed" &&
  isOnline(booking) &&
  booking.payment_status === "unpaid";

const isPaidOnline = (booking) =>
  isOnline(booking) && /^paid/.test(String(booking.payment_status || ""));

/** Button + sandbox gateway. `returnTo` is where "Return to Dr.-Fix" goes. */
export function PayNowButton({ booking, returnTo, small = false, onClosed }) {
  const [open, setOpen] = useState(false);
  const paid = useRef(null);

  const handleSuccess = async (details) => {
    const provider = String(details.method || "").replace("online_", "");
    try {
      const { data } = await payBooking(booking.id, {
        provider,
        phone: details.phone || undefined,
        card_last4: details.cardLast4 || undefined,
      });
      paid.current = data;
      return { path: returnTo, transactionId: data.payment_transaction_id };
    } catch (err) {
      throw new Error(
        err.response?.data?.message ||
          "The payment could not be recorded. Please try again.",
      );
    }
  };

  const handleClose = () => {
    setOpen(false);
    onClosed?.(paid.current);
  };

  return (
    <>
      {needsPayment(booking) && (
        <button
          type="button"
          className={`pay-now-btn ${small ? "pay-now-btn--small" : ""}`}
          onClick={() => setOpen(true)}
        >
          Pay ৳{Number(booking.price || 0).toLocaleString()}
        </button>
      )}
      {open && (
        <PaymentModal
          amount={Number(booking.price || 0)}
          serviceName={booking.service_name}
          onClose={handleClose}
          onPaymentSuccess={handleSuccess}
        />
      )}
    </>
  );
}

/** Payment summary card shown on the Track Service page. */
export function PaymentPanel({ booking, returnTo }) {
  if (!booking || booking.status === "cancelled") return null;

  if (needsPayment(booking)) {
    return (
      <div className="pay-panel pay-panel--due">
        <div>
          <p className="pay-panel__title">Payment due</p>
          <p className="pay-panel__sub">
            Your service is complete. Please pay ৳
            {Number(booking.price || 0).toLocaleString()} online.
          </p>
        </div>
        <PayNowButton booking={booking} returnTo={returnTo} />
      </div>
    );
  }

  let title;
  let sub;
  let pill = null;

  if (isPaidOnline(booking)) {
    title = `Paid with ${booking.payment_provider || "online payment"}`;
    sub = booking.payment_transaction_id
      ? `Transaction ID: ${booking.payment_transaction_id}`
      : "Payment received.";
    pill = <span className="pay-pill pay-pill--paid">Paid</span>;
  } else if (isOnline(booking)) {
    title = "Online payment";
    sub = "You will pay in the app after the technician completes the service.";
    pill = <span className="pay-pill pay-pill--due">Pay after the job</span>;
  } else if (booking.payment_status === "cash_collected") {
    title = "Cash on service";
    sub = "Paid to the technician in cash.";
    pill = <span className="pay-pill pay-pill--paid">Paid</span>;
  } else {
    title = "Cash on service";
    sub = "Pay the technician in cash when the service is complete.";
    pill = <span className="pay-pill pay-pill--due">Pay after the job</span>;
  }

  return (
    <div className="pay-panel">
      <div>
        <p className="pay-panel__title">{title}</p>
        <p className="pay-panel__sub">{sub}</p>
      </div>
      {pill}
    </div>
  );
}

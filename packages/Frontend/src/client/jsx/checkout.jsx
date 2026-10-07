import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import { createBooking } from "../api/bookings";
import { listServices } from "../api/services";
import { listAddresses, createAddress } from "../api/addresses";
import "../css/checkout.css";
import "../css/checkout-date.css";

/*
 * Time windows. They must NOT overlap and must match the list the backend
 * accepts (BookingController::SLOTS). "start" is the opening hour.
 */
const SLOTS = [
  { label: "8-11 AM", start: 8 },
  { label: "11 AM-2 PM", start: 11 },
  { label: "2-5 PM", start: 14 },
  { label: "5-8 PM", start: 17 },
];

const MAX_DAYS_AHEAD = 30;

// "YYYY-MM-DD" in the browser's local calendar (what <input type="date"> uses).
const toIso = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const fromIso = (iso) => {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const prettyDate = (iso) =>
  fromIso(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

// Same-day jobs need at least one hour of notice.
const slotAvailable = (iso, slot, now) => {
  if (!slot) return false;
  if (iso !== toIso(now)) return true;
  return now.getHours() + now.getMinutes() / 60 < slot.start - 1;
};

const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash on Service",
    sub: "Pay when the job is done",
    icon: "💵",
  },
];

function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const serviceName = searchParams.get("service") || "AC Gas Refill";

  // The price comes from the server (services table), never from this file.
  const [services, setServices] = useState(null);
  const service = services?.find((item) => item.name === serviceName) || null;
  const price = service ? service.price : null;
  const priceText = price !== null ? price.toLocaleString() : "...";

  useEffect(() => {
    listServices()
      .then(({ data }) => setServices(data))
      .catch(() => setServices([]));
  }, []);

  const now = useMemo(() => new Date(), []);
  const todayIso = toIso(now);
  const maxIso = toIso(addDays(now, MAX_DAYS_AHEAD));
  const todayHasSlots = SLOTS.some((slot) => slotAvailable(todayIso, slot, now));

  const dayOptions = useMemo(
    () =>
      Array.from({ length: 7 }, (_, index) => {
        const date = addDays(now, index);
        const iso = toIso(date);
        const label =
          index === 0 ? "Today" : index === 1 ? "Tomorrow" : prettyDate(iso);
        return { iso, label };
      }),
    [now],
  );

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", detail: "" });
  const [addingAddress, setAddingAddress] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    todayHasSlots ? todayIso : toIso(addDays(now, 1)),
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [instructions, setInstructions] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    listAddresses()
      .then(({ data }) => {
        setAddresses(data);
        const defaultAddr = data.find((a) => a.is_default) || data[0];
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
      })
      .catch(() => setAddresses([]));
  }, []);

  useEffect(() => {
    setSelectedSlot((current) => {
      const stillOk = SLOTS.find(
        (slot) => slot.label === current && slotAvailable(selectedDate, slot, now),
      );
      if (stillOk) return current;
      return (
        SLOTS.find((slot) => slotAvailable(selectedDate, slot, now))?.label || ""
      );
    });
  }, [selectedDate, now]);

  const handleCustomDate = (iso) => {
    if (!iso || iso < todayIso || iso > maxIso) return;
    if (iso === todayIso && !todayHasSlots) return;
    setSelectedDate(iso);
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newAddress.label.trim() || !newAddress.detail.trim()) return;

    setAddingAddress(true);
    try {
      const { data } = await createAddress(newAddress);
      setAddresses((prev) => [data, ...prev]);
      setSelectedAddress(data.id);
      setNewAddress({ label: "", detail: "" });
      setShowAddForm(false);
    } catch {
      /* keep the form open so the user can retry */
    } finally {
      setAddingAddress(false);
    }
  };

  const handleConfirm = async () => {
    setError("");

    const addressDetail = addresses.find(
      (a) => a.id === selectedAddress,
    )?.detail;

    if (!addressDetail) {
      setError("Please select or add an address first.");
      return;
    }

    if (!selectedSlot) {
      setError("Please choose a time slot.");
      return;
    }

    setSubmitting(true);
    try {
      const { data: booking } = await createBooking({
        service_name: serviceName,
        address: addressDetail,
        scheduled_date: selectedDate,
        time_slot: selectedSlot,
        instructions: instructions || null,
        payment_method: selectedPayment,
      });

      navigate(
        `/booking-confirmed?bookingId=${booking.id}&service=${encodeURIComponent(
          serviceName,
        )}&date=${encodeURIComponent(selectedDate === todayIso ? "Today" : prettyDate(selectedDate))}&slot=${encodeURIComponent(selectedSlot)}`,
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Couldn't create the booking. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (services && !service) {
    return (
      <div className="checkout-page">
        <Header variant="app" />
        <div className="checkout-container">
          <div className="checkout-main">
            <div className="card selected-service">
              <div className="selected-service__text">
                <h2>This service isn&apos;t available</h2>
                <p>It may have been removed or hidden. Please pick another one.</p>
              </div>
              <div className="selected-service__price">
                <Link to="/services">Browse services</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <Header variant="app" />

      <div className="checkout-container">
        <div className="checkout-main">
          {/* Selected service summary */}
          <div className="card selected-service">
            <div className="selected-service__text">
              <h2>{serviceName}</h2>
              <p>Fixed price, no hidden charges</p>
            </div>
            <div className="selected-service__price">
              <span>৳{priceText}</span>
              <Link to="/services">Change Service</Link>
            </div>
          </div>

          {/* Address */}
          <section className="checkout-section">
            <h3>1. Select Address</h3>
            <div className="address-options">
              {addresses.map((addr) => (
                <button
                  key={addr.id}
                  type="button"
                  className={`address-option ${selectedAddress === addr.id ? "is-selected" : ""}`}
                  onClick={() => setSelectedAddress(addr.id)}
                >
                  {selectedAddress === addr.id && (
                    <span className="address-option__check">✓</span>
                  )}
                  <span className="address-option__icon">📍</span>
                  <p className="address-option__label">{addr.label}</p>
                  <p className="address-option__detail">{addr.detail}</p>
                </button>
              ))}

              {!showAddForm && (
                <button
                  type="button"
                  className="address-option address-option--add"
                  onClick={() => setShowAddForm(true)}
                >
                  <span className="address-option__icon">+</span>
                  <p>Add New Address</p>
                </button>
              )}
            </div>

            {showAddForm && (
              <form className="add-address-form" onSubmit={handleAddAddress}>
                <input
                  type="text"
                  placeholder="Label (e.g. Home, Office)"
                  value={newAddress.label}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      label: e.target.value,
                    }))
                  }
                />
                <input
                  type="text"
                  placeholder="Full address"
                  value={newAddress.detail}
                  onChange={(e) =>
                    setNewAddress((prev) => ({
                      ...prev,
                      detail: e.target.value,
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
            )}
          </section>

          {/* Date & Time */}
          <section className="checkout-section">
            <h3>2. Choose Date &amp; Time</h3>
            <div className="date-options">
              {dayOptions.map((day) => {
                const disabled = day.iso === todayIso && !todayHasSlots;
                return (
                  <button
                    key={day.iso}
                    type="button"
                    disabled={disabled}
                    title={disabled ? "No slots left today" : undefined}
                    className={`pill-option ${selectedDate === day.iso ? "is-selected" : ""}`}
                    onClick={() => setSelectedDate(day.iso)}
                  >
                    {day.label}
                  </button>
                );
              })}

              {!dayOptions.some((day) => day.iso === selectedDate) && (
                <button type="button" className="pill-option is-selected">
                  {prettyDate(selectedDate)}
                </button>
              )}

              <label className="date-picker-custom">
                <span>Other date</span>
                <input
                  type="date"
                  min={todayIso}
                  max={maxIso}
                  value={selectedDate}
                  onChange={(e) => handleCustomDate(e.target.value)}
                />
              </label>
            </div>

            <div className="slot-options">
              {SLOTS.map((slot) => {
                const available = slotAvailable(selectedDate, slot, now);
                return (
                  <button
                    key={slot.label}
                    type="button"
                    disabled={!available}
                    title={available ? undefined : "This time has passed"}
                    className={`pill-option ${selectedSlot === slot.label ? "is-selected" : ""}`}
                    onClick={() => setSelectedSlot(slot.label)}
                  >
                    {slot.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Special instructions */}
          <section className="checkout-section">
            <h3>3. Any special instructions?</h3>
            <textarea
              className="instructions-input"
              placeholder="Optional notes for the technician"
              maxLength={250}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
            />
            <span className="char-count">{instructions.length}/250</span>
          </section>

          {/* Payment method */}
          <section className="checkout-section">
            <h3>4. Payment Method</h3>
            <div className="payment-options payment-options--single">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  className={`payment-option ${
                    selectedPayment === method.id ? "is-selected" : ""
                  }`}
                  onClick={() => setSelectedPayment(method.id)}
                >
                  <span className="payment-option__radio" />
                  <span className="payment-option__icon">{method.icon}</span>
                  <span>
                    <p className="payment-option__label">{method.label}</p>
                    <p className="payment-option__sub">{method.sub}</p>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* Sticky order summary */}
        <aside className="checkout-sidebar">
          <div className="card order-summary">
            <h3>Order Summary</h3>
            <div className="order-summary__row">
              <span>{serviceName}</span>
              <span>৳{priceText}</span>
            </div>
            <div className="order-summary__row">
              <span>Visit Charge</span>
              <span className="text-success">Free</span>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__row order-summary__row--total">
              <span>Total</span>
              <span>৳{priceText}</span>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={handleConfirm}
              disabled={submitting || price === null || !selectedSlot}
            >
              {submitting ? "Booking..." : "Confirm Booking"}
            </button>
            {error && <p className="checkout-error">{error}</p>}
            <p className="order-summary__note">
              🔒 Secure booking. Your details are protected.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;

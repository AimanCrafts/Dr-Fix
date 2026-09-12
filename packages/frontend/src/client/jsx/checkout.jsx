import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import { createBooking } from "../api/bookings";
import { listAddresses, createAddress } from "../api/addresses";
import "../css/checkout.css";

const PRICE_MAP = {
  "Switch/Socket Repair": 300,
  "Light Installation": 450,
  "Ceiling Fan Installation": 500,
  "MCB/Breaker Replacement": 650,
  "Tap/Faucet Repair": 350,
  "Pipe Leak Fixing": 500,
  "Drain Blockage Cleaning": 800,
  "Toilet Repair": 900,
  "AC General Service": 800,
  "AC Gas Refill": 1200,
  "AC Coil Cleaning": 900,
  "AC Installation": 1500,
  "Door Repair": 600,
  "Wardrobe Repair": 900,
  "Custom Shelf Installation": 1000,
  "Wood Polishing": 700,
};

const DATE_OPTIONS = ["Today", "Tomorrow", "Pick a Date"];
const TIME_SLOTS = [
  "8-11 AM",
  "11 AM-2 PM",
  "12-3 PM",
  "3-6 PM",
  "4-7 PM",
  "7-10 PM",
];

const PAYMENT_METHODS = [
  {
    id: "cash",
    label: "Cash on Service",
    sub: "Pay when the job is done",
    icon: "💵",
  },
  { id: "bkash", label: "bKash", sub: "Pay securely via bKash", icon: "📱" },
  { id: "nagad", label: "Nagad", sub: "Pay securely via Nagad", icon: "📱" },
];

function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const serviceName = searchParams.get("service") || "AC Gas Refill";
  const serviceCategory = searchParams.get("category") || "electric";
  const price = PRICE_MAP[serviceName] || 1000;

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: "", detail: "" });
  const [addingAddress, setAddingAddress] = useState(false);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[2]);
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

    setSubmitting(true);
    try {
      const { data: booking } = await createBooking({
        service_category: serviceCategory,
        service_name: serviceName,
        price,
        address: addressDetail,
        date_label: selectedDate,
        time_slot: selectedSlot,
        instructions: instructions || null,
        payment_method: selectedPayment,
      });

      navigate(
        `/booking-confirmed?bookingId=${booking.id}&service=${encodeURIComponent(
          serviceName,
        )}&date=${encodeURIComponent(selectedDate)}&slot=${encodeURIComponent(selectedSlot)}`,
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

  return (
    <div className="checkout-page">
      <Header variant="app" />

      <div className="checkout-container">
        <div className="checkout-main">
          {/* Selected service summary */}
          <div className="card selected-service">
            <div
              className="image-placeholder image-placeholder--sm"
              aria-hidden="true"
            />
            <div className="selected-service__text">
              <h2>{serviceName}</h2>
              <p>Fixed price, no hidden charges</p>
            </div>
            <div className="selected-service__price">
              <span>৳{price.toLocaleString()}</span>
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
                    setNewAddress((prev) => ({ ...prev, label: e.target.value }))
                  }
                />
                <input
                  type="text"
                  placeholder="Full address"
                  value={newAddress.detail}
                  onChange={(e) =>
                    setNewAddress((prev) => ({ ...prev, detail: e.target.value }))
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
              {DATE_OPTIONS.map((date) => (
                <button
                  key={date}
                  type="button"
                  className={`pill-option ${selectedDate === date ? "is-selected" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  {date}
                </button>
              ))}
            </div>
            <div className="slot-options">
              {TIME_SLOTS.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className={`pill-option ${selectedSlot === slot ? "is-selected" : ""}`}
                  onClick={() => setSelectedSlot(slot)}
                >
                  {slot}
                </button>
              ))}
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
            <div className="payment-options">
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
              <span>৳{price.toLocaleString()}</span>
            </div>
            <div className="order-summary__row">
              <span>Visit Charge</span>
              <span className="text-success">Free</span>
            </div>
            <div className="order-summary__divider" />
            <div className="order-summary__row order-summary__row--total">
              <span>Total</span>
              <span>৳{price.toLocaleString()}</span>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--full"
              onClick={handleConfirm}
              disabled={submitting}
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

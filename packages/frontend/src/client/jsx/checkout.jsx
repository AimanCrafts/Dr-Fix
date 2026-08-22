import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
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

const MOCK_ADDRESSES = [
  {
    id: "home",
    label: "Home",
    detail: "House 45, Road 12, Dhanmondi, Dhaka 1209",
  },
  {
    id: "office",
    label: "Office",
    detail: "Level 5, House 12, Banani, Dhaka 1213",
  },
];

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
  const price = PRICE_MAP[serviceName] || 1000;

  const [selectedAddress, setSelectedAddress] = useState(MOCK_ADDRESSES[0].id);
  const [selectedDate, setSelectedDate] = useState("Today");
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[2]);
  const [instructions, setInstructions] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("cash");

  const handleConfirm = () => {
    // TODO: replace with a real POST /bookings call once backend exists.
    const fakeBookingId = `DFX${Math.floor(10000 + Math.random() * 89999)}`;
    navigate(
      `/booking-confirmed?bookingId=${fakeBookingId}&service=${encodeURIComponent(
        serviceName,
      )}&date=${encodeURIComponent(selectedDate)}&slot=${encodeURIComponent(selectedSlot)}`,
    );
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
              {MOCK_ADDRESSES.map((addr) => (
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
              <button
                type="button"
                className="address-option address-option--add"
              >
                <span className="address-option__icon">+</span>
                <p>Add New Address</p>
              </button>
            </div>
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
            >
              Confirm Booking
            </button>
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

import { useEffect, useRef, useState } from "react";
import {
  X,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lock,
  LockKeyhole,
  Smartphone,
} from "lucide-react";
import "../css/payment-modal.css";
import bkashLogo from "../../assets/payment/bkash.png";
import nagadLogo from "../../assets/payment/nagad.png";
import rocketLogo from "../../assets/payment/rocket.png";

const PROVIDERS = [
  { id: "bkash", name: "bKash", logo: bkashLogo, accent: "#e2136e" },
  { id: "nagad", name: "Nagad", logo: nagadLogo, accent: "#ee5a24" },
  { id: "rocket", name: "Rocket", logo: rocketLogo, accent: "#8a2a8f" },
];

const makeTxn = () =>
  `DFX-MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

const formatMoney = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const maskPhone = (value) =>
  value.length === 11 ? `${value.slice(0, 3)}XXXXX${value.slice(8)}` : value;

/* Large circular code input used for both OTP (6) and PIN (5). */
function CodeCircles({ id, length, value, onChange, secret, onEnter, label }) {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const active = Math.min(value.length, length - 1);

  return (
    <div
      className="df-code"
      onClick={() => inputRef.current?.focus()}
      role="group"
      aria-label={label}
    >
      {Array.from({ length }).map((_, index) => {
        const filled = index < value.length;
        const isActive = index === active && value.length < length;
        return (
          <span
            key={index}
            className={`df-code-circle ${filled ? "filled" : ""} ${isActive ? "active" : ""}`}
          >
            {filled ? (secret ? <i className="df-code-dot" /> : value[index]) : ""}
          </span>
        );
      })}
      <input
        ref={inputRef}
        id={id}
        className="df-code-input"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        value={value}
        aria-label={label}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, "").slice(0, length))
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") onEnter?.();
        }}
      />
    </div>
  );
}

export default function PaymentModal({
  amount,
  serviceName,
  onClose,
  onPaymentSuccess,
}) {
  const [provider, setProvider] = useState("bkash");
  const [step, setStep] = useState("provider");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [txn, setTxn] = useState("");
  const [confirmationPath, setConfirmationPath] = useState("");

  const activeProvider =
    PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];

  const lockedStep = step === "processing" || step === "success";
  const inFlow = step === "confirm" || step === "otp" || step === "pin";
  const resultStep =
    step === "success" || step === "failed" || step === "cancelled";

  // Closing during an active payment flow is treated as a cancellation.
  const requestClose = () => {
    if (lockedStep) return;
    if (inFlow) {
      setError("");
      setStep("cancelled");
      return;
    }
    onClose();
  };

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => {
      if (event.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, onClose]);

  const goBack = () => {
    setError("");
    setStep(
      step === "phone"
        ? "provider"
        : step === "confirm"
          ? "phone"
          : step === "otp"
            ? "confirm"
            : step === "pin"
              ? "otp"
              : "provider",
    );
  };

  const continuePhone = () => {
    if (!/^01\d{9}$/.test(phone)) {
      setError("Enter a valid 11-digit Bangladeshi mobile number.");
      return;
    }
    setError("");
    setStep("confirm");
  };

  const verifyOtp = () => {
    if (otp !== "123456") {
      setError("The verification code is incorrect. Please try again.");
      return;
    }
    setError("");
    setStep("pin");
  };

  const processPayment = async () => {
    if (!/^\d{5}$/.test(pin)) {
      setError("Enter your 5-digit PIN.");
      return;
    }
    if (pin === "00000" || pin === "11111") {
      setStep("failed");
      setError(
        pin === "11111"
          ? "Transaction declined: insufficient balance."
          : "Transaction was not completed.",
      );
      return;
    }
    if (pin !== "12345") {
      setError("The PIN is incorrect. Please try again.");
      return;
    }
    setError("");
    setStep("processing");
    const transactionId = makeTxn();
    try {
      const path = await onPaymentSuccess({
        method: `online_${provider}`,
        provider: activeProvider.name,
        transactionId,
        phone,
      });
      setTxn(transactionId);
      setConfirmationPath(path || "");
      setStep("success");
    } catch (e) {
      setTxn(transactionId);
      setStep("failed");
      setError(
        e?.message || "We couldn't complete the payment. Please try again.",
      );
    }
  };

  const errorBlock = error && (
    <p className="df-error" role="alert">
      <AlertCircle size={15} />
      {error}
    </p>
  );

  return (
    <div
      className="df-pay-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <section
        className="df-pay-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="df-pay-title"
        style={{ "--accent": activeProvider.accent }}
      >
        <header className="df-pay-header">
          <span className="df-pay-brand">Dr.-Fix</span>
          <div className="df-pay-head-right">
            <span className="df-pay-secure">
              <ShieldCheck size={15} /> Secure Checkout
            </span>
            {!lockedStep && (
              <button
                className="df-pay-close"
                type="button"
                aria-label="Close payment"
                onClick={requestClose}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        <div className={`df-pay-body ${resultStep || step === "processing" ? "single" : ""}`}>
          {!resultStep && step !== "processing" && (
            <aside className="df-pay-aside">
              <h3 className="df-aside-title">Secure Online Payment</h3>
              <p className="df-aside-text">
                Your payment is secured with advanced encryption and fraud
                protection.
              </p>
              <div className="df-summary">
                <h4>Order Summary</h4>
                <dl>
                  <div>
                    <dt>Merchant</dt>
                    <dd>Dr.-Fix</dd>
                  </div>
                  <div>
                    <dt>Service</dt>
                    <dd>{serviceName}</dd>
                  </div>
                  {step !== "provider" && (
                    <div>
                      <dt>Method</dt>
                      <dd>{activeProvider.name}</dd>
                    </div>
                  )}
                  <div className="total">
                    <dt>Amount</dt>
                    <dd>{formatMoney(amount)} BDT</dd>
                  </div>
                </dl>
              </div>
            </aside>
          )}

          <div className="df-pay-main">
            {step === "provider" && (
              <div className="df-step">
                <h2 id="df-pay-title">Mobile Banking</h2>
                <p className="df-muted">Select your mobile banking provider.</p>
                <div className="df-providers" role="radiogroup">
                  {PROVIDERS.map((item) => (
                    <button
                      type="button"
                      key={item.id}
                      role="radio"
                      aria-checked={provider === item.id}
                      className={`df-provider ${provider === item.id ? "selected" : ""}`}
                      onClick={() => setProvider(item.id)}
                    >
                      <span className="df-provider-check">
                        {provider === item.id ? "✓" : ""}
                      </span>
                      <img src={item.logo} alt="" />
                      <span className="df-provider-name">{item.name}</span>
                    </button>
                  ))}
                </div>
                <div className="df-amount-bar">
                  <span>Amount to Pay</span>
                  <strong>{formatMoney(amount)} BDT</strong>
                </div>
                <button
                  className="df-primary df-primary-blue"
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("phone");
                  }}
                >
                  Continue with {activeProvider.name} <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === "phone" && (
              <div className="df-step">
                <button className="df-back" type="button" onClick={goBack}>
                  <ArrowLeft size={15} /> Back to Payment Methods
                </button>
                <h2 id="df-pay-title">{activeProvider.name}</h2>
                <p className="df-muted">
                  Pay with your {activeProvider.name} account.
                </p>
                <div className="df-card">
                  <span className="df-card-label">Payment Amount</span>
                  <strong className="df-card-amount">
                    {formatMoney(amount)} BDT
                  </strong>
                  <label className="df-label" htmlFor="df-pay-phone">
                    Mobile Number
                  </label>
                  <div className="df-input-wrap">
                    <Smartphone size={17} />
                    <input
                      id="df-pay-phone"
                      className="df-input"
                      type="tel"
                      inputMode="numeric"
                      maxLength={11}
                      placeholder="01XXXXXXXXX"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value.replace(/\D/g, ""))
                      }
                      onKeyDown={(e) => e.key === "Enter" && continuePhone()}
                    />
                  </div>
                  <p className="df-hint">
                    Please enter your {activeProvider.name} registered mobile
                    number.
                  </p>
                  {errorBlock}
                  <button
                    className="df-primary df-primary-accent"
                    type="button"
                    onClick={continuePhone}
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="df-step">
                <button className="df-back" type="button" onClick={goBack}>
                  <ArrowLeft size={15} /> Back
                </button>
                <h2 id="df-pay-title">Confirm Payment</h2>
                <p className="df-muted">
                  Please review your payment details before proceeding.
                </p>
                <div className="df-card df-details">
                  <div>
                    <span>Merchant</span>
                    <strong>Dr.-Fix</strong>
                  </div>
                  <div>
                    <span>Amount</span>
                    <strong>{formatMoney(amount)} BDT</strong>
                  </div>
                  <div>
                    <span>Payment Method</span>
                    <strong>{activeProvider.name} (Mobile Banking)</strong>
                  </div>
                  <div>
                    <span>Mobile Number</span>
                    <strong>{maskPhone(phone)}</strong>
                  </div>
                  <div>
                    <span>Transaction Fee</span>
                    <strong>৳0.00</strong>
                  </div>
                </div>
                <div className="df-actions">
                  <button
                    className="df-outline"
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("cancelled");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="df-primary df-primary-blue"
                    type="button"
                    onClick={() => {
                      setError("");
                      setOtp("");
                      setStep("otp");
                    }}
                  >
                    Confirm Payment
                  </button>
                </div>
              </div>
            )}

            {step === "otp" && (
              <div className="df-step df-step-center">
                <button className="df-back" type="button" onClick={goBack}>
                  <ArrowLeft size={15} /> Back
                </button>
                <h2 id="df-pay-title">Verify your number</h2>
                <p className="df-muted">
                  A 6-digit verification code was sent to {maskPhone(phone)}.
                </p>
                <label className="df-label center" htmlFor="df-pay-otp">
                  Enter verification code
                </label>
                <CodeCircles
                  id="df-pay-otp"
                  length={6}
                  value={otp}
                  onChange={setOtp}
                  onEnter={verifyOtp}
                  label="6-digit verification code"
                />
                {errorBlock}
                <div className="df-actions">
                  <button
                    className="df-outline"
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("cancelled");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="df-primary df-primary-accent"
                    type="button"
                    onClick={verifyOtp}
                  >
                    Verify
                  </button>
                </div>
              </div>
            )}

            {step === "pin" && (
              <div className="df-step df-step-center">
                <button className="df-back" type="button" onClick={goBack}>
                  <ArrowLeft size={15} /> Back
                </button>
                <h2 id="df-pay-title">Enter your PIN</h2>
                <p className="df-muted">
                  Enter your {activeProvider.name} PIN to authorise this
                  payment.
                </p>
                <label className="df-label center" htmlFor="df-pay-pin">
                  {activeProvider.name} PIN
                </label>
                <CodeCircles
                  id="df-pay-pin"
                  length={5}
                  value={pin}
                  onChange={setPin}
                  onEnter={processPayment}
                  secret
                  label="5-digit PIN"
                />
                {errorBlock}
                <div className="df-actions">
                  <button
                    className="df-outline"
                    type="button"
                    onClick={() => {
                      setError("");
                      setStep("cancelled");
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className="df-primary df-primary-accent"
                    type="button"
                    onClick={processPayment}
                  >
                    <LockKeyhole size={16} /> Pay {formatMoney(amount)}
                  </button>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="df-state">
                <span className="df-spinner" />
                <h2 id="df-pay-title">Processing your payment...</h2>
                <p className="df-muted">Please do not close this window.</p>
              </div>
            )}

            {step === "success" && (
              <div className="df-state">
                <span className="df-state-icon success">
                  <CheckCircle2 size={40} />
                </span>
                <h2 id="df-pay-title">Payment Successful</h2>
                <p className="df-muted">
                  Your payment has been completed successfully.
                </p>
                <div className="df-card df-details df-receipt">
                  <div>
                    <span>Amount</span>
                    <strong>{formatMoney(amount)} BDT</strong>
                  </div>
                  <div>
                    <span>Payment Method</span>
                    <strong>{activeProvider.name} (Mobile Banking)</strong>
                  </div>
                  <div>
                    <span>Transaction ID</span>
                    <strong>{txn}</strong>
                  </div>
                </div>
                <button
                  className="df-primary df-primary-blue df-wide"
                  type="button"
                  onClick={() => {
                    if (confirmationPath)
                      window.location.assign(confirmationPath);
                    else onClose();
                  }}
                >
                  Return to Dr.-Fix
                </button>
                <p className="df-thanks">Thank you for using Dr.-Fix!</p>
              </div>
            )}

            {step === "failed" && (
              <div className="df-state">
                <span className="df-state-icon failed">
                  <XCircle size={40} />
                </span>
                <h2 id="df-pay-title" className="failed-title">
                  Payment Failed
                </h2>
                <p className="df-muted">
                  Your payment could not be completed. Please try again or
                  choose another payment method.
                </p>
                <div className="df-card df-details df-receipt">
                  <div>
                    <span>Reason</span>
                    <strong>{error || "Transaction was not completed."}</strong>
                  </div>
                  {txn && (
                    <div>
                      <span>Transaction ID</span>
                      <strong>{txn}</strong>
                    </div>
                  )}
                </div>
                <div className="df-actions">
                  <button
                    className="df-primary df-primary-danger"
                    type="button"
                    onClick={() => {
                      setError("");
                      setPin("");
                      setStep("pin");
                    }}
                  >
                    Try Again
                  </button>
                  <button className="df-outline" type="button" onClick={onClose}>
                    Return to Checkout
                  </button>
                </div>
                <p className="df-thanks">
                  If you continue to face issues, please contact our support
                  team.
                </p>
              </div>
            )}

            {step === "cancelled" && (
              <div className="df-state">
                <span className="df-state-icon cancelled">
                  <AlertCircle size={40} />
                </span>
                <h2 id="df-pay-title">Payment Cancelled</h2>
                <p className="df-muted">Your booking has not been charged.</p>
                <div className="df-card df-notice">
                  <p>No amount has been deducted from your account.</p>
                  <p>You can try again or choose a different payment method.</p>
                </div>
                <button
                  className="df-primary df-primary-blue df-wide"
                  type="button"
                  onClick={onClose}
                >
                  Return to Checkout
                </button>
                <p className="df-thanks">Need help? Contact our support team.</p>
              </div>
            )}
          </div>
        </div>

        <footer className="df-pay-footer">
          <span>
            <Lock size={13} /> Your information is safe and secure
          </span>
          <span>Powered by Dr.-Fix Payment Gateway</span>
        </footer>
      </section>
    </div>
  );
}

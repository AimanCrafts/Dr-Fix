import { useEffect, useRef, useState } from "react";
import {
  X,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Info,
  Lock,
  LockKeyhole,
  Smartphone,
} from "lucide-react";
import "../css/payment-modal.css";
import bkashLogo from "../../assets/payment/bkash.png";
import nagadLogo from "../../assets/payment/nagad.png";
import rocketLogo from "../../assets/payment/rocket.png";

const PROVIDERS = [
  { id: "bkash", name: "bKash", logo: bkashLogo, accent: "#e2136e", available: true },
  { id: "nagad", name: "Nagad", logo: nagadLogo, accent: "#ee5a24", available: false },
  { id: "rocket", name: "Rocket", logo: rocketLogo, accent: "#8a2a8f", available: false },
];

// No live provider API is connected yet, so the sandbox verifies these codes.
const CODES = {
  otp: "123456",
  pinOk: "12345",
  pinDeclined: "00000",
  pinNoFunds: "11111",
};

const OTP_LENGTH = 6;
const PIN_LENGTH = 5;
const RESEND_SECONDS = 45;

const makeReference = () =>
  `DFX-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;

const formatMoney = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const maskPhone = (value) =>
  value.length === 11 ? `${value.slice(0, 3)}XXXXX${value.slice(8)}` : value;

const formatDateTime = (date) =>
  date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

/* Large circular input shared by the OTP (6) and PIN (5) steps. */
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
            {filled ? (
              secret ? <i className="df-code-dot" /> : value[index]
            ) : (
              ""
            )}
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

/* Title row with an icon-only back button. */
function StepHead({ title, subtitle, onBack, center }) {
  return (
    <div className={`df-head ${center ? "center" : ""}`}>
      {onBack && (
        <button
          className="df-back"
          type="button"
          aria-label="Back"
          onClick={onBack}
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div className="df-head-text">
        <h2 id="df-pay-title">{title}</h2>
        {subtitle && <p className="df-muted">{subtitle}</p>}
      </div>
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
  const [notice, setNotice] = useState("");
  const [info, setInfo] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [txn, setTxn] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [confirmationPath, setConfirmationPath] = useState("");

  const activeProvider =
    PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];
  const fallbackProvider = PROVIDERS.find((item) => item.available);

  const lockedStep = step === "processing" || step === "success";
  const inFlow = step === "otp" || step === "pin";
  const resultStep =
    step === "success" || step === "failed" || step === "cancelled";
  const showAside = !resultStep && step !== "processing";

  // Closing while a payment is in progress counts as cancelling it.
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

  // Fades the "unavailable" message away.
  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(""), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  // Resend countdown on the OTP step.
  useEffect(() => {
    if (step !== "otp" || resendIn <= 0) return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendIn]);

  const goBack = () => {
    setError("");
    setInfo("");
    setStep(step === "otp" ? "phone" : step === "pin" ? "otp" : "provider");
  };

  const cancelPayment = () => {
    setError("");
    setInfo("");
    setStep("cancelled");
  };

  const chooseProvider = (item) => {
    if (!item.available) {
      setNotice(
        `${item.name} is not available right now. Please continue with ${fallbackProvider.name}.`,
      );
      return;
    }
    setNotice("");
    setProvider(item.id);
  };

  const continuePhone = () => {
    if (!/^01\d{9}$/.test(phone)) {
      setError("Enter a valid 11-digit mobile number.");
      return;
    }
    setError("");
    setInfo("");
    setOtp("");
    setResendIn(RESEND_SECONDS);
    setStep("otp");
  };

  const resendCode = () => {
    if (resendIn > 0) return;
    setOtp("");
    setError("");
    setInfo("A new verification code has been sent.");
    setResendIn(RESEND_SECONDS);
  };

  const verifyOtp = () => {
    setInfo("");
    if (otp.length < OTP_LENGTH) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    if (otp !== CODES.otp) {
      setError("The verification code you entered is incorrect.");
      return;
    }
    setError("");
    setPin("");
    setStep("pin");
  };

  const failPayment = (reason) => {
    setTxn(makeReference());
    setError(reason);
    setStep("failed");
  };

  const processPayment = async () => {
    if (pin.length < PIN_LENGTH) {
      setError("Enter your 5-digit PIN.");
      return;
    }
    if (pin === CODES.pinNoFunds) {
      failPayment("Insufficient balance in your account.");
      return;
    }
    if (pin === CODES.pinDeclined) {
      failPayment("The transaction could not be completed.");
      return;
    }
    if (pin !== CODES.pinOk) {
      setError("Incorrect PIN. Please try again.");
      return;
    }
    setError("");
    setStep("processing");
    const reference = makeReference();
    try {
      const path = await onPaymentSuccess({
        method: `online_${provider}`,
        provider: activeProvider.name,
        transactionId: reference,
        phone,
      });
      setTxn(reference);
      setPaidAt(formatDateTime(new Date()));
      setConfirmationPath(path || "");
      setStep("success");
    } catch (e) {
      setTxn(reference);
      setError(
        e?.message || "We couldn't complete the payment. Please try again.",
      );
      setStep("failed");
    }
  };

  const errorBlock = error && (
    <p className="df-error" role="alert">
      <AlertCircle size={16} />
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
              <ShieldCheck size={16} /> Secure Checkout
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

        <div className={`df-pay-body ${showAside ? "" : "single"}`}>
          {showAside && (
            <aside className="df-pay-aside">
              <h3 className="df-aside-title">Secure Online Payment</h3>
              <p className="df-aside-text">
                Your payment is protected with encryption and fraud monitoring.
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
                  {(step === "otp" || step === "pin") && (
                    <div>
                      <dt>Account</dt>
                      <dd>{maskPhone(phone)}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Transaction fee</dt>
                    <dd>৳0.00</dd>
                  </div>
                  <div className="total">
                    <dt>Total</dt>
                    <dd>{formatMoney(amount)} BDT</dd>
                  </div>
                </dl>
              </div>
            </aside>
          )}

          <div className="df-pay-main">
            {step === "provider" && (
              <div className="df-step">
                <StepHead
                  title="Mobile Banking"
                  subtitle="Select your mobile banking provider."
                />
                <div className="df-providers" role="radiogroup">
                  {PROVIDERS.map((item) => {
                    const selected = provider === item.id && item.available;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        role="radio"
                        aria-checked={selected}
                        aria-disabled={!item.available}
                        data-tip={item.available ? undefined : "Currently unavailable"}
                        className={`df-provider ${selected ? "selected" : ""} ${item.available ? "" : "is-unavailable"}`}
                        onClick={() => chooseProvider(item)}
                      >
                        <span className="df-provider-check">
                          {selected ? "✓" : ""}
                        </span>
                        <img src={item.logo} alt="" />
                        <span className="df-provider-name">{item.name}</span>
                        {!item.available && (
                          <span className="df-provider-state">Unavailable</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {notice && (
                  <p className="df-inline-notice" role="status">
                    <Info size={16} />
                    {notice}
                  </p>
                )}
                <button
                  className="df-primary df-primary-accent"
                  type="button"
                  onClick={() => {
                    setError("");
                    setStep("phone");
                  }}
                >
                  Continue with {activeProvider.name}{" "}
                  <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === "phone" && (
              <div className="df-step">
                <StepHead
                  title={activeProvider.name}
                  subtitle={`Pay with your ${activeProvider.name} account.`}
                  onBack={goBack}
                />
                <label className="df-label" htmlFor="df-pay-phone">
                  Mobile number
                </label>
                <div className="df-input-wrap">
                  <Smartphone size={18} />
                  <input
                    id="df-pay-phone"
                    className="df-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={11}
                    placeholder="01XXXXXXXXX"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, ""));
                      setError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && continuePhone()}
                    autoFocus
                  />
                </div>
                <p className="df-hint">
                  Enter the mobile number registered with {activeProvider.name}.
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
            )}

            {step === "otp" && (
              <div className="df-step df-step-center">
                <StepHead
                  center
                  title="Verify your number"
                  subtitle={`We sent a 6-digit code to ${maskPhone(phone)}.`}
                  onBack={goBack}
                />
                <CodeCircles
                  id="df-pay-otp"
                  length={OTP_LENGTH}
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    setError("");
                  }}
                  onEnter={verifyOtp}
                  label="6-digit verification code"
                />
                {errorBlock}
                {info && !error && <p className="df-info">{info}</p>}
                <p className="df-resend">
                  Didn&apos;t receive the code?{" "}
                  {resendIn > 0 ? (
                    <span>
                      Resend in 0:{String(resendIn).padStart(2, "0")}
                    </span>
                  ) : (
                    <button type="button" onClick={resendCode}>
                      Resend code
                    </button>
                  )}
                </p>
                <div className="df-actions">
                  <button
                    className="df-outline"
                    type="button"
                    onClick={cancelPayment}
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
                <StepHead
                  center
                  title="Enter your PIN"
                  subtitle={`Enter your ${activeProvider.name} PIN to pay ${formatMoney(amount)} to Dr.-Fix.`}
                  onBack={goBack}
                />
                <CodeCircles
                  id="df-pay-pin"
                  length={PIN_LENGTH}
                  value={pin}
                  onChange={(v) => {
                    setPin(v);
                    setError("");
                  }}
                  onEnter={processPayment}
                  secret
                  label="5-digit PIN"
                />
                {errorBlock}
                <div className="df-actions">
                  <button
                    className="df-outline"
                    type="button"
                    onClick={cancelPayment}
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
                <div className="df-card df-details">
                  <div>
                    <span>Amount</span>
                    <strong>{formatMoney(amount)} BDT</strong>
                  </div>
                  <div>
                    <span>Payment method</span>
                    <strong>{activeProvider.name} (Mobile Banking)</strong>
                  </div>
                  <div>
                    <span>Date &amp; time</span>
                    <strong>{paidAt}</strong>
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
                <p className="df-thanks">Thank you for using Dr.-Fix.</p>
              </div>
            )}

            {step === "failed" && (
              <div className="df-state">
                <span className="df-state-icon failed">
                  <XCircle size={40} />
                </span>
                <h2 id="df-pay-title">Payment Failed</h2>
                <p className="df-muted">
                  Your payment could not be completed. Please try again or
                  choose another payment method.
                </p>
                <div className="df-card df-details">
                  <div>
                    <span>Reason</span>
                    <strong>{error || "The transaction was not completed."}</strong>
                  </div>
                  <div>
                    <span>Amount</span>
                    <strong>{formatMoney(amount)} BDT</strong>
                  </div>
                  {txn && (
                    <div>
                      <span>Reference</span>
                      <strong>{txn}</strong>
                    </div>
                  )}
                </div>
                <div className="df-actions">
                  <button
                    className="df-primary df-primary-blue"
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
                  If the problem continues, please contact our support team.
                </p>
              </div>
            )}

            {step === "cancelled" && (
              <div className="df-state">
                <span className="df-state-icon cancelled">
                  <Info size={40} />
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
            <Lock size={14} /> Your information is safe and secure
          </span>
          <span>Powered by Dr.-Fix Payment Gateway</span>
        </footer>
      </section>
    </div>
  );
}

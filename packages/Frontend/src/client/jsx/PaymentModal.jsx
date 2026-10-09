import { useEffect, useState } from "react";
import {
  X,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  LockKeyhole,
} from "lucide-react";
import "../css/payment-modal.css";
import bkashLogo from "../../assets/payment/bkash.png";
import nagadLogo from "../../assets/payment/nagad.png";
import rocketLogo from "../../assets/payment/rocket.png";

const PROVIDERS = [
  { id: "bkash", name: "bKash", logo: bkashLogo },
  { id: "nagad", name: "Nagad", logo: nagadLogo },
  { id: "rocket", name: "Rocket", logo: rocketLogo },
];

const makeTxn = () =>
  `DFX-MOCK-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;

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

  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (event) => {
      if (event.key === "Escape" && step !== "processing" && step !== "success")
        onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, step]);

  const activeProvider =
    PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];
  const goBack = () => {
    setError("");
    setStep(
      step === "phone"
        ? "provider"
        : step === "otp"
          ? "phone"
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
    setStep("otp");
  };

  const verifyOtp = () => {
    if (otp !== "123456") {
      setError("Demo OTP is 123456. Please try again.");
      return;
    }
    setError("");
    setStep("pin");
  };

  const processPayment = async () => {
    if (!/^\d{5}$/.test(pin)) {
      setError("Enter a 5-digit demo PIN.");
      return;
    }
    if (pin === "00000" || pin === "11111") {
      setStep("failed");
      setError(
        pin === "11111"
          ? "Transaction declined: insufficient demo balance."
          : "The demo transaction was declined.",
      );
      return;
    }
    if (pin !== "12345") {
      setError(
        "Demo PIN is 12345 for success, 00000 for failure, or 11111 for insufficient balance.",
      );
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
      setStep("failed");
      setError(
        e?.message ||
          "We couldn't complete the demo payment. Please try again.",
      );
    }
  };

  return (
    <div
      className="df-payment-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && step !== "processing") onClose();
      }}
    >
      <section
        className="df-payment-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="df-payment-title"
      >
        <header className="df-payment-header">
          <div className="df-payment-brand">
            <span className="df-payment-mark">DF</span>
            <div>
              <strong>Dr.-Fix Pay</strong>
              <small>Secure checkout · Demo mode</small>
            </div>
          </div>
          <div className="df-payment-head-right">
            <span className="df-payment-secure">
              <ShieldCheck size={15} /> Secure
            </span>
            {step !== "processing" && step !== "success" && (
              <button
                className="df-payment-close"
                type="button"
                aria-label="Close payment"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </header>
        <div className="df-payment-content">
          <div className="df-payment-order">
            <div>
              <span>Paying for</span>
              <strong>{serviceName}</strong>
            </div>
            <div className="df-payment-amount">
              <span>Total amount</span>
              <strong>৳{Number(amount || 0).toLocaleString("en-BD")}</strong>
            </div>
          </div>
          {step === "provider" && (
            <div className="df-payment-step">
              <p className="df-payment-eyebrow">STEP 1 OF 4</p>
              <h2 id="df-payment-title">Choose a payment method</h2>
              <p className="df-payment-muted">
                Select a mobile banking provider to continue.
              </p>
              <div className="df-payment-providers">
                {PROVIDERS.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`df-payment-provider ${provider === item.id ? "selected" : ""}`}
                    onClick={() => setProvider(item.id)}
                  >
                    <img src={item.logo} alt="" />
                    <span>{item.name}</span>
                    <span className="df-payment-radio">
                      {provider === item.id ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
              <button
                className="df-payment-primary"
                type="button"
                onClick={() => {
                  setError("");
                  setStep("phone");
                }}
              >
                Continue with {activeProvider.name}
                <span>→</span>
              </button>
            </div>
          )}
          {step === "phone" && (
            <div className="df-payment-step">
              <button
                className="df-payment-back"
                type="button"
                onClick={goBack}
              >
                <ArrowLeft size={15} /> Change provider
              </button>
              <p className="df-payment-eyebrow">STEP 2 OF 4</p>
              <h2 id="df-payment-title">Your {activeProvider.name} number</h2>
              <p className="df-payment-muted">
                Enter the mobile number registered with {activeProvider.name}.
              </p>
              <label className="df-payment-label" htmlFor="df-payment-phone">
                Mobile number
              </label>
              <input
                id="df-payment-phone"
                className="df-payment-input"
                type="tel"
                inputMode="numeric"
                maxLength={11}
                placeholder="01XXXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
              />
              {error && (
                <p className="df-payment-error">
                  <AlertCircle size={15} />
                  {error}
                </p>
              )}
              <button
                className="df-payment-primary"
                type="button"
                onClick={continuePhone}
              >
                Continue <span>→</span>
              </button>
            </div>
          )}
          {step === "otp" && (
            <div className="df-payment-step">
              <button
                className="df-payment-back"
                type="button"
                onClick={goBack}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <p className="df-payment-eyebrow">STEP 3 OF 4</p>
              <h2 id="df-payment-title">Verify your number</h2>
              <p className="df-payment-muted">
                A demo verification code was sent to {phone}.
              </p>
              <label className="df-payment-label" htmlFor="df-payment-otp">
                6-digit verification code
              </label>
              <input
                id="df-payment-otp"
                className="df-payment-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <p className="df-payment-demo-note">
                Demo only: use code <b>123456</b>.
              </p>
              {error && (
                <p className="df-payment-error">
                  <AlertCircle size={15} />
                  {error}
                </p>
              )}
              <button
                className="df-payment-primary"
                type="button"
                onClick={verifyOtp}
              >
                Verify code <span>→</span>
              </button>
            </div>
          )}
          {step === "pin" && (
            <div className="df-payment-step">
              <button
                className="df-payment-back"
                type="button"
                onClick={goBack}
              >
                <ArrowLeft size={15} /> Back
              </button>
              <p className="df-payment-eyebrow">STEP 4 OF 4</p>
              <h2 id="df-payment-title">Confirm your payment</h2>
              <p className="df-payment-muted">
                Enter a demo PIN to simulate the provider response.
              </p>
              <label className="df-payment-label" htmlFor="df-payment-pin">
                5-digit demo PIN
              </label>
              <input
                id="df-payment-pin"
                className="df-payment-input"
                type="password"
                inputMode="numeric"
                maxLength={5}
                placeholder="•••••"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              />
              <div className="df-payment-demo-note">
                <b>12345</b> = success · <b>00000</b> = failed · <b>11111</b> =
                insufficient balance
              </div>
              {error && (
                <p className="df-payment-error">
                  <AlertCircle size={15} />
                  {error}
                </p>
              )}
              <button
                className="df-payment-primary"
                type="button"
                onClick={processPayment}
              >
                <LockKeyhole size={16} /> Pay ৳
                {Number(amount || 0).toLocaleString("en-BD")}
              </button>
            </div>
          )}
          {step === "processing" && (
            <div className="df-payment-state">
              <span className="df-payment-spinner" />
              <h2 id="df-payment-title">Processing payment</h2>
              <p className="df-payment-muted">
                Please wait while Dr.-Fix confirms your demo transaction.
              </p>
            </div>
          )}
          {step === "success" && (
            <div className="df-payment-state">
              <span className="df-payment-state-icon success">
                <CheckCircle2 size={35} />
              </span>
              <p className="df-payment-eyebrow">PAYMENT COMPLETE · DEMO</p>
              <h2 id="df-payment-title">Payment successful!</h2>
              <p className="df-payment-muted">
                Your mock payment has been recorded for this booking.
              </p>
              <div className="df-payment-receipt">
                <div>
                  <span>Amount</span>
                  <strong>
                    ৳{Number(amount || 0).toLocaleString("en-BD")}
                  </strong>
                </div>
                <div>
                  <span>Method</span>
                  <strong>{activeProvider.name}</strong>
                </div>
                <div>
                  <span>Transaction reference</span>
                  <strong>{txn}</strong>
                </div>
              </div>
              <button
                className="df-payment-primary"
                type="button"
                onClick={() => {
                  if (confirmationPath)
                    window.location.assign(confirmationPath);
                  else onClose();
                }}
              >
                View booking confirmation <span>→</span>
              </button>
            </div>
          )}
          {step === "failed" && (
            <div className="df-payment-state">
              <span className="df-payment-state-icon failed">
                <AlertCircle size={35} />
              </span>
              <h2 id="df-payment-title">Payment unsuccessful</h2>
              <p className="df-payment-muted">
                {error || "The demo transaction could not be completed."}
              </p>
              <p className="df-payment-demo-note">
                No real money has been charged. Return to checkout to choose
                another method or retry.
              </p>
              <button
                className="df-payment-primary"
                type="button"
                onClick={onClose}
              >
                Return to checkout
              </button>
              <button
                className="df-payment-secondary"
                type="button"
                onClick={() => {
                  setError("");
                  setPin("");
                  setStep("pin");
                }}
              >
                Try again
              </button>
            </div>
          )}
        </div>
        <footer className="df-payment-footer">
          <span>
            <ShieldCheck size={14} /> Demo payment — no real transaction
          </span>
          <span>Dr.-Fix Pay</span>
        </footer>
      </section>
    </div>
  );
}

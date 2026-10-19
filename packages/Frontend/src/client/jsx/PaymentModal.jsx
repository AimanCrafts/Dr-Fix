import { useEffect, useRef, useState } from "react";
import {
  X,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  AlertCircle,
  XCircle,
  Info,
  Lock,
  LockKeyhole,
  Smartphone,
  CreditCard,
  Landmark,
  Check,
  Copy,
  Download,
  User,
  CalendarDays,
} from "lucide-react";
import "../css/payment-modal.css";
import bkashLogo from "../../assets/payment/bkash.png";
import nagadLogo from "../../assets/payment/nagad.png";
import rocketLogo from "../../assets/payment/rocket.png";

/* Step 1: how the customer wants to pay. Icons only, no images. */
const METHODS = [
  {
    id: "mobile",
    title: "Mobile Banking",
    short: "Mobile banking",
    desc: "bKash, Nagad, Rocket",
    icon: Smartphone,
    available: true,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    short: "Card payment",
    desc: "Visa, Mastercard, American Express",
    icon: CreditCard,
    available: true,
  },
  {
    id: "netbank",
    title: "Internet Banking",
    short: "Internet banking",
    desc: "Pay directly from your bank account",
    icon: Landmark,
    available: false,
  },
];

/* Step 2 (mobile banking only): which provider.
   No live provider API is connected yet, so the sandbox verifies the codes below. */
const PROVIDERS = [
  {
    id: "bkash",
    name: "bKash",
    logo: bkashLogo,
    accent: "#e2136e",
    accent2: "#ea3684",
    available: true,
    otpLength: 6,
    pinLength: 5,
    codes: {
      otp: "123456",
      pinOk: "12345",
      pinDeclined: "00000",
      pinNoFunds: "11111",
    },
  },
  {
    id: "nagad",
    name: "Nagad",
    logo: nagadLogo,
    accent: "#ee5a24",
    accent2: "#f58a3a",
    available: true,
    otpLength: 6,
    pinLength: 4,
    codes: {
      otp: "123456",
      pinOk: "1234",
      pinDeclined: "0000",
      pinNoFunds: "1111",
    },
  },
  {
    id: "rocket",
    name: "Rocket",
    logo: rocketLogo,
    accent: "#8a2a8f",
    accent2: "#ab4bb0",
    available: true,
    otpLength: 6,
    pinLength: 4,
    codes: {
      otp: "123456",
      pinOk: "1234",
      pinDeclined: "0000",
      pinNoFunds: "1111",
    },
  },
];

/* Card sandbox: any Luhn-valid Visa / Mastercard / Amex number succeeds,
   except these two special numbers. The bank code is always 123456. */
const CARD_TEST = {
  otp: "123456",
  declined: "4000000000000002",
  noFunds: "4000000000009995",
};

const CARD_BRANDS = {
  visa: { id: "visa", name: "Visa", cvv: 3, max: 16, groups: [4, 4, 4, 4] },
  mastercard: {
    id: "mastercard",
    name: "Mastercard",
    cvv: 3,
    max: 16,
    groups: [4, 4, 4, 4],
  },
  amex: {
    id: "amex",
    name: "American Express",
    cvv: 4,
    max: 15,
    groups: [4, 6, 5],
  },
};
const DEFAULT_GROUPS = [4, 4, 4, 4];

const RESEND_SECONDS = 45;
const PROCESS_MS = 5000;

const MOBILE_STEPS = [
  { id: "phone", label: "Account" },
  { id: "otp", label: "Verify" },
  { id: "pin", label: "PIN" },
];
const CARD_STEPS = [
  { id: "card", label: "Card details" },
  { id: "cardOtp", label: "Bank verification" },
];

const CONFETTI = [
  { x: "8%", d: "0s", c: "#16a05d", r: "420deg" },
  { x: "17%", d: ".25s", c: "#f5b83d", r: "-380deg" },
  { x: "26%", d: ".1s", c: "#0b63e5", r: "560deg" },
  { x: "35%", d: ".4s", c: "#e2136e", r: "-440deg" },
  { x: "44%", d: ".05s", c: "#16a05d", r: "500deg" },
  { x: "53%", d: ".3s", c: "#8a2a8f", r: "-520deg" },
  { x: "62%", d: ".15s", c: "#f5b83d", r: "460deg" },
  { x: "71%", d: ".45s", c: "#0b63e5", r: "-400deg" },
  { x: "80%", d: ".2s", c: "#e2136e", r: "540deg" },
  { x: "89%", d: ".35s", c: "#16a05d", r: "-480deg" },
  { x: "13%", d: ".55s", c: "#0b63e5", r: "380deg" },
  { x: "48%", d: ".6s", c: "#f5b83d", r: "-420deg" },
  { x: "67%", d: ".5s", c: "#16a05d", r: "520deg" },
  { x: "93%", d: ".65s", c: "#8a2a8f", r: "-360deg" },
];

const makeReference = () =>
  `DFX-${Date.now().toString(36).toUpperCase()}${Math.random()
    .toString(36)
    .slice(2, 5)
    .toUpperCase()}`;

const formatMoney = (value) => `৳${Number(value || 0).toLocaleString("en-BD")}`;

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

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const esc = (value) =>
  String(value).replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );

/* ---------------- Card helpers ---------------- */
const detectBrand = (digits) => {
  if (/^4/.test(digits)) return CARD_BRANDS.visa;
  if (/^(5[1-5]|222[1-9]|22[3-9]\d|2[3-6]\d\d|27[01]\d|2720)/.test(digits))
    return CARD_BRANDS.mastercard;
  if (/^3[47]/.test(digits)) return CARD_BRANDS.amex;
  return null;
};

const groupDigits = (value, groups) => {
  const parts = [];
  let index = 0;
  for (const size of groups) {
    if (index >= value.length) break;
    parts.push(value.slice(index, index + size));
    index += size;
  }
  return parts.join(" ");
};

const formatCardNumber = (digits, brand) =>
  groupDigits(digits, (brand || { groups: DEFAULT_GROUPS }).groups);

const luhn = (num) => {
  let sum = 0;
  let alt = false;
  for (let i = num.length - 1; i >= 0; i -= 1) {
    let n = Number(num[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
};

const formatExpiry = (raw) => {
  let d = raw.replace(/\D/g, "");
  if (d.length >= 1 && d[0] > "1") d = `0${d}`;
  d = d.slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

const checkExpiry = (value) => {
  const d = value.replace(/\D/g, "");
  if (d.length < 4) return "Enter a valid expiry date.";
  const month = Number(d.slice(0, 2));
  const year = 2000 + Number(d.slice(2));
  if (month < 1 || month > 12) return "Enter a valid expiry date.";
  const now = new Date();
  const thisYear = now.getFullYear();
  const thisMonth = now.getMonth() + 1;
  if (year < thisYear || (year === thisYear && month < thisMonth))
    return "This card has expired.";
  if (year > thisYear + 20) return "Enter a valid expiry date.";
  return "";
};

/* Saves a small standalone receipt the customer can keep or print. */
const downloadReceipt = ({ rows, amount, txn }) => {
  const body = rows
    .map(([k, v]) => `<tr><td>${esc(k)}</td><td>${esc(v)}</td></tr>`)
    .join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Receipt ${esc(txn)}</title><style>
body{margin:0;background:#f4f7fb;font-family:system-ui,-apple-system,"Segoe UI",sans-serif;color:#0f1c33}
.r{max-width:440px;margin:40px auto;background:#fff;border:1px solid #e6ebf2;border-radius:16px;padding:32px}
h1{margin:0 0 4px;font-size:22px;color:#0b63e5}
p{margin:0 0 20px;color:#66758c;font-size:14px}
.amt{font-size:30px;font-weight:600;margin:0 0 20px}
table{width:100%;border-collapse:collapse;font-size:14px}
td{padding:12px 0;border-bottom:1px dashed #e6ebf2}
td:last-child{text-align:right;font-weight:500}
</style></head><body><div class="r"><h1>Dr.-Fix</h1><p>Payment receipt</p><div class="amt">${esc(amount)}</div><table>${body}</table></div></body></html>`;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${txn}-receipt.html`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/* Large circular input shared by the OTP and PIN steps. */
function CodeCircles({
  id,
  length,
  value,
  onChange,
  secret,
  onEnter,
  label,
  invalid,
  shakeKey,
  grouped,
}) {
  const inputRef = useRef(null);

  // Runs on first render and again after a wrong code remounts the row.
  useEffect(() => {
    inputRef.current?.focus();
  }, [shakeKey]);

  const active = Math.min(value.length, length - 1);

  return (
    <div
      key={shakeKey}
      className={`df-code ${grouped ? "grouped" : ""} ${invalid ? "invalid" : ""}`}
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
              secret ? (
                <i className="df-code-dot" />
              ) : (
                value[index]
              )
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

/* Provider banner shown at the top of the account, code and PIN steps. */
function BrandBar({ provider, amount }) {
  return (
    <div className="df-brandbar">
      <span className="df-brandbar-logo">
        <img src={provider.logo} alt={provider.name} />
      </span>
      <div className="df-brandbar-text">
        <strong>{provider.name} Payment</strong>
        <span>Paying to Dr.-Fix</span>
      </div>
      <div className="df-brandbar-amt">
        <small>Amount</small>
        <strong>{formatMoney(amount)}</strong>
      </div>
    </div>
  );
}

/* Same banner for the card flow, with the card shown masked. */
function CardBar({ brand, last4, amount }) {
  return (
    <div className="df-brandbar df-cardbar">
      <span className="df-brandbar-logo">
        <CreditCard size={24} />
      </span>
      <div className="df-brandbar-text">
        <strong>Card Payment</strong>
        <span>
          {brand ? brand.name : "Card"} •••• {last4}
        </span>
      </div>
      <div className="df-brandbar-amt">
        <small>Amount</small>
        <strong>{formatMoney(amount)}</strong>
      </div>
    </div>
  );
}

function FlowSteps({ steps = MOBILE_STEPS, current }) {
  const index = steps.findIndex((s) => s.id === current);
  return (
    <ol className="df-flow" aria-label="Payment progress">
      {steps.map((s, i) => (
        <li
          key={s.id}
          className={i < index ? "done" : i === index ? "active" : ""}
          aria-current={i === index ? "step" : undefined}
        >
          <span className="df-flow-dot">
            {i < index ? <Check size={13} strokeWidth={3} /> : i + 1}
          </span>
          <span className="df-flow-label">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

/* Drawn with CSS and text only, so no brand images are needed. */
function BrandMark({ brand, light }) {
  if (!brand) return null;
  const cls = `df-bm ${brand.id} ${light ? "light" : ""}`;
  if (brand.id === "mastercard")
    return (
      <span className={cls} role="img" aria-label="Mastercard">
        <i />
        <i />
      </span>
    );
  return (
    <span className={cls} role="img" aria-label={brand.name}>
      {brand.id === "visa" ? "VISA" : "AMEX"}
    </span>
  );
}

/* Live card that fills in as the customer types. */
function CardPreview({ brand, digits, name, expiry }) {
  const groups = (brand || { groups: DEFAULT_GROUPS }).groups;
  const max = brand ? brand.max : 16;
  const number = groupDigits(digits.padEnd(max, "•"), groups);
  return (
    <div
      className={`df-ccard ${brand ? `brand-${brand.id}` : ""}`}
      aria-hidden="true"
    >
      <div className="df-ccard-top">
        <span className="df-emv" />
        <BrandMark brand={brand} />
      </div>
      <div className="df-ccard-number">{number}</div>
      <div className="df-ccard-bottom">
        <div>
          <small>Card holder</small>
          <span>{name.trim() ? name.toUpperCase() : "YOUR NAME"}</span>
        </div>
        <div>
          <small>Expires</small>
          <span>{expiry || "MM/YY"}</span>
        </div>
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
  const [method, setMethod] = useState("mobile");
  const [provider, setProvider] = useState("bkash");
  const [step, setStep] = useState("method");
  const [phone, setPhone] = useState("");
  const [agree, setAgree] = useState(true);
  const [otp, setOtp] = useState("");
  const [pin, setPin] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardErr, setCardErr] = useState({});
  const [error, setError] = useState("");
  const [tick, setTick] = useState(0);
  const [notice, setNotice] = useState("");
  const [info, setInfo] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [stage, setStage] = useState(0);
  const [txn, setTxn] = useState("");
  const [authCode, setAuthCode] = useState("");
  const [paidAt, setPaidAt] = useState("");
  const [copied, setCopied] = useState(false);
  const [confirmationPath, setConfirmationPath] = useState("");
  const mounted = useRef(true);
  const busy = useRef(false);

  const activeProvider =
    PROVIDERS.find((item) => item.id === provider) || PROVIDERS[0];
  const fallbackProvider = PROVIDERS.find((item) => item.available);
  const fallbackMethod = METHODS.find((item) => item.available);
  const { otpLength, pinLength, codes } = activeProvider;

  const isCard = method === "card";
  const cardDigits = cardNumber.replace(/\D/g, "");
  const cardBrand = detectBrand(cardDigits);
  const cardLast4 = cardDigits.slice(-4);
  const cardComplete =
    !!cardBrand && cardDigits.length === cardBrand.max && luhn(cardDigits);

  const lockedStep = step === "processing" || step === "success";
  const inFlow = step === "otp" || step === "pin" || step === "cardOtp";
  const brandStep = step === "phone" || step === "otp" || step === "pin";
  const resultStep =
    step === "success" || step === "failed" || step === "cancelled";
  const showAside = !resultStep && step !== "processing";
  const phoneValid = /^01\d{9}$/.test(phone);
  const useBlue = step === "method" || isCard;
  const accent = useBlue ? "#0b63e5" : activeProvider.accent;
  const accent2 = useBlue ? "#3b8bff" : activeProvider.accent2;
  const bodyClass = step === "success" ? "success" : showAside ? "" : "single";

  const paidWithText = isCard
    ? `${cardBrand ? cardBrand.name : "Card"} •••• ${cardLast4}`
    : `${activeProvider.name} · ${maskPhone(phone)}`;

  const stages = isCard
    ? [
        "Verifying your code...",
        "Contacting your bank...",
        "Confirming your transaction...",
        "Almost done...",
      ]
    : [
        "Verifying your PIN...",
        `Contacting ${activeProvider.name}...`,
        "Confirming your transaction...",
        "Almost done...",
      ];

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

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

  // Resend countdown on the OTP steps.
  useEffect(() => {
    if ((step !== "otp" && step !== "cardOtp") || resendIn <= 0)
      return undefined;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [step, resendIn]);

  // Rotates the status line while the payment is processing.
  useEffect(() => {
    if (step !== "processing") return undefined;
    setStage(0);
    const timers = [1250, 2500, 3750].map((ms, i) =>
      setTimeout(() => setStage(i + 1), ms),
    );
    return () => timers.forEach(clearTimeout);
  }, [step]);

  // An error also restarts the shake animation on the code circles.
  const raise = (message) => {
    setError(message);
    setTick((t) => t + 1);
  };

  const goBack = () => {
    setError("");
    setInfo("");
    setNotice("");
    const previous = {
      provider: "method",
      phone: "provider",
      otp: "phone",
      pin: "otp",
      card: "method",
      cardOtp: "card",
    };
    setStep(previous[step] || "method");
  };

  const cancelPayment = () => {
    setError("");
    setInfo("");
    setStep("cancelled");
  };

  const chooseMethod = (item) => {
    if (!item.available) {
      setNotice(
        `${item.short} is not available right now. Please continue with ${fallbackMethod.title}.`,
      );
      return;
    }
    setNotice("");
    setMethod(item.id);
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

  const continueMethod = () => {
    setNotice("");
    setError("");
    setCardErr({});
    setStep(method === "card" ? "card" : "provider");
  };

  /* ---------------- Mobile banking ---------------- */
  const continuePhone = () => {
    if (!phoneValid) {
      setError("Enter a valid 11-digit mobile number.");
      return;
    }
    if (!agree) {
      setError("Please accept the terms and conditions to continue.");
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
    if (otp.length < otpLength) {
      setError(`Enter the ${otpLength}-digit verification code.`);
      return;
    }
    if (otp !== codes.otp) {
      setOtp("");
      raise("The verification code you entered is incorrect.");
      return;
    }
    setError("");
    setPin("");
    setStep("pin");
  };

  /* Shared by mobile banking and card: 5 second processing screen, then result. */
  const startProcessing = async ({ payload, failReason }) => {
    if (busy.current) return;
    busy.current = true;

    const reference = makeReference();
    setError("");
    setTxn(reference);
    setStep("processing");

    const request = failReason
      ? Promise.resolve({ ok: false, reason: failReason })
      : Promise.resolve()
          .then(() =>
            onPaymentSuccess({ ...payload, transactionId: reference }),
          )
          .then(
            // onPaymentSuccess may return a path or { path, transactionId }.
            // The transaction id is created by the server, so we show that one.
            (res) => ({
              ok: true,
              path: (typeof res === "string" ? res : res?.path) || "",
              txn: typeof res === "object" ? res?.transactionId : "",
            }),
            (e) => ({
              ok: false,
              reason:
                e?.message ||
                "We couldn't complete the payment. Please try again.",
            }),
          );

    // Always show the processing screen for the full 5 seconds.
    const [result] = await Promise.all([request, wait(PROCESS_MS)]);
    busy.current = false;
    if (!mounted.current) return;

    if (result.ok) {
      if (result.txn) setTxn(result.txn);
      setPaidAt(formatDateTime(new Date()));
      setAuthCode(String(Math.floor(100000 + Math.random() * 900000)));
      setConfirmationPath(result.path);
      setStep("success");
    } else {
      setError(result.reason);
      setStep("failed");
    }
  };

  const processPayment = () => {
    if (step !== "pin") return;
    if (pin.length < pinLength) {
      setError(`Enter your ${pinLength}-digit PIN.`);
      return;
    }
    if (![codes.pinOk, codes.pinNoFunds, codes.pinDeclined].includes(pin)) {
      setPin("");
      raise("Incorrect PIN. Please try again.");
      return;
    }
    const failReason =
      pin === codes.pinNoFunds
        ? "Insufficient balance in your account."
        : pin === codes.pinDeclined
          ? "The transaction could not be completed."
          : "";
    startProcessing({
      failReason,
      payload: {
        method: `online_${provider}`,
        provider: activeProvider.name,
        phone,
      },
    });
  };

  /* ---------------- Card ---------------- */
  const clearCardErr = (key) =>
    setCardErr((prev) => (prev[key] ? { ...prev, [key]: "" } : prev));

  const changeCardNumber = (value) => {
    let digits = value.replace(/\D/g, "").slice(0, 19);
    const brand = detectBrand(digits);
    digits = digits.slice(0, brand ? brand.max : 16);
    setCardNumber(formatCardNumber(digits, brand));
    setCardCvv((v) => v.slice(0, brand ? brand.cvv : 3));
    clearCardErr("number");
  };

  const submitCard = () => {
    const errs = {};
    if (cardDigits.length === 0) errs.number = "Enter your card number.";
    else if (!cardBrand)
      errs.number = "We accept Visa, Mastercard and American Express.";
    else if (cardDigits.length !== cardBrand.max || !luhn(cardDigits))
      errs.number = "Enter a valid card number.";

    if (!/^[\p{L}][\p{L} .'-]+$/u.test(cardName.trim()))
      errs.name = "Enter the name as shown on your card.";

    const expiryProblem = checkExpiry(cardExp);
    if (expiryProblem) errs.expiry = expiryProblem;

    const cvvLength = cardBrand ? cardBrand.cvv : 3;
    if (cardCvv.length !== cvvLength)
      errs.cvv = `Enter the ${cvvLength}-digit security code.`;

    setCardErr(errs);
    if (Object.keys(errs).length) return;

    setError("");
    setInfo("");
    setOtp("");
    setResendIn(RESEND_SECONDS);
    setStep("cardOtp");
  };

  const verifyCardOtp = () => {
    if (step !== "cardOtp") return;
    setInfo("");
    if (otp.length < 6) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    if (otp !== CARD_TEST.otp) {
      setOtp("");
      raise("The verification code you entered is incorrect.");
      return;
    }
    const failReason =
      cardDigits === CARD_TEST.noFunds
        ? "Insufficient funds on this card."
        : cardDigits === CARD_TEST.declined
          ? "Your card was declined by the issuing bank."
          : "";
    startProcessing({
      failReason,
      payload: {
        method: "online_card",
        provider: cardBrand ? cardBrand.name : "Card",
        phone: "",
        cardLast4,
      },
    });
  };

  const copyTxn = async () => {
    try {
      await navigator.clipboard.writeText(txn);
      setCopied(true);
      setTimeout(() => mounted.current && setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  const saveReceipt = () =>
    downloadReceipt({
      amount: `${formatMoney(amount)} BDT`,
      txn,
      rows: [
        ["Status", "Completed"],
        ["Service", serviceName],
        ["Merchant", "Dr.-Fix"],
        ["Paid with", paidWithText],
        ["Date & time", paidAt],
        ["Transaction ID", txn],
        ...(isCard && authCode ? [["Authorization code", authCode]] : []),
      ],
    });

  const errorBlock = error && (
    <p className="df-error" role="alert">
      <AlertCircle size={16} />
      {error}
    </p>
  );

  const noticeBlock = notice && (
    <p className="df-inline-notice" role="status">
      <Info size={16} />
      {notice}
    </p>
  );

  const fieldError = (key) =>
    cardErr[key] ? (
      <p className="df-field-error" role="alert">
        {cardErr[key]}
      </p>
    ) : null;

  return (
    <div
      className="df-pay-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <section
        className={`df-pay-modal ${brandStep ? "is-flow" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="df-pay-title"
        style={{ "--accent": accent, "--accent-2": accent2 }}
      >
        <header className="df-pay-header">
          <span className="df-pay-brand">Dr.-Fix</span>
          <div className="df-pay-head-right">
            <span className="df-pay-secure">
              <ShieldCheck size={16} /> Secure Payment
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

        {/* Honest label: nothing here moves real money. Shows the test codes
            for the step the person is on so the demo never gets stuck. */}
        <div className="df-test-banner" role="note">
          <strong>Test mode</strong>
          <span>
            {step === "otp"
              ? `No real money is charged. Demo code: ${codes.otp}`
              : step === "pin"
                ? `No real money is charged. Demo PIN: ${codes.pinOk}`
                : step === "cardOtp"
                  ? `No real money is charged. Demo code: ${CARD_TEST.otp}`
                  : step === "card"
                    ? "No real money is charged. Use any valid test card number."
                    : "No real money is charged. This is a demonstration payment."}
          </span>
        </div>

        <div className={`df-pay-body ${bodyClass}`}>
          {step === "success" && (
            <div className="df-success-side">
              <div className="df-confetti" aria-hidden="true">
                {CONFETTI.map((c, i) => (
                  <i
                    key={i}
                    style={{ "--x": c.x, "--d": c.d, "--c": c.c, "--r": c.r }}
                  />
                ))}
              </div>
              <span className="df-check-wrap">
                <svg
                  className="df-check"
                  viewBox="0 0 88 88"
                  aria-hidden="true"
                >
                  <circle className="df-check-bg" cx="44" cy="44" r="40" />
                  <path className="df-check-tick" d="M27 45l12 12 22-26" />
                </svg>
              </span>
              <h2 id="df-pay-title">Payment Successful</h2>
              <p className="df-muted">
                Your payment to Dr.-Fix has been received.
              </p>
              <div className="df-paid">
                <small>Amount paid</small>
                <strong>
                  {formatMoney(amount)} <span>BDT</span>
                </strong>
              </div>
            </div>
          )}

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
                  {step !== "method" && (
                    <div>
                      <dt>Method</dt>
                      <dd>
                        {isCard
                          ? "Credit / Debit Card"
                          : step === "provider"
                            ? "Mobile Banking"
                            : activeProvider.name}
                      </dd>
                    </div>
                  )}
                  {(step === "otp" || step === "pin") && (
                    <div>
                      <dt>Account</dt>
                      <dd>{maskPhone(phone)}</dd>
                    </div>
                  )}
                  {step === "cardOtp" && (
                    <div>
                      <dt>Card</dt>
                      <dd>
                        {cardBrand ? cardBrand.name : "Card"} •••• {cardLast4}
                      </dd>
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

          <div
            className={`df-pay-main ${step === "success" ? "df-receipt-main" : ""} ${step === "card" ? "is-card" : ""}`}
          >
            {step === "method" && (
              <div className="df-step">
                <StepHead
                  title="Select payment method"
                  subtitle={`Choose how you would like to pay ${formatMoney(amount)}.`}
                />
                <div
                  className="df-methods"
                  role="radiogroup"
                  aria-label="Payment method"
                >
                  {METHODS.map((item) => {
                    const Icon = item.icon;
                    const selected = method === item.id && item.available;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        role="radio"
                        aria-checked={selected}
                        aria-disabled={!item.available}
                        className={`df-method ${selected ? "selected" : ""} ${item.available ? "" : "is-unavailable"}`}
                        onClick={() => chooseMethod(item)}
                      >
                        <span className="df-method-icon">
                          <Icon size={22} />
                        </span>
                        <span className="df-method-text">
                          <span className="df-method-title">{item.title}</span>
                          <span className="df-method-desc">{item.desc}</span>
                        </span>
                        {item.available ? (
                          <span className="df-radio">
                            {selected && <Check size={12} strokeWidth={3} />}
                          </span>
                        ) : (
                          <span className="df-pill">Unavailable</span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {noticeBlock}
                <button
                  className="df-primary df-primary-accent"
                  type="button"
                  onClick={continueMethod}
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === "provider" && (
              <div className="df-step">
                <StepHead
                  title="Mobile Banking"
                  subtitle="Select your mobile banking provider."
                  onBack={goBack}
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
                        data-tip={
                          item.available ? undefined : "Currently unavailable"
                        }
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
                {noticeBlock}
                <button
                  className="df-primary df-primary-accent"
                  type="button"
                  onClick={() => {
                    setError("");
                    setNotice("");
                    setStep("phone");
                  }}
                >
                  Continue with {activeProvider.name} <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === "phone" && (
              <div className="df-step">
                <BrandBar provider={activeProvider} amount={amount} />
                <FlowSteps current="phone" />
                <StepHead
                  title={`Your ${activeProvider.name} Account number`}
                  subtitle={`Pay with your ${activeProvider.name} account.`}
                  onBack={goBack}
                />
                <label className="df-label" htmlFor="df-pay-phone">
                  Mobile number
                </label>
                <div
                  className={`df-input-wrap ${error && !phoneValid ? "invalid" : ""}`}
                >
                  <Smartphone size={18} />
                  <span className="df-prefix">+88</span>
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
                  {phoneValid && <Check className="df-input-ok" size={18} />}
                </div>
                <p className="df-hint">
                  Enter the mobile number registered with {activeProvider.name}.
                </p>
                <label className="df-terms">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => {
                      setAgree(e.target.checked);
                      setError("");
                    }}
                  />
                  <span className="df-terms-box">
                    {agree && <Check size={14} strokeWidth={3} />}
                  </span>
                  <span>
                    I agree to the{" "}
                    <span className="df-terms-link">terms and conditions</span>
                  </span>
                </label>
                {errorBlock}
                <button
                  className="df-primary df-primary-accent"
                  type="button"
                  onClick={continuePhone}
                >
                  Confirm
                </button>
              </div>
            )}

            {step === "otp" && (
              <div className="df-step df-step-center">
                <BrandBar provider={activeProvider} amount={amount} />
                <FlowSteps current="otp" />
                <StepHead
                  center
                  title="Verification code"
                  subtitle={`A ${otpLength}-digit code has been sent to ${maskPhone(phone)}.`}
                  onBack={goBack}
                />
                <CodeCircles
                  id="df-pay-otp"
                  length={otpLength}
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    setError("");
                  }}
                  onEnter={verifyOtp}
                  label={`${otpLength}-digit verification code`}
                  invalid={!!error}
                  shakeKey={tick}
                  grouped={otpLength === 6}
                />
                {errorBlock}
                {info && !error && <p className="df-info">{info}</p>}
                <p className="df-resend">
                  Didn&apos;t receive the code?{" "}
                  {resendIn > 0 ? (
                    <span>Resend in 0:{String(resendIn).padStart(2, "0")}</span>
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
                <BrandBar provider={activeProvider} amount={amount} />
                <FlowSteps current="pin" />
                <StepHead
                  center
                  title="Enter your PIN"
                  subtitle={`Enter your ${activeProvider.name} Account PIN to pay ${formatMoney(amount)} to Dr.-Fix.`}
                  onBack={goBack}
                />
                <CodeCircles
                  id="df-pay-pin"
                  length={pinLength}
                  value={pin}
                  onChange={(v) => {
                    setPin(v);
                    setError("");
                  }}
                  onEnter={processPayment}
                  secret
                  label={`${pinLength}-digit PIN`}
                  invalid={!!error}
                  shakeKey={tick}
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

            {step === "card" && (
              <div className="df-step df-step-card">
                <FlowSteps steps={CARD_STEPS} current="card" />
                <StepHead title="Card details" onBack={goBack} />
                <CardPreview
                  brand={cardBrand}
                  digits={cardDigits}
                  name={cardName}
                  expiry={cardExp}
                />

                <div className="df-field">
                  <label className="df-label" htmlFor="df-card-number">
                    Card number
                  </label>
                  <div
                    className={`df-input-wrap ${cardErr.number ? "invalid" : ""}`}
                  >
                    <CreditCard size={18} />
                    <input
                      id="df-card-number"
                      className="df-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => changeCardNumber(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitCard()}
                      autoFocus
                    />
                    <BrandMark brand={cardBrand} light />
                    {cardComplete && (
                      <Check className="df-input-ok" size={18} />
                    )}
                  </div>
                  {fieldError("number")}
                </div>

                <div className="df-field">
                  <label className="df-label" htmlFor="df-card-name">
                    Name on card
                  </label>
                  <div
                    className={`df-input-wrap ${cardErr.name ? "invalid" : ""}`}
                  >
                    <User size={18} />
                    <input
                      id="df-card-name"
                      className="df-input df-input-text"
                      type="text"
                      autoComplete="cc-name"
                      placeholder="Full name"
                      maxLength={40}
                      value={cardName}
                      onChange={(e) => {
                        setCardName(e.target.value);
                        clearCardErr("name");
                      }}
                      onKeyDown={(e) => e.key === "Enter" && submitCard()}
                    />
                  </div>
                  {fieldError("name")}
                </div>

                <div className="df-row2">
                  <div className="df-field">
                    <label className="df-label" htmlFor="df-card-exp">
                      Expiry date
                    </label>
                    <div
                      className={`df-input-wrap ${cardErr.expiry ? "invalid" : ""}`}
                    >
                      <CalendarDays size={18} />
                      <input
                        id="df-card-exp"
                        className="df-input"
                        type="text"
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        placeholder="MM/YY"
                        value={cardExp}
                        onChange={(e) => {
                          setCardExp(formatExpiry(e.target.value));
                          clearCardErr("expiry");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && submitCard()}
                      />
                    </div>
                    {fieldError("expiry")}
                  </div>
                  <div className="df-field">
                    <label className="df-label" htmlFor="df-card-cvv">
                      Security code
                    </label>
                    <div
                      className={`df-input-wrap ${cardErr.cvv ? "invalid" : ""}`}
                    >
                      <LockKeyhole size={18} />
                      <input
                        id="df-card-cvv"
                        className="df-input"
                        type="password"
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        placeholder={
                          cardBrand && cardBrand.cvv === 4 ? "••••" : "•••"
                        }
                        maxLength={cardBrand ? cardBrand.cvv : 3}
                        value={cardCvv}
                        onChange={(e) => {
                          setCardCvv(e.target.value.replace(/\D/g, ""));
                          clearCardErr("cvv");
                        }}
                        onKeyDown={(e) => e.key === "Enter" && submitCard()}
                      />
                    </div>
                    {fieldError("cvv")}
                  </div>
                </div>

                <button
                  className="df-primary df-primary-accent"
                  type="button"
                  onClick={submitCard}
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            )}

            {step === "cardOtp" && (
              <div className="df-step df-step-center">
                <CardBar brand={cardBrand} last4={cardLast4} amount={amount} />
                <FlowSteps steps={CARD_STEPS} current="cardOtp" />
                <StepHead
                  center
                  title="Bank verification"
                  subtitle="Enter the 6-digit code your bank sent to the mobile number linked with this card."
                  onBack={goBack}
                />
                <CodeCircles
                  id="df-pay-card-otp"
                  length={6}
                  value={otp}
                  onChange={(v) => {
                    setOtp(v);
                    setError("");
                  }}
                  onEnter={verifyCardOtp}
                  label="6-digit verification code"
                  invalid={!!error}
                  shakeKey={tick}
                  grouped
                />
                {errorBlock}
                {info && !error && <p className="df-info">{info}</p>}
                <p className="df-resend">
                  Didn&apos;t receive the code?{" "}
                  {resendIn > 0 ? (
                    <span>Resend in 0:{String(resendIn).padStart(2, "0")}</span>
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
                    onClick={verifyCardOtp}
                  >
                    <LockKeyhole size={16} /> Verify &amp; pay{" "}
                    {formatMoney(amount)}
                  </button>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="df-state df-processing">
                <div className="df-orb">
                  <span className="df-orb-logo">
                    {isCard ? (
                      <CreditCard size={28} />
                    ) : (
                      <img src={activeProvider.logo} alt="" />
                    )}
                  </span>
                </div>
                <h2 id="df-pay-title">Processing your payment</h2>
                <p className="df-muted df-stage" aria-live="polite">
                  {stages[stage]}
                </p>
                <div className="df-progress" aria-hidden="true">
                  <span style={{ animationDuration: `${PROCESS_MS}ms` }} />
                </div>
                <p className="df-thanks">
                  Please do not close or refresh this window.
                </p>
              </div>
            )}

            {step === "success" && (
              <>
                <div className="df-receipt-head">
                  <h3>Payment receipt</h3>
                  <span className="df-chip">
                    <i /> Completed
                  </span>
                </div>
                <dl className="df-receipt">
                  <div>
                    <dt>Service</dt>
                    <dd>{serviceName}</dd>
                  </div>
                  <div>
                    <dt>Merchant</dt>
                    <dd>Dr.-Fix</dd>
                  </div>
                  <div>
                    <dt>Paid with</dt>
                    <dd className="df-paidwith">
                      <span className="df-mini-logo">
                        {isCard ? (
                          <CreditCard size={14} />
                        ) : (
                          <img src={activeProvider.logo} alt="" />
                        )}
                      </span>
                      {paidWithText}
                    </dd>
                  </div>
                  <div>
                    <dt>Date &amp; time</dt>
                    <dd>{paidAt}</dd>
                  </div>
                  <div>
                    <dt>Transaction ID</dt>
                    <dd className="df-txn">
                      <span>{txn}</span>
                      <button
                        type="button"
                        className="df-copy"
                        aria-label="Copy transaction ID"
                        onClick={copyTxn}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </dd>
                  </div>
                  {isCard && authCode && (
                    <div>
                      <dt>Authorization code</dt>
                      <dd>{authCode}</dd>
                    </div>
                  )}
                  <div className="df-receipt-total">
                    <dt>Total paid</dt>
                    <dd>{formatMoney(amount)} BDT</dd>
                  </div>
                </dl>
                <div className="df-actions df-receipt-actions">
                  <button
                    className="df-outline"
                    type="button"
                    onClick={saveReceipt}
                  >
                    <Download size={16} /> Download receipt
                  </button>
                  <button
                    className="df-primary df-primary-blue"
                    type="button"
                    onClick={() => {
                      if (confirmationPath)
                        window.location.assign(confirmationPath);
                      else onClose();
                    }}
                  >
                    Return to Dr.-Fix
                  </button>
                </div>
                <p className="df-thanks df-thanks-left">
                  Thank you for using Dr.-Fix.
                </p>
              </>
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
                    <strong>
                      {error || "The transaction was not completed."}
                    </strong>
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
                      setOtp("");
                      setCardErr({});
                      setStep(isCard ? "card" : "pin");
                    }}
                  >
                    Try Again
                  </button>
                  <button
                    className="df-outline"
                    type="button"
                    onClick={() => {
                      setError("");
                      setPin("");
                      setOtp("");
                      setNotice("");
                      setCardErr({});
                      setStep("method");
                    }}
                  >
                    Change Method
                  </button>
                </div>
                <button className="df-linkbtn" type="button" onClick={onClose}>
                  Back to my booking
                </button>
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
                  Back to my booking
                </button>
                <p className="df-thanks">
                  Need help? Contact our support team.
                </p>
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

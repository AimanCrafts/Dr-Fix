import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { resendOtp, verifyOtp } from "../api/auth";
import "../css/otp.css";


const CODE_LENGTH = 6;
const RESEND_SECONDS = 28;

function Otp() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || "your email";

  const [digits, setDigits] = useState(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const inputsRef = useRef([]);

  useEffect(() => {
    if (secondsLeft <= 0) return undefined;
    const timer = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formattedTime = `00:${String(secondsLeft).padStart(2, "0")}`;

  const handleChange = (index) => (e) => {
    const value = e.target.value.replace(/[^0-9]/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    if (value && index < CODE_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index) => (e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData
      .getData("text")
      .replace(/[^0-9]/g, "")
      .slice(0, CODE_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(CODE_LENGTH).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  };

  const handleResend = async () => {
    if (secondsLeft > 0) return;
    setError("");
    try {
      await resendOtp(email);
      setSecondsLeft(RESEND_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || "Could not resend code.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const code = digits.join("");

    setSubmitting(true);
    try {
      await verifyOtp(email, code);
      setVerified(true); // shows the "Verification successful" dialog below
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired code.");
    } finally {
      setSubmitting(false);
    }
  };

  const isComplete = digits.every((d) => d !== "");

  // Success dialog — matches your plan: "verification successful" +
  // a Continue button that sends the user to /login.
  if (verified) {
    return (
      <div className="otp-page">
        <div className="otp-card">
          <div className="otp-icon" aria-hidden="true">
            ✅
          </div>
          <h1 className="otp-heading">Verification Successful</h1>
          <p className="otp-subtext">Your email has been verified.</p>
          <button
            type="button"
            className="otp-submit"
            onClick={() => navigate("/login", { replace: true })}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="otp-page">
      <div className="otp-card">
        <div className="otp-icon" aria-hidden="true">
          ✉️
        </div>

        <h1 className="otp-heading">Verify Your Email</h1>
        <p className="otp-subtext">
          We&apos;ve sent a 6-digit code to <strong>{email}</strong>
        </p>

        {error && <p className="otp-error">{error}</p>}

        <form className="otp-form" onSubmit={handleSubmit}>
          <div className="otp-boxes" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="otp-box"
                value={digit}
                onChange={handleChange(index)}
                onKeyDown={handleKeyDown(index)}
              />
            ))}
          </div>

          <p className="otp-resend">
            Didn&apos;t receive the code?{" "}
            {secondsLeft > 0 ? (
              <span className="otp-resend__timer">
                Resend in <strong>{formattedTime}</strong>
              </span>
            ) : (
              <button
                type="button"
                className="otp-resend__link"
                onClick={handleResend}
              >
                Resend
              </button>
            )}
          </p>

          <button
            type="submit"
            className="otp-submit"
            disabled={!isComplete || submitting}
          >
            {submitting ? "Verifying..." : "Verify & Continue"}
          </button>
        </form>

        <Link to="/signup" className="otp-change-email">
          Change Email Address
        </Link>
      </div>
    </div>
  );
}

export default Otp;

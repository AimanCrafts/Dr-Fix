import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { registerUser } from "../api/auth";
import { registerTechnician } from "../../technician/api/auth";
import "../css/signup.css";
import { Eye, EyeOff, Home, Wrench } from "lucide-react";
/**
 * Signup
 * ------
 * Two-step-in-one page:
 *  1. Role selection ("I Need a Service" vs "I Provide Services")
 *  2. Registration form (name, email, phone, password [+ provider-only
 *     fields: service category, experience, work area, NID upload])
 *
 * Customer (role="customer"): POST /api/register, then routes to /otp
 * to verify the email, since that's the only identity check we have.
 *
 * Provider (role="provider"): POST /api/technician/register. No OTP —
 * the NID upload + admin manual approval is the identity check instead.
 * Routes straight to /technician/login; the account sits at
 * approval_status="pending" until an admin approves/rejects it.
 */

const ROLES = [
  {
    id: "customer",
    icon: Home,
    title: "I Need a Service",
    desc: "Book trusted home experts for repairs and maintenance",
  },
  {
    id: "provider",
    icon: Wrench,
    title: "I Provide Services",
    desc: "Join as a verified technician and grow your business",
  },
];

function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState(
    searchParams.get("role") === "provider" ? "provider" : "customer",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreed: false,
    // Provider-only fields — ignored by the backend if role !== "provider"
    serviceCategory: "",
    yearsOfExperience: "",
    workArea: "",
    nidFile: null,
  });

  const updateField = (field) => (e) => {
    const value = field === "agreed" ? e.target.checked : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateFile = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.files[0] || null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (role === "provider") {
        await registerTechnician(form);
        // No OTP step for providers — the account is created straight
        // into approval_status = "pending". Send them to the review
        // page; they'll need to log in there (or we could auto-login,
        // but keeping it explicit is simpler and matches the login page
        // already built for this role).
        navigate("/technician/login", {
          state: { justRegistered: true, email: form.email },
        });
        return;
      }

      await registerUser({ role, ...form });
      // Backend has emailed the OTP by this point — move to the OTP screen.
      navigate("/otp", { state: { email: form.email, role } });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-wrap">
        <h1 className="signup-heading">Join Dr.-Fix</h1>
        <p className="signup-subtext">Choose how you want to get started</p>

        <div className="signup-roles">
          {ROLES.map((r) => {
            const Icon = r.icon;

            return (
              <button
                key={r.id}
                type="button"
                className={`role-card ${role === r.id ? "is-selected" : ""}`}
                onClick={() => setRole(r.id)}
              >
                {role === r.id && (
                  <span className="role-card__check" aria-hidden="true">
                    ✓
                  </span>
                )}

                <span className="role-card__icon">
                  <Icon size={32} />
                </span>

                <span className="role-card__title">{r.title}</span>
                <span className="role-card__desc">{r.desc}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="signup-error">{error}</p>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-form__grid">
            <label className="signup-field">
              <span className="signup-field__label">Full Name</span>
              <input
                type="text"
                placeholder="Enter your full name"
                value={form.fullName}
                onChange={updateField("fullName")}
              />
            </label>

            <label className="signup-field">
              <span className="signup-field__label">Email Address</span>
              <input
                type="email"
                placeholder="Enter your email address"
                value={form.email}
                onChange={updateField("email")}
              />
            </label>

            <label className="signup-field">
              <span className="signup-field__label">Phone Number</span>
              <input
                type="tel"
                placeholder="Enter your phone number"
                value={form.phone}
                onChange={updateField("phone")}
              />
            </label>

            <label className="signup-field">
              <span className="signup-field__label">Password</span>
              <div className="signup-field__password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={form.password}
                  onChange={updateField("password")}
                />
                <button
                  type="button"
                  className="signup-field__toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <Eye size={20} color="#000000" />
                  ) : (
                    <EyeOff size={20} color="#000000" />
                  )}
                </button>
              </div>
            </label>
          </div>

          <label className="signup-field">
            <span className="signup-field__label">Confirm Password</span>
            <div className="signup-field__password">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={form.confirmPassword}
                onChange={updateField("confirmPassword")}
              />
              <button
                type="button"
                className="signup-field__toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? (
                  <Eye size={20} color="#000000" />
                ) : (
                  <EyeOff size={20} color="#000000" />
                )}
              </button>
            </div>
          </label>

          {/* Provider-only fields — shown only when "I Provide Services"
              is selected above. Customer flow is completely unaffected. */}
          {role === "provider" && (
            <div className="signup-form__provider-fields">
              <p className="signup-form__section-label">Professional Details</p>

              <div className="signup-form__grid">
                <label className="signup-field">
                  <span className="signup-field__label">Service Category</span>
                  <select
                    value={form.serviceCategory}
                    onChange={updateField("serviceCategory")}
                  >
                    <option value="">Select a category</option>
                    <option value="electric">Electric</option>
                    <option value="plumbing">Plumbing</option>
                    <option value="ac_repair">AC Repair</option>
                    <option value="carpentry">Carpentry</option>
                    <option value="painting">Painting</option>
                    <option value="cleaning">Cleaning</option>
                  </select>
                </label>

                <label className="signup-field">
                  <span className="signup-field__label">
                    Years of Experience
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5"
                    value={form.yearsOfExperience}
                    onChange={updateField("yearsOfExperience")}
                  />
                </label>

                <label className="signup-field">
                  <span className="signup-field__label">Work Area</span>
                  <input
                    type="text"
                    placeholder="e.g. Dhanmondi, Dhaka"
                    value={form.workArea}
                    onChange={updateField("workArea")}
                  />
                </label>

                <label className="signup-field">
                  <span className="signup-field__label">NID / ID Upload</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={updateFile("nidFile")}
                  />
                </label>
              </div>

              <p className="signup-form__note">
                Your application will be reviewed within 24-48 hours after
                signup.
              </p>
            </div>
          )}

          <label className="signup-terms">
            <input
              type="checkbox"
              checked={form.agreed}
              onChange={updateField("agreed")}
            />
            <span>
              I agree to <a href="/terms">Terms &amp; Conditions</a>
            </span>
          </label>

          <button
            type="submit"
            className="signup-submit"
            disabled={!form.agreed || submitting}
          >
            {submitting ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="signup-login-hint">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;

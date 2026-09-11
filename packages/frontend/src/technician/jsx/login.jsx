import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginTechnician } from "../api/auth";
import "../css/login.css";

/**
 * Technician Login (technician/jsx/login.jsx)
 * ----------------------------------------------
 * Deliberately simple, centered single-card layout — no split-screen /
 * orange illustration panel like the customer login page (client/jsx/login.jsx).
 *
 * Wired to POST /api/technician/login, which issues a JWT (not a Sanctum
 * token, not a session — see TechnicianAuthController::login on the
 * backend). The token + user are stored under "technician_token" /
 * "technician_user", completely separate from the customer's
 * "auth_token" / "auth_user" keys, so a customer session and a
 * technician session never collide in the same browser.
 */
function TechnicianLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await loginTechnician(form.identifier, form.password);

      localStorage.setItem("technician_token", data.token);
      localStorage.setItem("technician_user", JSON.stringify(data.user));

      // A provider whose NID/profile hasn't been approved yet shouldn't
      // land on the working dashboard — send them to a holding page
      // instead. (approval_status: "pending" | "approved" | "rejected")
      if (data.approval_status !== "approved") {
        navigate("/technician/application-under-review", { replace: true });
        return;
      }

      navigate("/technician/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="tech-login-page">
      <div className="tech-login-card">
        <div className="tech-login-card__logo">
          {/* LOGO ICON: to be added later */}
          <div className="logo-placeholder" aria-hidden="true" />
          <span>Dr.-Fix</span>
        </div>

        <h1>Welcome Back, Pro</h1>
        <p className="tech-login-card__subtext">
          Login to manage your jobs and earnings
        </p>

        {error && <p className="tech-login-card__error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="identifier">Email or Phone</label>
          <input
            id="identifier"
            type="text"
            placeholder="Enter your email or phone number"
            value={form.identifier}
            onChange={handleChange("identifier")}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange("password")}
              required
            />
            <button
              type="button"
              className="password-field__toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <a href="/forgot-password" className="tech-login-card__forgot">
            Forgot Password?
          </a>

          <button
            type="submit"
            className="tech-login-card__submit"
            disabled={submitting}
          >
            {submitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="tech-login-card__signup-hint">
          New here? <Link to="/signup?role=provider">Register as Provider</Link>
        </p>

        <div className="tech-login-card__divider" />

        <p className="tech-login-card__crosslink">
          Looking to book a service instead?{" "}
          <Link to="/login">Customer Login</Link>
        </p>
      </div>
    </div>
  );
}

export default TechnicianLogin;

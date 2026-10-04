import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginTechnician } from "../api/auth";
import "../css/login.css";

import loginImg from "../../assets/login1.png";

/**
 * Technician Login (technician/jsx/login.jsx)
 * ----------------------------------------------
 * Now mirrors the customer login page's 50/50 split-screen layout
 * (client/jsx/login.jsx + client/css/login.css) instead of the old
 * centered single-card style — left half is the form, right half is a
 * solid orange panel with a headline + illustration (src/assets/login1.png).
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
    <div className="login-page">
      {/* Left Side: Form */}
      <div className="login-page__left">
        <div className="login-form-wrap">
          <h1 className="login-heading">Welcome Back, Pro</h1>
          <p className="login-subtext">
            Login to manage your jobs and earnings
          </p>

          {error && <p className="login-error">{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="login-field">
              <span className="login-field__label">Email or Phone</span>
              <input
                type="text"
                placeholder="Enter your email or phone number"
                value={form.identifier}
                onChange={handleChange("identifier")}
                required
              />
            </label>

            <label className="login-field">
              <span className="login-field__label">Password</span>
              <div className="login-field__password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange("password")}
                  required
                />
                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye size={20} color="#000000" /> : <EyeOff size={20} color="#000000" />}
                </button>
              </div>
            </label>

            <a href="/forgot-password" className="login-forgot">
              Forgot Password?
            </a>

            <button
              type="submit"
              className="login-submit"
              disabled={submitting}
            >
              {submitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="login-signup-hint">
            New here?{" "}
            <Link to="/signup?role=provider">Register as Provider</Link>
          </p>

          <div className="login-divider" />

          <p className="login-crosslink">
            Looking to book a service instead?{" "}
            <Link to="/login">Customer Login</Link>
          </p>
        </div>
      </div>

      {/* Right Side: Orange Background + Illustration + Headline */}
      <div className="login-page__right">
        <img
          src={loginImg}
          alt="Technician illustration"
          className="login-hero-img"
        />
        <p className="login-page__right-tagline">
          Steady Work,
          <br />
          Fair Pay,
          <br />
          Every Day.
        </p>
      </div>
    </div>
  );
}

export default TechnicianLogin;

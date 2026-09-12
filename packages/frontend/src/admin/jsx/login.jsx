import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";

/**
 * Admin Login (admin/jsx/login.jsx)
 * -----------------------------------
 * Now wired to the real backend: POST /api/admin/login, session-based
 * (not a Bearer token) — that's why `credentials: "include"` is required
 * on every admin fetch call, so the browser sends/receives the session
 * cookie. See AdminAuthController::login on the backend.
 *
 * TODO: move the API base URL into an env variable (e.g.
 * import.meta.env.VITE_API_URL) instead of hardcoding localhost here.
 */

const API_BASE = "http://localhost:8000/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // sends/receives the Laravel session cookie
        body: JSON.stringify({
          email: form.identifier,
          password: form.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        setIsSubmitting(false);
        return;
      }

      navigate("/admin/dashboard");
    } catch (err) {
      setError("Could not reach the server. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-card__logo">
          <div className="logo-placeholder" aria-hidden="true" />
          <span>Dr.-Fix</span>
        </div>

        <div className="admin-login-card__divider" />

        <h1>Admin Login</h1>

        {error && <p className="admin-login-card__error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="identifier">Email or Username</label>
          <input
            id="identifier"
            name="identifier"
            type="text"
            placeholder="Enter email or username"
            value={form.identifier}
            onChange={handleChange}
            required
          />

          <label htmlFor="password">Password</label>
          <div className="password-field">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
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

          <button
            type="submit"
            className="admin-login-card__submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <a href="#" className="admin-login-card__forgot">
          Forgot Password? Contact Super Admin
        </a>

        <div className="admin-login-card__footer-divider" />

        <p className="admin-login-card__restricted">
          Restricted Access — Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}

export default AdminLogin;

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../client/context/AuthContext.jsx";
import { loginUser } from "../api/auth";
import "../css/login.css";

import heroImg from "../../assets/hero-image.png";
import { Eye, EyeOff } from "lucide-react";
function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const { data } = await loginUser(identifier, password);
      //localStorage.setItem("token", data.token);
      //localStorage.setItem("user", JSON.stringify(data.user));

      login(data.user, data.token);

      // replace: true removes /login from history so Back doesn't return here
      navigate("/client_dashboard", { replace: true });
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
          <h1 className="login-heading">Welcome Back</h1>
          <p className="login-subtext">Login to book trusted home experts</p>

          {error && <p className="login-error">{error}</p>}

          <form className="login-form" onSubmit={handleSubmit}>
            {/* ... inputs ... */}

            <label className="login-field">
              <span className="login-field__label">Email or Phone</span>

              <input
                type="text"
                placeholder="Enter your email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </label>

            <label className="login-field">
              <span className="login-field__label">Password</span>

              <div className="login-field__password">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <button
                  type="button"
                  className="login-field__toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
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
            New here? <Link to="/signup">Create Account</Link>
          </p>
        </div>
      </div>

      {/* Right Side: Orange Background + Hero Image */}
      <div className="login-page__right">
        <img src={heroImg} alt="Hero Illustration" className="login-hero-img" />
      </div>
    </div>
  );
}

export default Login;

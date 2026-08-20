import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Briefcase,
  Home,
} from "lucide-react";
import { login } from "../lib/auth";

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole =
    searchParams.get("role") === "provider" ? "provider" : "customer";

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: defaultRole,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      login({
        id: Date.now(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
      });
      navigate("/dashboard");
    } catch {
      setError("Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">

      <div className="mx-auto flex max-w-6xl items-center px-5 py-12 md:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-8 shadow-[0_25px_50px_-20px_rgba(15,37,70,0.35)]">
            <div className="text-center">
              <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight">
                Join Dr. Fix
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {formData.role === "provider"
                  ? "Start earning by offering your services."
                  : "Get trusted professionals at your doorstep."}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                  {error}
                </div>
              )}

              <div>
                <label className="field-label block text-xs uppercase text-[var(--color-muted)]">
                  I want to…
                </label>
                <div className="mt-1.5 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: "customer" })
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition-colors ${
                      formData.role === "customer"
                        ? "border-[var(--color-amber)] bg-[var(--color-amber-soft)] text-[var(--color-amber-dark)]"
                        : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-muted-2)]"
                    }`}
                  >
                    <Home size={18} />
                    <span className="text-sm font-medium">Customer</span>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, role: "provider" })
                    }
                    className={`flex items-center justify-center gap-2 rounded-xl border-2 p-3 transition-colors ${
                      formData.role === "provider"
                        ? "border-[var(--color-amber)] bg-[var(--color-amber-soft)] text-[var(--color-amber-dark)]"
                        : "border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-muted-2)]"
                    }`}
                  >
                    <Briefcase size={18} />
                    <span className="text-sm font-medium">Provider</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="field-label block text-xs uppercase text-[var(--color-muted)]">
                  Full name
                </label>
                <div className="relative mt-1.5">
                  <User
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    size={18}
                  />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input-field pl-11"
                    placeholder="Abdur Rahman Aiman"
                  />
                </div>
              </div>

              <div>
                <label className="field-label block text-xs uppercase text-[var(--color-muted)]">
                  Email address
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    size={18}
                  />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="input-field pl-11"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="field-label block text-xs uppercase text-[var(--color-muted)]">
                  Phone number
                </label>
                <div className="relative mt-1.5">
                  <Phone
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    size={18}
                  />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="input-field pl-11"
                    placeholder="+880 1XXX-XXXXXX"
                  />
                </div>
              </div>

              <div>
                <label className="field-label block text-xs uppercase text-[var(--color-muted)]">
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    size={18}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)] hover:text-[var(--color-ink)]"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="field-label block text-xs uppercase text-[var(--color-muted)]">
                  Confirm password
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    size={18}
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="input-field pl-11 pr-11"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)] hover:text-[var(--color-ink)]"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? "Creating account…" : "Create account"}
              </button>
            </form>

            <div className="my-6 h-px w-full bg-[var(--color-line)]" />

            <p className="text-center text-sm text-[var(--color-muted)]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

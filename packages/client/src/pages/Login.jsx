import { useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { login } from "../lib/auth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isProvider = searchParams.get("role") === "provider";

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      login({
        id: 1,
        name: "John Doe",
        email: formData.email,
        role: isProvider ? "provider" : "customer",
      });
      navigate(from, { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-paper)]">

      <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center px-5 py-12 md:px-8">
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-card)] p-8 shadow-[0_25px_50px_-20px_rgba(15,37,70,0.35)]">
            <div className="text-center">
              <h1 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight">
                Welcome back
              </h1>
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                Sign in to your Dr. Fix account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {error && (
                <div className="rounded-xl border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="field-label block text-xs uppercase text-[var(--color-muted)]"
                >
                  Email address
                </label>
                <div className="relative mt-1.5">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    size={18}
                  />
                  <input
                    id="email"
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
                <label
                  htmlFor="password"
                  className="field-label block text-xs uppercase text-[var(--color-muted)]"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted-2)]"
                    size={18}
                  />
                  <input
                    id="password"
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

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-[var(--color-ink-soft)]">
                  <input
                    type="checkbox"
                    checked={formData.remember}
                    onChange={(e) =>
                      setFormData({ ...formData, remember: e.target.checked })
                    }
                    className="rounded border-[var(--color-line)] text-[var(--color-amber)] focus:ring-[var(--color-amber)]"
                  />
                  Remember me
                </label>
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-base"
              >
                {loading ? "Signing in…" : "Sign in"}
              </button>
            </form>

            <div className="my-6 h-px w-full bg-[var(--color-line)]" />

            <p className="text-center text-sm text-[var(--color-muted)]">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="font-semibold text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]"
              >
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}

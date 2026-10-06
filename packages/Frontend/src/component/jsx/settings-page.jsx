import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  AlertTriangle,
  UserRound,
  Briefcase,
} from "lucide-react";
import Header from "./header.jsx";
import "../css/settings-page.css";

/**
 * SettingsPage (component/jsx/settings-page.jsx)
 * ----------------------------------------------
 * ONE settings page for both roles. The thin wrappers
 * (client/jsx/settings.jsx and technician/jsx/settings.jsx) decide:
 *
 *   - which page/main CSS classes to wear, so the width and height match
 *     every other page of that role (profile-page / tech-page ...)
 *   - which API functions to call
 *   - which extra card goes next to "Password & security"
 *     (customer: email notifications, technician: job preferences)
 *   - how to sign out
 */

const errorMessage = (err, fallback) =>
  Object.values(err?.response?.data?.errors || {})[0]?.[0] ||
  err?.response?.data?.message ||
  fallback;

/* ------------------------------------------------------------------ */
/* Small shared pieces                                                 */
/* ------------------------------------------------------------------ */

export function ToggleSwitch({ checked, onChange, disabled = false, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`st-switch ${checked ? "is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="st-switch__thumb" />
    </button>
  );
}

function PasswordField({ label, value, onChange, autoComplete, hint }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="st-field">
      <span className="st-field__label">{label}</span>
      <span className="st-field__control">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="st-field__eye"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {hint && <span className="st-field__hint">{hint}</span>}
    </label>
  );
}

/* ------------------------------------------------------------------ */
/* Side cards (the wrapper chooses which one to pass in)               */
/* ------------------------------------------------------------------ */

/** Customer: booking-update emails on/off. Saves instantly. */
export function NotificationsCard({ settings, onSave }) {
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  const handleChange = async (next) => {
    setNote("");
    setSaving(true);
    try {
      await onSave(next);
      setNote("Saved");
    } catch (err) {
      setNote(errorMessage(err, "Couldn't save. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="st-card">
      <header className="st-card__head">
        <div>
          <p className="st-eyebrow">NOTIFICATIONS</p>
          <h2>Email notifications</h2>
        </div>
        <Mail size={20} />
      </header>

      <div className="st-row">
        <div className="st-row__text">
          <strong>Booking updates</strong>
          <p>
            Get an email when a technician accepts your booking and when your
            service is completed.
          </p>
        </div>
        <ToggleSwitch
          label="Booking update emails"
          checked={Boolean(settings.email_notifications)}
          disabled={saving}
          onChange={handleChange}
        />
      </div>

      {note && (
        <p className="st-note" role="status">
          {note}
        </p>
      )}
    </section>
  );
}

/** Technician: availability switch + read-only work details. */
export function JobPreferencesCard({ settings, onToggleAvailability }) {
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");

  const handleChange = async (next) => {
    setNote("");
    setSaving(true);
    try {
      await onToggleAvailability(next);
      setNote("Saved");
    } catch (err) {
      setNote(errorMessage(err, "Couldn't update availability."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="st-card">
      <header className="st-card__head">
        <div>
          <p className="st-eyebrow">JOB PREFERENCES</p>
          <h2>Availability</h2>
        </div>
        <Briefcase size={20} />
      </header>

      <div className="st-row">
        <div className="st-row__text">
          <strong>Available for new jobs</strong>
          <p>
            {settings.is_available
              ? "You are receiving matching job requests."
              : "You won't be shown new job requests."}
          </p>
        </div>
        <ToggleSwitch
          label="Available for new jobs"
          checked={Boolean(settings.is_available)}
          disabled={saving}
          onChange={handleChange}
        />
      </div>

      <dl className="st-facts">
        <div>
          <dt>Service category</dt>
          <dd>{settings.service_category || "-"}</dd>
        </div>
        <div>
          <dt>Work area</dt>
          <dd>{settings.work_area || "-"}</dd>
        </div>
      </dl>
      <p className="st-hint">
        Category and area are checked during approval, so they can only be
        changed by the Dr.-Fix team.
      </p>

      {note && (
        <p className="st-note" role="status">
          {note}
        </p>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The page                                                            */
/* ------------------------------------------------------------------ */

function SettingsPage({
  headerVariant,
  pageClass,
  mainClass,
  eyebrowClass = "",
  profilePath,
  displayName,
  displayEmail,
  api,
  onSignOut,
  renderSideCard,
}) {
  const [settings, setSettings] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMessage, setPwMessage] = useState({ type: "", text: "" });

  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [deactivatePassword, setDeactivatePassword] = useState("");
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");

  useEffect(() => {
    api
      .load()
      .then(({ data }) => setSettings(data))
      .catch((err) =>
        setLoadError(errorMessage(err, "Couldn't load your settings.")),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchSettings = (changes) =>
    setSettings((prev) => ({ ...prev, ...changes }));

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPwMessage({ type: "", text: "" });

    if (!pw.current || !pw.next || !pw.confirm) {
      setPwMessage({ type: "error", text: "Please fill in all three fields." });
      return;
    }
    if (pw.next.length < 8) {
      setPwMessage({
        type: "error",
        text: "Your new password must be at least 8 characters.",
      });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMessage({
        type: "error",
        text: "The new password and its confirmation don't match.",
      });
      return;
    }

    setPwSaving(true);
    try {
      await api.changePassword({
        current_password: pw.current,
        password: pw.next,
        password_confirmation: pw.confirm,
      });
      setPw({ current: "", next: "", confirm: "" });
      setPwMessage({ type: "success", text: "Password updated." });
    } catch (err) {
      setPwMessage({
        type: "error",
        text: errorMessage(err, "Couldn't update your password."),
      });
    } finally {
      setPwSaving(false);
    }
  };

  const handleDeactivate = async (event) => {
    event.preventDefault();
    setDeactivateError("");

    if (!deactivatePassword) {
      setDeactivateError("Enter your password to continue.");
      return;
    }

    setDeactivating(true);
    try {
      await api.deactivate({ password: deactivatePassword });
      onSignOut();
    } catch (err) {
      setDeactivateError(
        errorMessage(err, "Couldn't deactivate your account."),
      );
      setDeactivating(false);
    }
  };

  const initial = displayName?.trim()?.charAt(0)?.toUpperCase() || "?";

  const memberSince = settings?.member_since
    ? new Date(settings.member_since).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "-";

  const accountType =
    settings?.account_type === "technician" ? "Technician" : "Customer";

  return (
    <div className={pageClass}>
      <Header variant={headerVariant} />

      <main className={mainClass}>
        <div className="st-page">
          <div className="st-title">
            <p className={`st-eyebrow ${eyebrowClass}`}>ACCOUNT</p>
            <h1>Settings</h1>
            <p>Manage your password, notifications and account.</p>
          </div>

          <section className="st-card st-identity">
            <span className="st-identity__avatar" aria-hidden="true">
              {initial}
            </span>
            <div className="st-identity__text">
              <strong>{displayName || "Your account"}</strong>
              <span>{displayEmail}</span>
            </div>
            <Link to={profilePath} className="st-btn st-btn--ghost">
              <UserRound size={16} />
              Edit profile
            </Link>
          </section>

          {loadError && (
            <div className="st-msg st-msg--error" role="alert">
              {loadError}
            </div>
          )}

          {!settings && !loadError && (
            <div className="st-card st-loading">Loading your settings...</div>
          )}

          {settings && (
            <>
              <div className="st-grid">
                <section className="st-card">
                  <header className="st-card__head">
                    <div>
                      <p className="st-eyebrow">SECURITY</p>
                      <h2>Password &amp; security</h2>
                    </div>
                    <ShieldCheck size={20} />
                  </header>

                  <form className="st-form" onSubmit={handlePasswordSubmit}>
                    <PasswordField
                      label="Current password"
                      value={pw.current}
                      autoComplete="current-password"
                      onChange={(value) => setPw((p) => ({ ...p, current: value }))}
                    />
                    <PasswordField
                      label="New password"
                      value={pw.next}
                      autoComplete="new-password"
                      hint="At least 8 characters."
                      onChange={(value) => setPw((p) => ({ ...p, next: value }))}
                    />
                    <PasswordField
                      label="Confirm new password"
                      value={pw.confirm}
                      autoComplete="new-password"
                      onChange={(value) => setPw((p) => ({ ...p, confirm: value }))}
                    />

                    {pwMessage.text && (
                      <p
                        className={`st-msg st-msg--${pwMessage.type}`}
                        role={pwMessage.type === "error" ? "alert" : "status"}
                      >
                        {pwMessage.type === "success" && <Check size={16} />}
                        {pwMessage.text}
                      </p>
                    )}

                    <div>
                      <button
                        type="submit"
                        className="st-btn st-btn--primary"
                        disabled={pwSaving}
                      >
                        <Lock size={16} />
                        {pwSaving ? "Updating..." : "Update password"}
                      </button>
                    </div>
                  </form>
                </section>

                {renderSideCard?.(settings, patchSettings)}
              </div>

              <section className="st-card">
                <header className="st-card__head">
                  <div>
                    <p className="st-eyebrow">ACCOUNT</p>
                    <h2>Account</h2>
                  </div>
                </header>

                <div className="st-account">
                  <dl className="st-facts st-facts--stacked">
                    <div>
                      <dt>Account type</dt>
                      <dd>{accountType}</dd>
                    </div>
                    <div>
                      <dt>Member since</dt>
                      <dd>{memberSince}</dd>
                    </div>
                    {settings.approval_status && (
                      <div>
                        <dt>Approval status</dt>
                        <dd className="st-status">
                          {settings.approval_status.charAt(0).toUpperCase() +
                            settings.approval_status.slice(1)}
                        </dd>
                      </div>
                    )}
                  </dl>

                  <button
                    type="button"
                    className="st-btn st-btn--ghost"
                    onClick={onSignOut}
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>

                <div className="st-danger">
                  <div className="st-danger__head">
                    <div>
                      <strong>
                        <AlertTriangle size={16} />
                        Deactivate account
                      </strong>
                      <p>
                        Your profile is switched off and you will be logged out.
                        Your booking history is kept.
                      </p>
                    </div>
                    {!deactivateOpen && (
                      <button
                        type="button"
                        className="st-btn st-btn--danger-outline"
                        onClick={() => setDeactivateOpen(true)}
                      >
                        Deactivate account
                      </button>
                    )}
                  </div>

                  {deactivateOpen && (
                    <form className="st-danger__form" onSubmit={handleDeactivate}>
                      <PasswordField
                        label="Enter your password to confirm"
                        value={deactivatePassword}
                        autoComplete="current-password"
                        onChange={setDeactivatePassword}
                      />

                      {deactivateError && (
                        <p className="st-msg st-msg--error" role="alert">
                          {deactivateError}
                        </p>
                      )}

                      <div className="st-danger__actions">
                        <button
                          type="submit"
                          className="st-btn st-btn--danger"
                          disabled={deactivating}
                        >
                          {deactivating ? "Deactivating..." : "Yes, deactivate"}
                        </button>
                        <button
                          type="button"
                          className="st-btn st-btn--ghost"
                          disabled={deactivating}
                          onClick={() => {
                            setDeactivateOpen(false);
                            setDeactivatePassword("");
                            setDeactivateError("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default SettingsPage;

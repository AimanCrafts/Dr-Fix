import { useEffect, useState } from "react";
import Header from "../../component/jsx/header.jsx";
import { getCurrentUser, updateProfile } from "../api/auth";
import "../css/signup.css";
import "../css/profile.css";

/**
 * Profile (client/jsx/profile.jsx)
 * ---------------------------------
 * Shows the same fields collected at signup (Full Name, Email, Phone)
 * so the customer can review/update them later. Loads the current user
 * via GET /me, saves via PUT /profile (see AuthController::updateProfile).
 *
 * Password change is intentionally not included here — that needs a
 * separate "current password" check and is a distinct feature.
 */
function Profile() {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(({ data }) => {
        setForm({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
        });
      })
      .catch(() => setError("Couldn't load your profile. Please try again."))
      .finally(() => setLoading(false));
  }, []);

  const updateField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved(false);
    setSaving(true);
    try {
      await updateProfile(form);
      setSaved(true);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        Object.values(err.response?.data?.errors || {})[0]?.[0] ||
        "Couldn't save your changes. Please try again.";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <Header variant="app" />

      <div className="signup-wrap profile-wrap">
        <h1 className="signup-heading">My Profile</h1>
        <p className="signup-subtext">
          Keep your contact details up to date.
        </p>

        {error && <p className="signup-error">{error}</p>}
        {saved && <p className="profile-success">Profile updated.</p>}

        {loading ? (
          <p className="empty-text">Loading...</p>
        ) : (
          <form className="signup-form" onSubmit={handleSubmit}>
            <div className="signup-form__grid">
              <label className="signup-field">
                <span className="signup-field__label">Full Name</span>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={updateField("name")}
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
            </div>

            <button type="submit" className="signup-submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;

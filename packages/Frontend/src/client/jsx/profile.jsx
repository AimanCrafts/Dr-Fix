import { useEffect, useState } from "react";
import { Check, Mail, Phone, UserRound } from "lucide-react";
import Header from "../../component/jsx/header.jsx";
import { getCurrentUser, updateProfile } from "../api/auth";
import "../css/profile.css";

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

  const updateField = (field) => (event) => {
    setSaved(false);
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
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

  const initial = form.name?.trim()?.charAt(0)?.toUpperCase() || "U";

  return (
    <div className="profile-page">
      <Header variant="app" />

      <main className="profile-container">
        <section className="profile-hero">
          <div className="profile-avatar" aria-hidden="true">
            {initial}
          </div>
          <div>
            <p className="profile-eyebrow">ACCOUNT</p>
            <h1>My Profile</h1>
            <p>Manage your personal information and contact details.</p>
          </div>
        </section>

        {error && (
          <div className="profile-message profile-message--error">{error}</div>
        )}
        {saved && (
          <div className="profile-message profile-message--success">
            <Check size={17} />
            Profile updated successfully.
          </div>
        )}

        {loading ? (
          <div className="profile-card profile-loading">
            Loading your profile...
          </div>
        ) : (
          <div className="profile-layout">
            <aside className="profile-card profile-summary">
              <p className="profile-card__eyebrow">YOUR DETAILS</p>
              <h2>{form.name || "Your Name"}</h2>
              <div className="profile-summary__item">
                <Mail size={16} />
                <span>{form.email || "No email added"}</span>
              </div>
              <div className="profile-summary__item">
                <Phone size={16} />
                <span>{form.phone || "No phone added"}</span>
              </div>
            </aside>

            <section className="profile-card">
              <div className="profile-card__header">
                <div>
                  <p className="profile-card__eyebrow">PERSONAL INFORMATION</p>
                  <h2>Edit Profile</h2>
                </div>
                <UserRound size={20} />
              </div>

              <form className="profile-form" onSubmit={handleSubmit}>
                <label className="profile-field">
                  <span>Full Name</span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={updateField("name")}
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </label>

                <label className="profile-field">
                  <span>Email Address</span>
                  <input
                    type="email"
                    value={form.email}
                    onChange={updateField("email")}
                    placeholder="Enter your email address"
                    autoComplete="email"
                  />
                </label>

                <label className="profile-field">
                  <span>Phone Number</span>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={updateField("phone")}
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                  />
                </label>

                <div className="profile-form__footer">
                  <p>
                    Your email and phone number are used for booking
                    communication.
                  </p>
                  <button
                    type="submit"
                    className="profile-save-btn"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Profile;

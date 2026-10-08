import { useEffect, useState } from "react";
import Header from "../../component/jsx/header.jsx";
import {
  getTechnicianProfile,
  updateTechnicianProfile,
} from "../api/technician-profile-api";
import { updateTechnicianAvailability } from "../api/technician-dashboard-api";
import "../css/profile.css";

function Profile() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    service_category: "",
    years_of_experience: 0,
    work_area: "",
    is_available: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    getTechnicianProfile()
      .then(({ data }) => setForm(data))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load profile."),
      )
      .finally(() => setLoading(false));
  }, []);
  const change = (key) => (e) =>
    setForm((v) => ({ ...v, [key]: e.target.value }));
  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const { data } = await updateTechnicianProfile({
        ...form,
        years_of_experience: Number(form.years_of_experience),
      });
      setForm((v) => ({ ...v, ...data }));
      localStorage.setItem("technician_user", JSON.stringify(data));
      setMessage("Profile updated successfully.");
    } catch (e) {
      setError(e.response?.data?.message || "Could not update profile.");
    } finally {
      setSaving(false);
    }
  };
  const availability = async () => {
    const next = !form.is_available;
    setForm((v) => ({ ...v, is_available: next }));
    try {
      await updateTechnicianAvailability(next);
    } catch (e) {
      setForm((v) => ({ ...v, is_available: !next }));
      setError(e.response?.data?.message || "Could not update availability.");
    }
  };
  if (loading)
    return (
      <div className="tech-page">
        <Header variant="technician" />
        <main className="tech-page__main">
          <div className="tech-empty">
            <p>Loading profile...</p>
          </div>
        </main>
      </div>
    );
  return (
    <div className="tech-page">
      <Header variant="technician" />
      <main className="tech-page__main">
        <h1>Profile</h1>
        <p className="profile-intro">
          Keep your professional information up to date for customers and job
          matching.
        </p>
        {message && <div className="profile-success">{message}</div>}
        {error && <div className="tech-message">{error}</div>}
        <form className="profile-card" onSubmit={save}>
          <div className="profile-avatar">
            {form.name?.charAt(0)?.toUpperCase() || "T"}
          </div>
          <div className="profile-grid">
            <label>
              Full name
              <input
                value={form.name || ""}
                onChange={change("name")}
                required
              />
            </label>
            <label>
              Email
              <input value={form.email || ""} readOnly />
            </label>
            <label>
              Phone
              <input value={form.phone || ""} onChange={change("phone")} />
            </label>
            <label>
              Service category
              <input
                value={form.service_category || ""}
                onChange={change("service_category")}
                required
              />
            </label>
            <label>
              Years of experience
              <input
                type="number"
                min="0"
                max="60"
                value={form.years_of_experience || 0}
                onChange={change("years_of_experience")}
                required
              />
            </label>
            <label>
              Work area
              <input
                value={form.work_area || ""}
                onChange={change("work_area")}
                required
              />
            </label>
          </div>
          <div className="profile-bottom">
            <div>
              <strong>Availability</strong>
              <p>
                {form.is_available
                  ? "You are receiving matching job requests."
                  : "You are offline and won't receive new requests."}
              </p>
            </div>
            <button
              type="button"
              className={`profile-toggle ${form.is_available ? "is-on" : ""}`}
              onClick={availability}
            >
              {form.is_available ? "Online" : "Offline"}
            </button>
          </div>
          <button className="profile-save" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </button>
        </form>
      </main>
    </div>
  );
}
export default Profile;

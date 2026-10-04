import { useEffect, useState } from "react";
import Header from "../../component/jsx/header.jsx";
import {
  listAddresses,
  createAddress,
  makeAddressDefault,
  deleteAddress,
} from "../api/addresses";
import "../css/addresses.css";

function Addresses() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [label, setLabel] = useState("");
  const [detail, setDetail] = useState("");

  const loadAddresses = async () => {
    try {
      setLoading(true);
      setError("");

      const { data } = await listAddresses();

      setAddresses(
        Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [],
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not load your addresses.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!label.trim() || !detail.trim()) {
      setError("Please enter both label and address.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await createAddress({
        label: label.trim(),
        detail: detail.trim(),
      });

      setLabel("");
      setDetail("");

      await loadAddresses();
    } catch (error) {
      setError(error.response?.data?.message || "Could not save the address.");
    } finally {
      setSaving(false);
    }
  };

  const handleDefault = async (id) => {
    try {
      setError("");

      await makeAddressDefault(id);

      await loadAddresses();
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not set the default address.",
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this address?")) {
      return;
    }

    try {
      setError("");

      await deleteAddress(id);

      await loadAddresses();
    } catch (error) {
      setError(
        error.response?.data?.message || "Could not delete the address.",
      );
    }
  };

  return (
    <div className="addresses-page">
      <Header variant="client" />

      <main className="addresses-main">
        <div className="addresses-heading">
          <p className="addresses-eyebrow">Account</p>

          <h1>My Addresses</h1>

          <p>Manage the addresses you use for your service bookings.</p>
        </div>

        {error && <div className="addresses-error">{error}</div>}

        <section className="addresses-card">
          <h2>Add New Address</h2>

          <form className="addresses-form" onSubmit={handleSubmit}>
            <div className="addresses-form__field">
              <label htmlFor="address-label">Label</label>

              <input
                id="address-label"
                type="text"
                placeholder="Home"
                value={label}
                onChange={(event) => setLabel(event.target.value)}
              />
            </div>

            <div className="addresses-form__field">
              <label htmlFor="address-detail">Address</label>

              <textarea
                id="address-detail"
                rows="4"
                placeholder="Enter your full address"
                value={detail}
                onChange={(event) => setDetail(event.target.value)}
              />
            </div>

            <button
              type="submit"
              className="addresses-submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Address"}
            </button>
          </form>
        </section>

        <section className="addresses-list">
          <div className="addresses-list__heading">
            <h2>Saved Addresses</h2>
          </div>

          {loading ? (
            <div className="addresses-empty">Loading addresses...</div>
          ) : addresses.length === 0 ? (
            <div className="addresses-empty">
              You don't have any saved addresses yet.
            </div>
          ) : (
            addresses.map((address) => (
              <article
                className={`address-item ${
                  address.is_default ? "address-item--default" : ""
                }`}
                key={address.id}
              >
                <div className="address-item__content">
                  <div className="address-item__top">
                    <h3>{address.label || "Address"}</h3>

                    {address.is_default && (
                      <span className="address-default">Default</span>
                    )}
                  </div>

                  <p>{address.detail}</p>
                </div>

                <div className="address-item__actions">
                  {!address.is_default && (
                    <button
                      type="button"
                      onClick={() => handleDefault(address.id)}
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    type="button"
                    className="address-delete"
                    onClick={() => handleDelete(address.id)}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Addresses;

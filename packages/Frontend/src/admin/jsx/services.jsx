import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import {
  listAdminServices,
  updateService,
  updateCommission,
} from "../api/services";
import "../css/dashboard.css";
import "../css/approvals.css";
import "../css/services.css";

/**
 * Services & Prices (admin/jsx/services.jsx)
 * ------------------------------------------
 * Admins can change a service's price, hide/show it, and set the platform
 * commission. They cannot add or rename services (icons and category cards
 * live in the frontend code). Price changes apply to NEW bookings only;
 * existing bookings keep the price they were made at.
 */

const CATEGORY_LABELS = {
  electric: "Electric",
  plumbing: "Plumbing",
  ac_repair: "AC Repair",
  carpentry: "Carpentry",
  painting: "Painting",
  cleaning: "Cleaning",
};

function ServiceRow({ service, onSaved }) {
  const [price, setPrice] = useState(String(service.price));
  const [active, setActive] = useState(Boolean(service.is_active));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState({ type: "", text: "" });

  const priceNumber = Number(price);
  const priceValid =
    Number.isInteger(priceNumber) && priceNumber >= 1 && priceNumber <= 100000;
  const changed =
    priceNumber !== service.price || active !== Boolean(service.is_active);

  const save = async () => {
    setBusy(true);
    setNote({ type: "", text: "" });
    try {
      const updated = await updateService(service.id, {
        price: priceNumber,
        is_active: active,
      });
      onSaved(updated);
      setNote({ type: "ok", text: "Saved" });
    } catch (err) {
      setNote({ type: "error", text: err.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`svc-row ${active ? "" : "is-hidden"}`}>
      <span className="svc-row__name">{service.name}</span>

      <label className="svc-row__price">
        <span>৳</span>
        <input
          type="number"
          min="1"
          max="100000"
          step="1"
          value={price}
          onChange={(e) => {
            setPrice(e.target.value);
            setNote({ type: "", text: "" });
          }}
          aria-label={`Price of ${service.name}`}
        />
      </label>

      <label className="svc-row__toggle">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => setActive(e.target.checked)}
        />
        <span>{active ? "Visible" : "Hidden"}</span>
      </label>

      <div className="svc-row__actions">
        <button
          type="button"
          className="btn-approve"
          disabled={!changed || !priceValid || busy}
          onClick={save}
        >
          {busy ? "..." : "Save"}
        </button>
        {note.text && (
          <span className={`svc-note svc-note--${note.type}`}>{note.text}</span>
        )}
      </div>
    </div>
  );
}

function ServicesPage() {
  const [services, setServices] = useState([]);
  const [rate, setRate] = useState("");
  const [savedRate, setSavedRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rateBusy, setRateBusy] = useState(false);
  const [rateNote, setRateNote] = useState({ type: "", text: "" });

  useEffect(() => {
    listAdminServices()
      .then((data) => {
        setServices(data.services);
        setRate(String(data.commission_rate));
        setSavedRate(data.commission_rate);
      })
      .catch((err) => setError(err.message || "Couldn't load services."))
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (updated) =>
    setServices((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );

  const rateNumber = Number(rate);
  const rateValid =
    rate !== "" && Number.isFinite(rateNumber) && rateNumber >= 0 && rateNumber <= 50;

  const saveRate = async () => {
    setRateBusy(true);
    setRateNote({ type: "", text: "" });
    try {
      const data = await updateCommission(rateNumber);
      setSavedRate(data.commission_rate);
      setRate(String(data.commission_rate));
      setRateNote({
        type: "ok",
        text: "Saved. Technicians were notified. Jobs already accepted keep their old rate.",
      });
    } catch (err) {
      setRateNote({ type: "error", text: err.message });
    } finally {
      setRateBusy(false);
    }
  };

  const grouped = Object.keys(CATEGORY_LABELS)
    .map((key) => ({
      key,
      label: CATEGORY_LABELS[key],
      items: services.filter((item) => item.category === key),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div className="admin-dashboard">
      <Sidebar />

      <main className="admin-main">
        <div className="approvals-header">
          <h1>Services &amp; Prices</h1>
          <p>
            Change prices, hide a service, or set the platform fee. New prices
            apply to new bookings only.
          </p>
        </div>

        {error && <p className="approvals-error">{error}</p>}

        {loading ? (
          <p className="approvals-empty">Loading...</p>
        ) : (
          <>
            <section className="card svc-commission">
              <div>
                <h2>Platform fee (commission)</h2>
                <p>
                  Percentage kept from each completed job. Customers always pay
                  the listed price; the fee is taken from the technician&apos;s
                  earning.
                </p>
              </div>

              <div className="svc-commission__control">
                <label className="svc-row__price">
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={rate}
                    onChange={(e) => {
                      setRate(e.target.value);
                      setRateNote({ type: "", text: "" });
                    }}
                    aria-label="Commission percentage"
                  />
                  <span>%</span>
                </label>
                <button
                  type="button"
                  className="btn-approve"
                  disabled={!rateValid || rateNumber === savedRate || rateBusy}
                  onClick={saveRate}
                >
                  {rateBusy ? "..." : "Save"}
                </button>
              </div>

              {rateNote.text && (
                <p className={`svc-note svc-note--${rateNote.type}`}>
                  {rateNote.text}
                </p>
              )}
            </section>

            {grouped.map((group) => (
              <section className="card svc-group" key={group.key}>
                <h2>{group.label}</h2>
                <div className="svc-head">
                  <span>Service</span>
                  <span>Price</span>
                  <span>Shown to customers</span>
                  <span />
                </div>
                {group.items.map((item) => (
                  <ServiceRow
                    key={item.id}
                    service={item}
                    onSaved={handleSaved}
                  />
                ))}
              </section>
            ))}
          </>
        )}
      </main>
    </div>
  );
}

export default ServicesPage;

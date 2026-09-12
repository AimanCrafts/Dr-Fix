import { useEffect, useState } from "react";
import "../../component/css/ad_popup.css";



const STORAGE_KEY = "df_ad_last_shown";
const SHOW_DELAY_MS = 800;


const MOCK_AD = {
  imageAlt: "Dr.-Fix promotional offer",
  headline: "Get 20% Off Your First Booking",
  ctaLabel: "Book Now",
  ctaLink: "/services",
};

function getTodayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

function AdPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem(STORAGE_KEY);
    const today = getTodayString();

    if (lastShown === today) {
      return; // already shown today, don't show again
    }

    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const handleEscape = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, getTodayString());
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="ad-popup-backdrop" onClick={handleClose}>
      <div className="ad-popup-card" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="ad-popup-close"
          onClick={handleClose}
          aria-label="Close ad"
        >
          ✕
        </button>

        {/* IMAGE: admin-uploaded promotional image — to be added later */}
        <div className="ad-popup-image image-placeholder" aria-hidden="true">
          <span>Ad image</span>
        </div>

        <div className="ad-popup-content">
          <h3>{MOCK_AD.headline}</h3>
          <a href={MOCK_AD.ctaLink} className="ad-popup-cta">
            {MOCK_AD.ctaLabel}
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdPopup;

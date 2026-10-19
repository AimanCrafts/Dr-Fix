import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import adImage from "../../assets/ads/home-offer.jpg";
import "../../component/css/ad_popup.css";

/**
 * AdPopup (component/jsx/ad_popup.jsx)
 * -------------------------------------
 * Full-image promotional card shown on the home page. It appears every time
 * the home page is opened. The whole card is the image (headline and button
 * are part of the picture); the X, the Esc key or a click outside closes it,
 * and a click on the image goes to the services page.
 *
 * To change the ad, replace src/assets/ads/home-offer.jpg (keep the name).
 * Recommended size: 1080 x 1350 px (4:5), JPG or WebP, under 300 KB.
 */

const SHOW_DELAY_MS = 600;
const AD_LINK = "/services";
const AD_ALT = "Dr.-Fix: your home's doctor. Book a fix now.";

function AdPopup() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isVisible) return undefined;

    const handleEscape = (e) => {
      if (e.key === "Escape") setIsVisible(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isVisible]);

  const handleClose = () => setIsVisible(false);

  if (!isVisible) return null;

  return (
    <div className="ad-popup-backdrop" onClick={handleClose}>
      <div
        className="ad-popup-card"
        role="dialog"
        aria-label="Dr.-Fix promotion"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="ad-popup-close"
          onClick={handleClose}
          aria-label="Close ad"
        >
          ✕
        </button>

        <Link to={AD_LINK} onClick={handleClose} className="ad-popup-link">
          <img src={adImage} alt={AD_ALT} className="ad-popup-image" />
        </Link>
      </div>
    </div>
  );
}

export default AdPopup;

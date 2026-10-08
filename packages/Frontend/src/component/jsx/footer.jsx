import React from "react";
import { Link } from "react-router-dom";
import "../css/footer.css";
import logo from "../../assets/logo.png";
import facebook from "../../assets/icons/facebook.png";
import instagram from "../../assets/icons/instagram.png";
import x from "../../assets/icons/x.png";
import youtube from "../../assets/icons/youtube.png";

function Footer({ size = "full" }) {
  const year = new Date().getFullYear();

  if (size === "thin") {
    return (
      <footer className="site-footer site-footer--thin">
        <p>© {year} Dr.-Fix. All rights reserved.</p>
      </footer>
    );
  }

  const linkColumns = [
    {
      title: "Quick Links",
      links: [
        ["Home", "/"],
        ["Services", "/services"],
        ["How It Works", "/how-it-works"],
        ["About Us", "/about"],
        ["Contact Us", "/contact"],
      ],
    },
    {
      title: "Company",
      links: [
        ["About Dr.-Fix", "/about-dr-fix"],
        ["Technician Login", "/technician/login"],
        ["Terms of Service", "/terms"],
        ["Privacy Policy", "/privacy"],
      ],
    },
    {
      title: "Customer",
      links: [
        ["My Bookings", "/my-bookings"],
        ["Account Settings", "/settings"],
        ["FAQ", "/faq"],
      ],
    },
  ];

  const socials = [
    ["Facebook", facebook, "https://www.facebook.com/drfix.bd"],
    ["Instagram", instagram, "https://www.instagram.com/drfix.bd"],
    ["X", x, "https://x.com/drfix_bd"],
    ["YouTube", youtube, "https://www.youtube.com/@DrFixBD"],
  ];

  return (
    <footer className="site-footer site-footer--full">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <div className="site-footer__logo-row">
            <img
              src={logo}
              alt="Dr.-Fix logo"
              className="site-footer__logo-image"
            />
            <span className="site-footer__wordmark">Dr.-Fix</span>
          </div>
          <p className="site-footer__tagline">
            Your home&apos;s doctor. We diagnose. We fix. You relax.
          </p>
          <div className="site-footer__socials">
            {socials.map(([label, icon, href]) => (
              <a
                key={label}
                href={href}
                className="social-icon"
                aria-label={label}
                target="_blank"
                rel="noreferrer"
              >
                <img src={icon} alt="" className="social-icon__image" />
              </a>
            ))}
          </div>
        </div>

        {linkColumns.map((column) => (
          <div className="site-footer__col" key={column.title}>
            <h4>{column.title}</h4>
            <ul>
              {column.links.map(([label, to]) => (
                <li key={label}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="site-footer__emergency">
          <p>Need urgent help?</p>
          <a href="tel:0961234567" className="btn btn--outline-footer">
            📞 Call Now
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {year} Dr.-Fix. All rights reserved.</p>
        <div className="site-footer__bottom-links">
          <Link to="/terms">Terms &amp; Conditions</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

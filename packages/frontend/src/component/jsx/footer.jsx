import React from "react";
import "../css/footer.css";


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
      links: ["Home", "Services", "How It Works", "About Us", "Contact Us"],
    },
    {
      title: "Company",
      links: [
        "About Dr.-Fix",
        "Careers",
        "Become a Partner",
        "Technician Login",
      ],
    },
    {
      title: "Customer",
      links: ["Help Center", "My Bookings", "Pricing", "Service Areas", "FAQ"],
    },
  ];

  return (
    <footer className="site-footer site-footer--full">
      <div className="site-footer__top">
        <div className="site-footer__brand">
          <div className="site-footer__logo-row">
            <div
              className="logo-placeholder logo-placeholder--footer"
              aria-hidden="true"
            >
              {/* LOGO ICON: to be added later */}
            </div>
            <span className="site-footer__wordmark">Dr.-Fix</span>
          </div>
          <p className="site-footer__tagline">
            Your home&apos;s doctor. We diagnose. We fix. You relax.
          </p>
          <div className="site-footer__socials">
            {["FB", "IG", "X", "YT"].map((label) => (
              <a
                key={label}
                href="#"
                className="social-icon"
                aria-label={label}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        {linkColumns.map((col) => (
          <div key={col.title} className="site-footer__col">
            <h4>{col.title}</h4>
            <ul>
              {col.links.map((link) => (
                <li key={link}>
                  <a href="#">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="site-footer__col site-footer__emergency">
          <h4>Emergency? We&apos;re On Call</h4>
          <a href="tel:0961234567" className="site-footer__phone">
            09612-34 56 78
          </a>
          <p>Available 24/7 for urgent fixes</p>
          <a href="tel:0961234567" className="btn btn--outline-footer">
            📞 Call Now
          </a>
        </div>
      </div>

      <div className="site-footer__bottom">
        <p>© {year} Dr.-Fix. All rights reserved.</p>
        <div className="site-footer__bottom-links">
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

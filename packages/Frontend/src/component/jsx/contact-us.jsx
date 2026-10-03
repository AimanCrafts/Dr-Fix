import React from "react";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import "../css/contact-us.css";

function ContactUs() {
  return (
    <div className="df-contact-page">
      <Header variant="marketing" />
      <main>
        <section className="df-contact-hero">
          <p className="df-contact-eyebrow">GET IN TOUCH</p>
          <h1>Contact Us</h1>
          <p>
            Have a question about Dr.-Fix? Reach out through any of the channels
            below.
          </p>
        </section>

        <section className="df-contact-grid">
          <a
            href="https://www.facebook.com/drfix.bd"
            target="_blank"
            rel="noreferrer"
            className="df-contact-card"
          >
            <span>f</span>
            <div>
              <strong>Facebook</strong>
              <small>facebook.com/drfix.bd</small>
            </div>
          </a>
          <a
            href="https://www.instagram.com/drfix.bd"
            target="_blank"
            rel="noreferrer"
            className="df-contact-card"
          >
            <span>◎</span>
            <div>
              <strong>Instagram</strong>
              <small>instagram.com/drfix.bd</small>
            </div>
          </a>
          <a
            href="https://x.com/drfix_bd"
            target="_blank"
            rel="noreferrer"
            className="df-contact-card"
          >
            <span>𝕏</span>
            <div>
              <strong>X</strong>
              <small>x.com/drfix_bd</small>
            </div>
          </a>
          <a
            href="https://www.youtube.com/@DrFixBD"
            target="_blank"
            rel="noreferrer"
            className="df-contact-card"
          >
            <span>▶</span>
            <div>
              <strong>YouTube</strong>
              <small>youtube.com/@DrFixBD</small>
            </div>
          </a>
        </section>

        <p className="df-contact-note">
          These social addresses are placeholder project links and can be
          replaced with the final Dr.-Fix accounts.
        </p>
      </main>
      <Footer />
    </div>
  );
}

export default ContactUs;

import React, { useState } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import { CONTACT, SOCIALS } from "./contact-info";
import { sendContactMessage } from "../../client/api/contact";
import "../css/contact-us.css";

const TOPICS = [
  { value: "booking", label: "Booking issue" },
  { value: "payment", label: "Payment issue" },
  { value: "technician", label: "Become a technician" },
  { value: "feedback", label: "Feedback or complaint" },
  { value: "other", label: "Other" },
];

const MAX_MESSAGE = 500;
const EMPTY = { name: "", email: "", phone: "", topic: "", message: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) errors.email = "Please enter your email.";
  else if (!/^\S+@\S+\.\S+$/.test(values.email.trim()))
    errors.email = "Please enter a valid email address.";
  if (values.phone.trim() && !/^[0-9+\-\s]{7,20}$/.test(values.phone.trim()))
    errors.phone = "Please enter a valid phone number.";
  if (!values.topic) errors.topic = "Please choose a topic.";
  if (values.message.trim().length < 10)
    errors.message = "Please write at least 10 characters.";
  return errors;
}

function ContactUs() {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [formError, setFormError] = useState("");

  const setField = (field) => (event) => {
    setValues((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");

    const found = validate(values);
    if (Object.keys(found).length > 0) {
      setErrors(found);
      return;
    }

    setSubmitting(true);
    try {
      await sendContactMessage({
        name: values.name.trim(),
        email: values.email.trim(),
        phone: values.phone.trim() || null,
        topic: values.topic,
        message: values.message.trim(),
      });
      setSent(true);
      setValues(EMPTY);
    } catch (err) {
      const serverErrors = err.response?.data?.errors;
      if (serverErrors) {
        setErrors(
          Object.fromEntries(
            Object.entries(serverErrors).map(([key, list]) => [key, list[0]]),
          ),
        );
      } else if (err.response?.status === 429) {
        setFormError("Too many messages. Please wait a minute and try again.");
      } else {
        setFormError("Could not send your message. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const field = (name, label, input) => (
    <div className={`df-form-field ${errors[name] ? "has-error" : ""}`}>
      <label htmlFor={`contact-${name}`}>{label}</label>
      {input}
      {errors[name] && <small role="alert">{errors[name]}</small>}
    </div>
  );

  return (
    <div className="df-contact-page">
      <Header variant="marketing" />
      <main>
        <section className="df-contact-hero">
          <h1>Contact Us</h1>
          <p>
            Have a question about a booking, a payment, or joining as a
            technician? Send us a message and we will get back to you.
          </p>
        </section>

        <section className="df-contact-layout">
          <aside className="df-contact-info">
            <h2>Get in touch</h2>
            <ul>
              <li>
                <Phone size={18} />
                <div>
                  <strong>Phone</strong>
                  <a href={`tel:${CONTACT.phone}`}>{CONTACT.phone}</a>
                </div>
              </li>
              <li>
                <Mail size={18} />
                <div>
                  <strong>Email</strong>
                  <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
                </div>
              </li>
              <li>
                <MapPin size={18} />
                <div>
                  <strong>Address</strong>
                  <span>{CONTACT.address}</span>
                </div>
              </li>
              <li>
                <Clock size={18} />
                <div>
                  <strong>Support hours</strong>
                  <span>{CONTACT.hours}</span>
                </div>
              </li>
            </ul>

            <p className="df-contact-urgent">
              Need urgent help? Please call us instead of writing.
            </p>

            <div className="df-contact-socials" aria-label="Social media">
              {SOCIALS.map(([label, icon, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                >
                  <img src={icon} alt="" />
                </a>
              ))}
            </div>
          </aside>

          <div className="df-contact-form-card">
            {sent ? (
              <div className="df-contact-success" role="status">
                <span aria-hidden="true">✓</span>
                <h2>Message sent</h2>
                <p>Thank you! We have received your message and will reply soon.</p>
                <button type="button" onClick={() => setSent(false)}>
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <h2>Send us a message</h2>

                <div className="df-form-row">
                  {field(
                    "name",
                    "Full name *",
                    <input
                      id="contact-name"
                      type="text"
                      value={values.name}
                      onChange={setField("name")}
                      autoComplete="name"
                    />,
                  )}
                  {field(
                    "email",
                    "Email *",
                    <input
                      id="contact-email"
                      type="email"
                      value={values.email}
                      onChange={setField("email")}
                      autoComplete="email"
                    />,
                  )}
                </div>

                <div className="df-form-row">
                  {field(
                    "phone",
                    "Phone (optional)",
                    <input
                      id="contact-phone"
                      type="tel"
                      value={values.phone}
                      onChange={setField("phone")}
                      autoComplete="tel"
                    />,
                  )}
                  {field(
                    "topic",
                    "Topic *",
                    <select
                      id="contact-topic"
                      value={values.topic}
                      onChange={setField("topic")}
                    >
                      <option value="">Choose a topic</option>
                      {TOPICS.map((topic) => (
                        <option key={topic.value} value={topic.value}>
                          {topic.label}
                        </option>
                      ))}
                    </select>,
                  )}
                </div>

                {field(
                  "message",
                  "Message *",
                  <textarea
                    id="contact-message"
                    rows={6}
                    maxLength={MAX_MESSAGE}
                    value={values.message}
                    onChange={setField("message")}
                  />,
                )}
                <span className="df-char-count">
                  {values.message.length}/{MAX_MESSAGE}
                </span>

                {formError && (
                  <p className="df-form-error" role="alert">
                    {formError}
                  </p>
                )}

                <button type="submit" disabled={submitting}>
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default ContactUs;

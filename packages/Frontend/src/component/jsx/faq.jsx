import React, { useState } from "react";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import "../css/faq.css";

const faqs = [
  {
    q: "How do I book a service?",
    a: "Open Services, choose the service you need, select a suitable option, provide the required booking details, and confirm your booking.",
  },
  {
    q: "Can I track my technician?",
    a: "Yes. Once a technician is assigned and the booking enters the service journey, the tracking page can show the current booking status.",
  },
  {
    q: "What happens after I submit a booking?",
    a: "The booking is sent to suitable technicians. A technician can accept the request, after which the service status moves through the available job stages.",
  },
  {
    q: "Can a technician reject a job request?",
    a: "Yes. A technician can reject an incoming request. This rejection applies to that technician's request list and does not cancel the customer's booking.",
  },
  {
    q: "How do I see my previous bookings?",
    a: "Open My Bookings from the customer dashboard to see active bookings and previous booking history.",
  },
  {
    q: "How does payment work?",
    a: "The current project checkout uses Cash on Service as the available payment method.",
  },
  {
    q: "Can I update my profile?",
    a: "Yes. Customers can update their profile from the Profile page. Technicians have their own profile page in the technician dashboard.",
  },
  {
    q: "How do I become a technician?",
    a: "Use the technician application flow and provide the requested information. Applications can then be reviewed through the platform's technician-management workflow.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="df-faq-page">
      <Header variant="marketing" />
      <main>
        <section className="df-faq-hero">
          <h1>Frequently Asked Questions</h1>
          <p>
            Answers to common questions about booking, technicians, tracking,
            and your account.
          </p>
        </section>

        <section
          className="df-faq-list"
          aria-label="Frequently asked questions"
        >
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <article
                className={`df-faq-item ${isOpen ? "is-open" : ""}`}
                key={item.q}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="df-faq-icon">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && <p>{item.a}</p>}
              </article>
            );
          })}
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default FAQ;

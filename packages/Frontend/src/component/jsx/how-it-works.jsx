import React from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import "../css/how-it-works.css";

const steps = [
  {
    number: "01",
    title: "Choose a service",
    text: "Browse Dr.-Fix services and select the repair or maintenance service you need.",
  },
  {
    number: "02",
    title: "Tell us the details",
    text: "Choose your address, date and time, add any notes, say whether you will pay in cash or online, and confirm the booking. Nothing is charged yet.",
  },
  {
    number: "03",
    title: "A technician accepts",
    text: "A suitable technician receives the request and can accept the job from the technician dashboard.",
  },
  {
    number: "04",
    title: "Track the service",
    text: "Follow the booking status as the technician accepts the job, starts the work, and completes the service.",
  },
  {
    number: "05",
    title: "Pay and review",
    text: "When the job is done, pay the technician in cash or pay online in the app. Then you can review the service.",
  },
];

function HowItWorks() {
  return (
    <div className="df-how-page">
      <Header variant="marketing" />
      <main>
        <section className="df-how-hero">
          <h1>How Dr.-Fix Works</h1>
          <p>
            From booking a service to getting the job completed, the process is
            designed to stay simple.
          </p>
        </section>

        <section className="df-how-steps" id="how-it-works">
          {steps.map((step) => (
            <article className="df-how-step" key={step.number}>
              <div className="df-how-step__number">{step.number}</div>
              <div>
                <h2>{step.title}</h2>
                <p>{step.text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="df-how-cta">
          <div>
            <p className="df-how-cta__eyebrow">READY WHEN YOU ARE</p>
            <h2>Need something fixed?</h2>
            <p>Choose a service and start your booking.</p>
          </div>
          <Link to="/services" className="df-how-cta__button">
            Explore Services
          </Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default HowItWorks;

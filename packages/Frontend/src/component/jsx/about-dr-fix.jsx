import React from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import "../css/about-dr-fix.css";

function AboutDrFix() {
  return (
    <div className="df-about-page">
      <Header variant="marketing" />
      <main>
        <section className="df-about-hero">
          <p className="df-about-eyebrow">ABOUT DR.-FIX</p>
          <h1>Your home's doctor.</h1>
          <p>We diagnose. We fix. You relax.</p>
        </section>

        <section className="df-about-content">
          <div className="df-about-block">
            <span>01</span>
            <div>
              <h2>What is Dr.-Fix?</h2>
              <p>
                Dr.-Fix is a home-service platform concept that connects
                customers with technicians for everyday repair and maintenance
                needs. The goal is to make finding a suitable service, booking
                it, and following the job easier from one place.
              </p>
            </div>
          </div>

          <div className="df-about-block">
            <span>02</span>
            <div>
              <h2>Built around a clear service journey</h2>
              <p>
                Customers can explore services, request a technician, receive
                booking updates, and track the service journey. Technicians have
                their own workspace for incoming requests, jobs, schedules,
                earnings, and profile information.
              </p>
            </div>
          </div>

          <div className="df-about-block">
            <span>03</span>
            <div>
              <h2>Designed for the project</h2>
              <p>
                The platform is being developed as an academic software project
                with a focus on practical frontend, backend, authentication,
                booking, and service-management workflows.
              </p>
            </div>
          </div>
        </section>

        <section className="df-about-bottom">
          <h2>See the service journey</h2>
          <Link to="/how-it-works">How It Works</Link>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AboutDrFix;

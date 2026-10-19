import React from "react";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import "../css/about-us.css";

import aiman from "../../assets/team/aiman.jpg";
import sifat from "../../assets/team/sifat.jpg";
import moon from "../../assets/team/moon.jpg";

const members = [
  {
    name: "Abdur Rahman Aiman",
    role: "Frontend Developer",
    focus: "React, UI & Architecture",
    image: aiman,
    initials: "AA",
  },
  {
    name: "Raisul Islam Sifat",
    role: "QA Engineer",
    focus: "Database & Testing",
    image: sifat,
    initials: "RIS",
  },
  {
    name: "Munawar Mahtab Moon",
    role: "Backend Developer",
    focus: "Laravel & API",
    image: moon,
    initials: "MMM",
  },
];

function AboutUs() {
  return (
    <div className="df-info-page">
      <Header variant="marketing" />
      <main>
        <section className="df-info-hero">
          <h1>Your home&apos;s doctor.</h1>
          <p>We diagnose. We fix. You relax.</p>
        </section>

        <section className="df-about-intro">
          <div className="df-about-block">
            <span>01</span>
            <div>
              <h2>What is Dr.-Fix?</h2>
              <p>
                Dr.-Fix is a home-service platform that connects homeowners
                with technicians for everyday repair and maintenance needs.
                Customers can explore services, request a technician, receive
                booking updates, and follow the job from start to finish, all
                in one place.
              </p>
            </div>
          </div>

          <div className="df-about-block">
            <span>02</span>
            <div>
              <h2>Built for customers and technicians</h2>
              <p>
                Technicians get their own workspace for incoming requests,
                jobs, schedules, earnings, and profile information, so both
                sides of every booking stay clear and organized.
              </p>
            </div>
          </div>
        </section>

        <section className="df-team-section">
          <h2 className="df-section-title">Meet the Team</h2>
          <div className="df-team-grid">
            {members.map((member) => (
              <article className="df-team-card" key={member.name}>
                <div className="df-team-photo">
                  <img
                    src={member.image}
                    alt={member.name}
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                      event.currentTarget.nextElementSibling.style.display =
                        "flex";
                    }}
                  />
                  <span className="df-team-fallback">{member.initials}</span>
                </div>
                <h3>{member.name}</h3>
                <p className="df-team-role">{member.role}</p>
                <p className="df-team-focus">{member.focus}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="df-project-note">
          <p>
            Dr.-Fix is developed as an academic project for{" "}
            <strong>Software Development Lab, CSE 3100</strong>, with a focus on
            practical frontend, backend, authentication, booking, and
            service-management workflows.
          </p>
          <p>Ahsanullah University of Science and Technology</p>
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

export default AboutUs;

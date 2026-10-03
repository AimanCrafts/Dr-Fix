import React from "react";
import Header from "../../component/jsx/header";
import Footer from "../../component/jsx/footer";
import "../css/about-us.css";

import aiman from "../../assets/team/aiman.jpg";
import sifat from "../../assets/team/sifat.jpg";
import moon from "../../assets/team/moon.jpg";

const members = [
  {
    name: "Abdur Rahman Aiman",
    id: "20230204078",
    image: aiman,
    initials: "AA",
  },
  {
    name: "Raisul Islam Sifat",
    id: "20230204097",
    image: sifat,
    initials: "RIS",
  },
  {
    name: "Munawar Mahtab Moon",
    id: "20230204105",
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
          <p className="df-info-eyebrow">THE TEAM</p>
          <h1>About Us</h1>
          <p>Meet the team behind the Dr.-Fix project.</p>
        </section>

        <section className="df-team-section">
          <div className="df-team-grid">
            {members.map((member) => (
              <article className="df-team-card" key={member.id}>
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
                <h2>{member.name}</h2>
                <p>ID: {member.id}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="df-project-note">
          <p>
            This project is developed for{" "}
            <strong>Software Development Lab, CSE 3100.</strong>
          </p>
          <p>Ahsanullah University of Science and Technology</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AboutUs;

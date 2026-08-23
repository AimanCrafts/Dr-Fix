import React, { useState } from "react";
import Header from "../../component/jsx/header.jsx";
import Footer from "../../component/jsx/footer.jsx";
import "../css/home.css";
import AddPopup from "../../component/jsx/ad_popup.jsx";

import heroImg from "../../assets/hero-image.png";
import electricImg from "../../assets/electricImg.png";

import {
  Calendar,
  Clock,
  ShieldCheck,
  Star,
  Users,
  Zap,
  Droplet,
  Snowflake,
  Hammer,
  Paintbrush,
  Sparkles,
  Bug,
  Wrench,
  Sprout,
  Camera,
  CheckCircle,
  BadgeCheck,
  BadgeDollarSign,
  Search,
} from "lucide-react";

const STATS = [
  { icon: Calendar, value: "214", label: "Fixes This Month" },
  { icon: Clock, value: "22 min", label: "Avg Response" },
  { icon: ShieldCheck, value: "98%", label: "On-Time" },
  { icon: Star, value: "4.9/5", label: "Rating" },
  { icon: Users, value: "12K+", label: "Customers" },
];

const SERVICE_CATEGORIES = [
  { icon: Zap, name: "Electric" },
  { icon: Droplet, name: "Plumbing" },
  { icon: Snowflake, name: "AC Repair" },
  { icon: Hammer, name: "Carpentry" },
  { icon: Paintbrush, name: "Painting" },
  { icon: Sparkles, name: "Cleaning" },
  { icon: Bug, name: "Pest Control" },
  { icon: Wrench, name: "Appliance Repair" },
  { icon: Sprout, name: "Gardening" },
  { icon: Camera, name: "CCTV" },
];

const PROCESS_STEPS = [
  {
    step: "1",
    title: "Book a Fix",
    desc: "Tell us what's wrong in a few simple steps.",
  },
  {
    step: "2",
    title: "Get Matched",
    desc: "We match you with the best local expert.",
  },
  {
    step: "3",
    title: "Fix Completed",
    desc: "Expert arrives and fixes the issue.",
  },
  {
    step: "4",
    title: "Rate & Warranty",
    desc: "Rate the service and get warranty on work.",
  },
];

const CASE_STUDIES = [
  {
    title: "Kitchen Sink Leak",
    problem: "Constant leakage from the pipe joint.",
    fix: "Replaced the old pipe and tightened connections.",
    result: "No more leaks and a happy customer.",
    rating: 5,
    customer: "Rafiq H., Dhanmondi",
  },
  {
    title: "AC Not Cooling",
    problem: "AC was running but not cooling.",
    fix: "Gas refilled and filter cleaned.",
    result: "Cooling restored like new.",
    rating: 5,
    customer: "Nusrat J., Uttara",
  },
  {
    title: "Wall Paint Peeling",
    problem: "Damp walls and peeling paint.",
    fix: "Damp treatment and premium repaint.",
    result: "Fresh and clean walls.",
    rating: 5,
    customer: "Sabbir A., Mirpur",
  },
];

const TECHNICIANS = [
  { name: "Imran K.", role: "Plumber", years: "7+ Years Exp.", rating: "4.9" },
  {
    name: "Arif M.",
    role: "Electrician",
    years: "7+ Years Exp.",
    rating: "4.8",
  },
  {
    name: "Rashed H.",
    role: "AC Specialist",
    years: "5+ Years Exp.",
    rating: "4.9",
  },
  {
    name: "Sajjad H.",
    role: "Carpenter",
    years: "8+ Years Exp.",
    rating: "4.9",
  },
];

const TRUST_BADGES = [
  {
    icon: ShieldCheck,
    label: "Background Verified",
    sub: "Every pro is verified",
  },
  { icon: CheckCircle, label: "Insured Work", sub: "We've got you covered" },
  {
    icon: BadgeCheck,
    label: "ID-Checked Technicians",
    sub: "Your safety is our priority",
  },
  {
    icon: BadgeDollarSign,
    label: "Fixed Pricing — No Bargaining",
    sub: "Transparent & upfront pricing",
  },
];

/* ---------------------------------------------------------------------- */

function Home() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      document.documentElement.setAttribute(
        "data-theme",
        next ? "dark" : "light",
      );
      return next;
    });
  };

  return (
    <div className="home-page">
      <Header
        variant="marketing"
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />

      {/* ================= HERO ================= */}
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__text">
            <h1 className="hero__heading">
              Something Broken? We <span className="text-accent">Diagnose</span>
              . We <span className="text-accent">Fix</span>.
            </h1>
            <p className="hero__subtext">
              Fast, reliable home repair services at your doorstep.
            </p>

            <form
              className="hero__search"
              onSubmit={(e) => e.preventDefault()}
              role="search"
            >
              <input
                type="text"
                placeholder="What needs fixing?"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                aria-label="What needs fixing?"
              />
              <button type="submit" aria-label="Search">
                🔍
              </button>
            </form>
          </div>

          {/* ================= HERO ================= */}
          <div className="hero__visual">
            <img
              src={heroImg}
              alt="Hero Illustration"
              className="hero__image"
            />
          </div>
        </div>
      </section>

      {/* ================= STATS STRIP ================= */}
      <section className="stats-strip" aria-label="Platform stats">
        <div className="stats-strip__inner">
          {STATS.map((stat) => {
            const Icon = stat.icon;

            return (
              <div key={stat.label} className="stat-item">
                <span className="stat-item__icon">
                  <Icon />
                </span>

                <div>
                  <p className="stat-item__value">{stat.value}</p>
                  <p className="stat-item__label">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Ad popup section*/}
      <AddPopup />

      {/* ================= SERVICE CATEGORIES ================= */}
      <section className="categories" id="categories">
        <div className="section-inner">
          <h2 className="section-heading">What Can We Fix For You?</h2>

          <div className="categories__row">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;

              return (
                <button
                  key={cat.name}
                  className="category-circle"
                  type="button"
                >
                  <span className="category-circle__icon">
                    <Icon />
                  </span>

                  <span className="category-circle__name">{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="category-preview">
            <div className="category-preview__text">
              <h3>Electric Services</h3>
              <p>
                From fixing faulty wiring to installing new fixtures, our
                certified electricians ensure your home is safe and powered.
              </p>
              <a href="/services/electric" className="link-arrow">
                Explore Electric Services →
              </a>
            </div>
            <div className="category-preview__image">
              <img
                src={electricImg}
                alt="Electrician fixing electrical panel"
                className="category-preview__img"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-inner">
          <h2 className="section-heading section-heading--center">
            How Dr.-Fix Works
          </h2>

          <div className="steps-row">
            {PROCESS_STEPS.map((s, idx) => (
              <React.Fragment key={s.step}>
                <div className="step-item">
                  <div className="step-item__circle">{s.step}</div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
                {idx < PROCESS_STEPS.length - 1 && (
                  <div className="step-connector" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CASE STUDIES ================= */}
      <section className="case-studies">
        <div className="section-inner">
          <h2 className="section-heading">Recent Fixes, Real Results</h2>

          <div className="case-studies__grid">
            {CASE_STUDIES.map((c) => (
              <article key={c.title} className="case-card">
                <div className="case-card__image">
                  {/* PHOTO: before/after service photo — to be added later */}
                  <div className="image-placeholder" aria-hidden="true">
                    <span>Before / After photo</span>
                  </div>
                </div>
                <h4>{c.title}</h4>
                <p>
                  <strong>The Problem:</strong> {c.problem}
                </p>
                <p>
                  <strong>The Fix:</strong> {c.fix}
                </p>
                <p>
                  <strong>The Result:</strong> {c.result}
                </p>
                <div className="case-card__footer">
                  <span
                    className="stars"
                    aria-label={`${c.rating} out of 5 stars`}
                  >
                    {"★".repeat(c.rating)}
                  </span>
                  <span className="case-card__customer">{c.customer}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TECHNICIANS ================= */}
      <section className="technicians">
        <div className="section-inner">
          <h2 className="section-heading section-heading--center">
            Our Verified Technicians
          </h2>

          <div className="technicians__grid">
            {TECHNICIANS.map((t) => (
              <div key={t.name} className="technician-card">
                <div className="technician-card__photo">
                  {/* PHOTO: technician headshot — to be added later */}
                  <div
                    className="image-placeholder image-placeholder--round"
                    aria-hidden="true"
                  />
                  <span className="technician-card__badge" title="Verified">
                    ✓
                  </span>
                </div>
                <p className="technician-card__name">{t.name}</p>
                <span className="technician-card__role">{t.role}</span>
                <p className="technician-card__meta">
                  {t.years} · ⭐ {t.rating}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= TRUST & SAFETY ================= */}
      <section className="trust-strip">
        <div className="section-inner trust-strip__inner">
          {TRUST_BADGES.map((b) => {
            const Icon = b.icon;

            return (
              <div key={b.label} className="trust-item">
                <span className="trust-item__icon">
                  <Icon />
                </span>

                <div>
                  <p className="trust-item__label">{b.label}</p>

                  <p className="trust-item__sub">{b.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

     
      <section className="provider-cta">
        <div className="section-inner provider-cta__inner">
          <div className="provider-cta__image">
            {/* ILLUSTRATION: technician/provider graphic — to be added later */}
            <div
              className="image-placeholder image-placeholder--dark"
              aria-hidden="true"
            >
              <span>Provider illustration</span>
            </div>
          </div>
          <div className="provider-cta__text">
            <p className="eyebrow">Are You a Skilled Professional?</p>
            <h3>Get Steady Work with Dr.-Fix</h3>
            <p className="provider-cta__desc">
              Join thousands of experts earning better with flexible jobs,
              transparent payments, and dedicated support.
            </p>
          </div>
          <a
            href="/signup?type=provider"
            className="btn btn--primary provider-cta__btn"
          >
            Register as Provider
          </a>
        </div>
      </section>

      
      <section className="cta-banner">
        <div className="section-inner cta-banner__inner">
          <div>
            <h3>Don&apos;t Wait for It to Get Worse</h3>
            <p>Book a trusted expert and get it fixed today.</p>
          </div>
          <a href="/services" className="btn btn--light">
            Book a Fix Now →
          </a>
        </div>
      </section>

      <Footer size="full" />
    </div>
  );
}

export default Home;

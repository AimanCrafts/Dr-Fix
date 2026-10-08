import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import Footer from "../../component/jsx/footer.jsx";
import "../css/home.css";
import api from "../api/axios";

import heroImg from "../../assets/hero-image.png";
import electricImg from "../../assets/electricImg.png";
import plumbing from "../../assets/plumbing.jpg";
import ac from "../../assets/ac.jpg";
import carpenting from "../../assets/carpenting.jpg";
import painting from "../../assets/painting.jpg";
import cleaning from "../../assets/cleaning.jpg";
import pestcontrol from "../../assets/pestcontrol.jpg";
import repair from "../../assets/repair.jpg";
import gardening from "../../assets/gardening.jpg";
import cctv from "../../assets/cctv.jpg";

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
  {
    icon: Zap,
    name: "Electric",
    slug: "electric",
    image: electricImg,
    description:
      "From fixing faulty wiring to installing new fixtures, our certified electricians ensure your home is safe and powered.",
  },
  {
    icon: Droplet,
    name: "Plumbing",
    slug: "plumbing",
    image: plumbing,
    description:
      "Leaky taps, blocked drains, or a full pipe fitting — our plumbers handle it all quickly and cleanly.",
  },
  {
    icon: Snowflake,
    name: "AC Repair",
    slug: "ac-repair",
    image: ac,
    description:
      "General service, gas refill, or a fresh installation — keep your AC running cool all year round.",
  },
  {
    icon: Hammer,
    name: "Carpentry",
    slug: "carpentry",
    image: carpenting,
    description:
      "Doors, wardrobes, shelves, and furniture repair — skilled carpenters for every wood-work need.",
  },
  {
    icon: Paintbrush,
    name: "Painting",
    slug: "painting",
    image: painting,
    description:
      "Single wall touch-ups to full home repainting, done neatly with premium, damp-resistant paint.",
  },
  {
    icon: Sparkles,
    name: "Cleaning",
    slug: "cleaning",
    image: cleaning,
    description:
      "Deep home cleaning, sofa and carpet care, or a spotless kitchen — book a professional cleaning crew.",
  },
  {
    icon: Bug,
    name: "Pest Control",
    slug: "pest-control",
    image: pestcontrol,
    description:
      "Safe, effective treatment against cockroaches, termites, and other household pests.",
  },
  {
    icon: Wrench,
    name: "Appliance Repair",
    slug: "appliance-repair",
    image: repair,
    description:
      "Fridge, washing machine, microwave — trained technicians to diagnose and fix your appliances.",
  },
  {
    icon: Sprout,
    name: "Gardening",
    slug: "gardening",
    image: gardening,
    description:
      "Lawn care, plant maintenance, and garden clean-ups to keep your outdoor space looking its best.",
  },
  {
    icon: Camera,
    name: "CCTV",
    slug: "cctv",
    image: cctv,
    description:
      "Professional CCTV installation and setup to keep your home or shop secure around the clock.",
  },
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

// Categories that exist on the Services page (the others open the full list).
const SERVICE_PAGE_CATEGORIES = [
  "electric",
  "plumbing",
  "ac-repair",
  "carpentry",
  "painting",
  "cleaning",
];

function Home() {
  const navigate = useNavigate();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    SERVICE_CATEGORIES[0],
  );
  const [reviews, setReviews] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [homeDataLoading, setHomeDataLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    Promise.all([api.get("/public/reviews"), api.get("/public/technicians")])
      .then(([reviewsResponse, techniciansResponse]) => {
        if (cancelled) return;
        setReviews(
          Array.isArray(reviewsResponse.data) ? reviewsResponse.data : [],
        );
        setTechnicians(
          Array.isArray(techniciansResponse.data)
            ? techniciansResponse.data
            : [],
        );
      })
      .catch(() => {
        if (cancelled) return;
        setReviews([]);
        setTechnicians([]);
      })
      .finally(() => {
        if (!cancelled) setHomeDataLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

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
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchValue.trim();
                navigate(
                  q ? `/services?search=${encodeURIComponent(q)}` : "/services",
                );
              }}
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
                <Search size={20} strokeWidth={2.4} aria-hidden="true" />
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

      {/* ================= SERVICE CATEGORIES ================= */}
      <section className="categories" id="categories">
        <div className="section-inner">
          <h2 className="section-heading">What Can We Fix For You?</h2>

          <div className="categories__row">
            {SERVICE_CATEGORIES.map((cat) => {
              const Icon = cat.icon;

              const isActive = selectedCategory.slug === cat.slug;

              return (
                <button
                  key={cat.name}
                  className={`category-circle ${isActive ? "is-active" : ""}`}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedCategory(cat)}
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
              <h3>{selectedCategory.name} Services</h3>
              <p>{selectedCategory.description}</p>
              <a
                href={
                  SERVICE_PAGE_CATEGORIES.includes(selectedCategory.slug)
                    ? `/services?search=${encodeURIComponent(selectedCategory.name)}`
                    : "/services"
                }
                className="link-arrow"
              >
                Explore {selectedCategory.name} Services →
              </a>
            </div>
            <div className="category-preview__image">
              <img
                src={selectedCategory.image}
                alt={`${selectedCategory.name} service illustration`}
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

      {/* ================= REVIEWS & RATINGS ================= */}
      <section className="case-studies">
        <div className="section-inner">
          <h2 className="section-heading">Reviews &amp; Ratings</h2>

          {homeDataLoading ? (
            <div className="home-data-empty">Loading recent reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="home-data-empty">
              No customer reviews are available yet.
            </div>
          ) : (
            <div className="case-studies__grid">
              {reviews.map((review) => (
                <article key={review.id} className="case-card review-card">
                  <p className="review-card__text">
                    {review.review?.trim() ||
                      "The customer rated this service without a written comment."}
                  </p>
                  <div className="case-card__footer">
                    <span
                      className="stars"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {"★".repeat(Number(review.rating || 0))}
                      {"☆".repeat(5 - Number(review.rating || 0))}
                    </span>
                    <strong>{review.rating}/5</strong>
                  </div>
                  <p className="review-card__technician">
                    {review.technician?.name || "Verified technician"}
                  </p>
                  <p className="review-card__address">
                    {review.booking?.address || "Address not provided"}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= VERIFIED TECHNICIANS ================= */}
      <section className="technicians">
        <div className="section-inner">
          <h2 className="section-heading section-heading--center">
            Our Verified Technicians
          </h2>

          {homeDataLoading ? (
            <div className="home-data-empty">
              Loading verified technicians...
            </div>
          ) : technicians.length === 0 ? (
            <div className="home-data-empty">
              No approved technicians are available yet.
            </div>
          ) : (
            <div className="technicians__grid">
              {technicians.map((technician) => (
                <div key={technician.id} className="technician-card">
                  <div className="technician-card__photo">
                    <div className="technician-card__avatar" aria-hidden="true">
                      {(technician.name || "T").charAt(0).toUpperCase()}
                    </div>
                    <span className="technician-card__badge" title="Verified">
                      ✓
                    </span>
                  </div>
                  <p className="technician-card__name">{technician.name}</p>
                  <span className="technician-card__role">
                    {technician.service_category || "Home Service Technician"}
                  </span>
                  <p className="technician-card__meta">
                    {technician.years_of_experience != null
                      ? `${technician.years_of_experience}+ Years Exp.`
                      : "Experienced professional"}
                    {technician.rating != null
                      ? ` · ★ ${technician.rating}`
                      : ""}
                  </p>
                  {technician.work_area && (
                    <p className="technician-card__area">
                      {technician.work_area}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
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

      {/* ================= BECOME A PROVIDER ================= */}
      <section className="provider-cta">
        <div className="section-inner provider-cta__inner">
          <div className="provider-cta__text">
            <p className="eyebrow">Are You a Skilled Professional?</p>
            <h3>Get Steady Work with Dr.-Fix</h3>
            <p className="provider-cta__desc">
              Join thousands of experts earning better with flexible jobs,
              transparent payments, and dedicated support.
            </p>
          </div>
          <div className="provider-cta__actions">
            <a
              href="/signup?type=provider"
              className="btn btn--primary provider-cta__btn"
            >
              Register as Provider
            </a>
            <Link
              to="/technician/login"
              className="btn provider-cta__btn provider-cta__btn--outline"
            >
              Already a provider? Login
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA BANNER ================= */}
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

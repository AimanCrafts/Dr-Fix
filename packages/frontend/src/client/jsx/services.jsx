import { useState } from "react";
import { useAuth } from "../../client/context/AuthContext.jsx";
import { Link } from "react-router-dom";
import Header from "../../component/jsx/header.jsx";
import Footer from "../../component/jsx/footer.jsx";
import "../css/services.css";

=

const CATEGORIES = [
  {
    id: "electric",
    icon: "⚡",
    name: "Electric Services",
    tasks: [
      { name: "Switch/Socket Repair", price: 300 },
      { name: "Light Installation", price: 450 },
      { name: "Ceiling Fan Installation", price: 500 },
      { name: "MCB/Breaker Replacement", price: 650 },
    ],
    moreCount: 3,
  },
  {
    id: "plumbing",
    icon: "🚿",
    name: "Plumbing Services",
    tasks: [
      { name: "Tap/Faucet Repair", price: 350 },
      { name: "Pipe Leak Fixing", price: 500 },
      { name: "Drain Blockage Cleaning", price: 800 },
      { name: "Toilet Repair", price: 900 },
    ],
    moreCount: 3,
  },
  {
    id: "ac-repair",
    icon: "❄️",
    name: "AC Repair",
    tasks: [
      { name: "AC General Service", price: 800 },
      { name: "AC Gas Refill", price: 1200 },
      { name: "AC Coil Cleaning", price: 900 },
      { name: "AC Installation", price: 1500 },
    ],
    moreCount: 3,
  },
  {
    id: "carpentry",
    icon: "🔨",
    name: "Carpentry Services",
    tasks: [
      { name: "Door Repair", price: 600 },
      { name: "Wardrobe Repair", price: 900 },
      { name: "Custom Shelf Installation", price: 1000 },
      { name: "Wood Polishing", price: 700 },
    ],
    moreCount: 3,
  },
  {
    id: "painting",
    icon: "🖌️",
    name: "Painting Services",
    tasks: [
      { name: "Single Wall Painting", price: 600 },
      { name: "Full Room Painting", price: 3500 },
      { name: "Damp Wall Treatment", price: 900 },
      { name: "Ceiling Painting", price: 800 },
    ],
    moreCount: 2,
  },
  {
    id: "cleaning",
    icon: "🧽",
    name: "Cleaning Services",
    tasks: [
      { name: "Deep Home Cleaning", price: 1800 },
      { name: "Bathroom Deep Clean", price: 700 },
      { name: "Sofa/Carpet Cleaning", price: 900 },
      { name: "Kitchen Deep Clean", price: 800 },
    ],
    moreCount: 2,
  },
];

function Services() {
  const { isLoggedIn } = useAuth();
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].id);
  const [searchValue, setSearchValue] = useState("");

  const handleChipClick = (id) => {
    setActiveCategory(id);
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const bookLinkFor = (task, categoryId) => {
    
    if (!isLoggedIn) {
      return `/login?redirect=/checkout&service=${encodeURIComponent(task.name)}`;
    }
    return `/checkout?category=${categoryId}&service=${encodeURIComponent(task.name)}`;
  };

  return (
    <div className="services-page">
      <Header variant={isLoggedIn ? "app" : "marketing"} />

      <div className="services-page__intro">
        <h1>All Services</h1>
        <p>Fixed pricing. Verified experts. No surprises.</p>

        <div className="services-search">
          <span className="services-search__icon">🔍</span>
          <input
            type="text"
            placeholder="Search for a service..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            aria-label="Search for a service"
          />
        </div>
      </div>

      <div
        className="category-chips"
        role="tablist"
        aria-label="Service categories"
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === cat.id}
            className={`category-chip ${activeCategory === cat.id ? "is-active" : ""}`}
            onClick={() => handleChipClick(cat.id)}
          >
            <span>{cat.icon}</span>
            {cat.name.replace(" Services", "")}
          </button>
        ))}
      </div>

      <div className="services-grid">
        {CATEGORIES.map((cat) => (
          <section key={cat.id} id={cat.id} className="service-card">
            <header className="service-card__header">
              <span className="service-card__icon">{cat.icon}</span>
              <h2>{cat.name}</h2>
            </header>

            <div className="service-card__list">
              {cat.tasks.map((task) => (
                <div key={task.name} className="service-row">
                  <span className="service-row__name">{task.name}</span>
                  <span className="service-row__price">
                    ৳{task.price.toLocaleString()}
                  </span>
                  <Link
                    to={bookLinkFor(task, cat.id)}
                    className="btn btn--outline-sm"
                  >
                    Book
                  </Link>
                </div>
              ))}
            </div>

            {cat.moreCount > 0 && (
              <Link to={`/services/${cat.id}`} className="service-card__more">
                +{cat.moreCount} more services
              </Link>
            )}
          </section>
        ))}
      </div>

      <div className="services-page__helper">
        
        <div
          className="image-placeholder image-placeholder--round-md"
          aria-hidden="true"
        >
          <span>🤔</span>
        </div>
        <div className="services-page__helper-text">
          <h3>Not Sure What You Need?</h3>
          <p>Describe your problem and we&apos;ll match the right expert.</p>
        </div>
        <div className="services-page__helper-form">
          <input type="text" placeholder="Example: My switch is not working" />
          <button type="button" className="btn btn--primary">
            Get Help Choosing
          </button>
        </div>
      </div>

      <Footer size={isLoggedIn ? "thin" : "full"} />
    </div>
  );
}

export default Services;

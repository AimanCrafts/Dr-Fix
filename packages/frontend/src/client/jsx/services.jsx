import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../client/context/AuthContext.jsx";
import Header from "../../component/jsx/header.jsx";
import Footer from "../../component/jsx/footer.jsx";
import "../css/services.css";
import {
  Zap,
  Droplets,
  Snowflake,
  Hammer,
  Paintbrush,
  Sparkles,
  Search,
} from "lucide-react";

const CATEGORIES = [
  {
    id: "electric",
    icon: Zap,
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
    icon: Droplets,
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
    icon: Snowflake,
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
    icon: Hammer,
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
    icon: Paintbrush,
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
    icon: Sparkles,
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";
  const [activeCategory, setActiveCategory] = useState(
    initialSearch ? null : CATEGORIES[0].id,
  );
  const [searchValue, setSearchValue] = useState(initialSearch);

  const handleChipClick = (id) => {
    setActiveCategory(id);
    setSearchValue("");
    setSearchParams({}, { replace: true });
    window.requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    setActiveCategory(null);

    const trimmed = value.trim();
    if (trimmed) {
      setSearchParams({ search: trimmed }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  const bookLinkFor = (task, categoryId) => {
    if (!isLoggedIn) {
      return `/login?redirect=/checkout&service=${encodeURIComponent(task.name)}&category=${encodeURIComponent(categoryId)}`;
    }
    return `/checkout?category=${categoryId}&service=${encodeURIComponent(task.name)}`;
  };

  const query = searchValue.trim().toLowerCase();

  const visibleCategories = useMemo(() => {
    // A selected category always means exactly one category card is shown.
    if (!query && activeCategory) {
      return CATEGORIES.filter((cat) => cat.id === activeCategory);
    }

    if (!query) return CATEGORIES;

    return CATEGORIES.map((cat) => {
      const categoryMatches =
        cat.id.includes(query) ||
        cat.name.toLowerCase().includes(query) ||
        cat.name
          .replace(/ services?/i, "")
          .toLowerCase()
          .includes(query);

      const matchingTasks = categoryMatches
        ? cat.tasks
        : cat.tasks.filter((task) => task.name.toLowerCase().includes(query));

      return { ...cat, tasks: matchingTasks };
    }).filter((cat) => cat.tasks.length > 0);
  }, [activeCategory, query]);

  const hasResults = visibleCategories.length > 0;

  return (
    <div className="services-page">
      <Header variant={isLoggedIn ? "app" : "marketing"} />

      <div className="services-page__intro">
        <h1>All Services</h1>
        <p>Fixed pricing. Verified experts. No surprises.</p>

        <div className="services-search" role="search">
          <Search
            className="services-search__icon"
            size={19}
            strokeWidth={2.2}
            aria-hidden="true"
          />
          <input
            type="search"
            placeholder="Search for a service..."
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            aria-label="Search for a service"
          />
        </div>
      </div>

      <div
        className="category-chips"
        role="tablist"
        aria-label="Service categories"
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === cat.id && !query}
              className={`category-chip ${activeCategory === cat.id && !query ? "is-active" : ""}`}
              onClick={() => handleChipClick(cat.id)}
            >
              <Icon size={17} strokeWidth={2} aria-hidden="true" />
              {cat.name.replace(" Services", "")}
            </button>
          );
        })}
      </div>

      {query && !hasResults && (
        <div className="services-search__empty">
          <Search size={22} aria-hidden="true" />
          <p>No service found for &ldquo;{searchValue}&rdquo;.</p>
        </div>
      )}

      {query && hasResults && (
        <p className="services-search__result-count">
          Showing services matching <strong>&ldquo;{searchValue}&rdquo;</strong>
        </p>
      )}

      <div className="services-grid">
        {visibleCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <section key={cat.id} id={cat.id} className="service-card">
              <header className="service-card__header">
                <span className="service-card__icon" aria-hidden="true">
                  <Icon size={22} strokeWidth={2} />
                </span>
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

              {!query && cat.moreCount > 0 && (
                <Link to={`/services/${cat.id}`} className="service-card__more">
                  +{cat.moreCount} more services
                </Link>
              )}
            </section>
          );
        })}
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

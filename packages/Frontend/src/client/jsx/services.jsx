import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../client/context/AuthContext.jsx";
import Header from "../../component/jsx/header.jsx";
import Footer from "../../component/jsx/footer.jsx";
import "../css/services.css";
import "../css/services-grid.css";
import { listServices } from "../api/services";
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
  },
  {
    id: "plumbing",
    icon: Droplets,
    name: "Plumbing Services",
  },
  {
    id: "ac_repair",
    icon: Snowflake,
    name: "AC Repair",
  },
  {
    id: "carpentry",
    icon: Hammer,
    name: "Carpentry Services",
  },
  {
    id: "painting",
    icon: Paintbrush,
    name: "Painting Services",
  },
  {
    id: "cleaning",
    icon: Sparkles,
    name: "Cleaning Services",
  },
];

function Services() {
  const { isLoggedIn } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  // null = still loading. Prices come from the database, not from this file.
  const [services, setServices] = useState(null);
  const [loadError, setLoadError] = useState("");

  // The chips jump to a card and highlight it; they no longer hide the others.
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    listServices()
      .then(({ data }) => setServices(data))
      .catch(() => setLoadError("Couldn't load services. Please try again."));
  }, []);

  const categories = useMemo(
    () =>
      CATEGORIES.map((cat) => ({
        ...cat,
        tasks: (services || [])
          .filter((service) => service.category === cat.id)
          .map((service) => ({ name: service.name, price: service.price })),
      })).filter((cat) => cat.tasks.length > 0),
    [services],
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
    if (!query) return categories;

    return categories
      .map((cat) => {
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
      })
      .filter((cat) => cat.tasks.length > 0);
  }, [categories, query]);

  const hasResults = visibleCategories.length > 0;

  return (
    <div className="services-page">
      <Header variant={isLoggedIn ? "client" : "marketing"} />

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

      {loadError && (
        <div className="services-search__empty" role="alert">
          <p>{loadError}</p>
        </div>
      )}

      {!loadError && services === null && (
        <p className="services-search__result-count">Loading services...</p>
      )}

      {query && !hasResults && services !== null && (
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

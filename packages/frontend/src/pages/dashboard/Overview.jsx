import { Link } from "react-router-dom";
import { Calendar, Clock, CheckCircle, Star, ArrowRight } from "lucide-react";
import { getUser } from "../../lib/auth";
import { services } from "../../data/placeholder";

const stats = [
  { label: "Services booked", value: "12", icon: Calendar },
  { label: "Completed", value: "9", icon: CheckCircle },
  { label: "Pending", value: "3", icon: Clock },
  { label: "Reviews left", value: "8", icon: Star },
];

export default function Overview() {
  const user = getUser() ?? { name: "there" };
  const featuredServices = services.slice(0, 3);

  return (
    <div>
      <h2 className="font-[var(--font-display)] text-2xl font-semibold tracking-tight md:text-3xl">
        Welcome back, {user.name?.split(" ")[0] || user.name}
      </h2>
      <p className="mt-1 text-[var(--color-muted)]">
        Here&apos;s what&apos;s happening with your services.
      </p>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--color-ink)] text-[var(--color-amber)]">
              <Icon size={20} />
            </span>
            <p className="mt-3 font-[var(--font-display)] text-2xl font-semibold">
              {value}
            </p>
            <p className="text-sm text-[var(--color-muted)]">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="font-[var(--font-display)] text-lg font-semibold">
            Popular services
          </h3>
          <Link
            to="/services"
            className="flex items-center gap-1 text-sm font-semibold text-[var(--color-amber)] hover:text-[var(--color-amber-dark)]"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-4 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredServices.map((service) => (
            <div key={service.id} className="card p-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="job-tag text-xs text-[var(--color-muted)]">
                    {service.id}
                  </span>
                  <h3 className="mt-1 font-[var(--font-display)] text-lg font-semibold">
                    {service.name}
                  </h3>
                  <p className="text-sm text-[var(--color-muted)]">
                    {service.category}
                  </p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-[var(--color-amber-soft)] px-2 py-1">
                  <Star
                    size={14}
                    className="fill-[var(--color-amber)] text-[var(--color-amber)]"
                  />
                  <span className="text-sm font-semibold text-[var(--color-amber-dark)]">
                    {service.rating}
                  </span>
                </div>
              </div>
              <p className="mt-3 text-sm text-[var(--color-muted)]">
                {service.description}
              </p>
              <div className="perforation on-card my-4" />
              <div className="flex items-center justify-between">
                <div>
                  <p className="job-tag text-xs uppercase tracking-widest text-[var(--color-muted)]">
                    Starting from
                  </p>
                  <p className="font-[var(--font-display)] text-xl font-semibold">
                    ৳{service.price}
                  </p>
                </div>
                <span className="job-tag text-xs text-[var(--color-muted)]">
                  ETA {service.eta}
                </span>
              </div>
              <Link
                to={`/book/${service.id}`}
                className="btn-primary mt-4 block w-full text-center text-sm"
              >
                Book now
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  <div className="-mx-5 mt-12 md:-mx-8">
    <Footer />
  </div>;
}

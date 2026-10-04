import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, CheckCircle2, Clock3, Users } from "lucide-react";
import Sidebar from "./sidebar";
import { getAdminDashboardSummary } from "../api/dashboard";
import "../css/dashboard.css";

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function AdminDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getAdminDashboardSummary();
      setSummary(data);
    } catch (err) {
      setError(
        err.message || "Could not load the admin dashboard.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = summary
    ? [
        {
          label: "Total Bookings",
          value: summary.total_bookings,
          icon: CalendarDays,
        },
        {
          label: "Completed Revenue",
          value: formatMoney(summary.completed_revenue),
          icon: CheckCircle2,
        },
        {
          label: "Approved Technicians",
          value: summary.approved_technicians,
          icon: Users,
        },
        {
          label: "Pending Approvals",
          value: summary.pending_approvals,
          icon: Clock3,
          alert: summary.pending_approvals > 0,
        },
      ]
    : [];

  return (
    <div className="admin-dashboard">
      <Sidebar />

      <main className="admin-main">
        <div className="admin-page-header">
          <div>
            <p className="admin-page-eyebrow">ADMINISTRATION</p>
            <h1>Dashboard</h1>
            <p>Live overview of bookings, technicians, revenue, and approvals.</p>
          </div>

          <button
            type="button"
            className="admin-refresh-button"
            onClick={loadDashboard}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div className="admin-dashboard-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={loadDashboard}>
              Try again
            </button>
          </div>
        )}

        {loading && !summary ? (
          <div className="card admin-dashboard-loading">
            Loading dashboard data...
          </div>
        ) : (
          <>
            <div className="kpi-row">
              {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`card kpi-card ${
                      stat.alert ? "kpi-card--alert" : ""
                    }`}
                  >
                    <span className="kpi-card__icon" aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <p className="kpi-card__label">{stat.label}</p>
                    <p className="kpi-card__value">{stat.value}</p>
                    <p className="kpi-card__change">
                      {stat.alert
                        ? "Requires your attention"
                        : "Live backend data"}
                    </p>
                  </div>
                );
              })}
            </div>

            <section className="card approvals-card">
              <div className="approvals-card__header">
                <div>
                  <p className="admin-section-eyebrow">TECHNICIAN MANAGEMENT</p>
                  <h2>Pending Provider Approvals</h2>
                </div>
                <Link to="/admin/approvals">View All</Link>
              </div>

              {summary?.pending_providers?.length ? (
                <div className="approvals-table">
                  <div className="approvals-table__head">
                    <span>Applicant</span>
                    <span>Service Category</span>
                    <span>Submitted On</span>
                    <span />
                  </div>

                  {summary.pending_providers.map((provider) => (
                    <div
                      key={provider.id}
                      className="approvals-table__row"
                    >
                      <span className="applicant">
                        <span
                          className="avatar-placeholder avatar-placeholder--sm"
                          aria-hidden="true"
                        />
                        {provider.name}
                      </span>
                      <span>{provider.service_category || "—"}</span>
                      <span>{formatDate(provider.created_at)}</span>
                      <Link
                        to="/admin/approvals"
                        className="btn-review"
                      >
                        Review
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="admin-empty-state">
                  <CheckCircle2 size={22} />
                  <div>
                    <strong>No pending approvals</strong>
                    <p>All current provider applications have been reviewed.</p>
                  </div>
                </div>
              )}
            </section>

            <section className="admin-dashboard-note">
              <strong>Dashboard data is live.</strong>
              <span>
                Booking totals and revenue come from the bookings table, while
                technician counts and approval status come from provider accounts.
              </span>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;

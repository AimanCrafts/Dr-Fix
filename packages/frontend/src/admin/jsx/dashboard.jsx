import Sidebar from "./sidebar";
import "../css/dashboard.css";

/**
 * Admin Dashboard (admin/jsx/dashboard.jsx)
 * --------------------------------------------
 * Simplified per project decision: no "Recent Bookings" table and no
 * "Category Performance" chart — just KPIs, a bookings trend chart, and
 * the pending provider approvals list.
 *
 * No backend / no charting library dependency — the trend chart is a
 * small hand-drawn inline SVG polyline using mock data, so this file has
 * zero extra npm packages to install. Swap MOCK_CHART_POINTS for real
 * data later; the SVG path math will still work the same way.
 */

const KPIS = [
  { label: "Total Bookings", value: "1,248", change: "+12%", icon: "📅" },
  { label: "Total Revenue", value: "৳4,82,000", change: "+8%", icon: "৳" },
  { label: "Active Technicians", value: "56", change: "+5%", icon: "👥" },
];

const PENDING_APPROVAL = { label: "Pending Approvals", value: "3", icon: "➕" };

const PENDING_PROVIDERS = [
  { name: "Rashed H.", category: "Plumbing", submitted: "May 18, 2025" },
  { name: "Mehedi Hasan", category: "AC Repair", submitted: "May 18, 2025" },
  { name: "Shakil Ahmed", category: "Electric", submitted: "May 17, 2025" },
];

// Mock trend data (0-100 scale) purely for the inline SVG chart below.
const MOCK_CHART_POINTS = [40, 55, 35, 60, 50, 70, 65, 90, 60, 55, 70, 85, 95];

function buildPolylinePoints(values, width, height) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const stepX = width / (values.length - 1);

  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function AdminDashboard() {
  const chartWidth = 640;
  const chartHeight = 160;
  const points = buildPolylinePoints(
    MOCK_CHART_POINTS,
    chartWidth,
    chartHeight,
  );

  return (
    <div className="admin-dashboard">
      <Sidebar />

      <main className="admin-main">
        {/* Top bar */}
        <div className="admin-topbar">
          <div className="admin-search">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search bookings, technicians, customers..."
            />
          </div>
          <div className="admin-topbar__actions">
            <button
              type="button"
              className="admin-bell"
              aria-label="Notifications"
            >
              🔔
            </button>
            <select className="admin-range">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>This Month</option>
            </select>
          </div>
        </div>

        {/* KPI cards */}
        <div className="kpi-row">
          {KPIS.map((kpi) => (
            <div key={kpi.label} className="card kpi-card">
              <span className="kpi-card__icon">{kpi.icon}</span>
              <p className="kpi-card__label">{kpi.label}</p>
              <p className="kpi-card__value">{kpi.value}</p>
              <p className="kpi-card__change">
                <span className="text-success">↑ {kpi.change}</span> vs previous
                period
              </p>
            </div>
          ))}

          <div className="card kpi-card kpi-card--alert">
            <span className="kpi-card__icon">{PENDING_APPROVAL.icon}</span>
            <p className="kpi-card__label">{PENDING_APPROVAL.label}</p>
            <p className="kpi-card__value">{PENDING_APPROVAL.value}</p>
            <p className="kpi-card__change text-accent">
              Requires your attention
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="card chart-card">
          <div className="chart-card__header">
            <h2>Bookings Overview (Last 30 Days)</h2>
            <span className="chart-legend">
              <span className="chart-legend__dot" /> Bookings
            </span>
          </div>
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="trend-chart"
            preserveAspectRatio="none"
          >
            <polyline
              points={points}
              fill="none"
              stroke="#FF5A1F"
              strokeWidth="2.5"
            />
          </svg>
        </div>

        {/* Pending provider approvals */}
        <div className="card approvals-card">
          <div className="approvals-card__header">
            <h2>Pending Provider Approvals</h2>
            <a href="/admin/approvals">View All</a>
          </div>

          <div className="approvals-table">
            <div className="approvals-table__head">
              <span>Applicant</span>
              <span>Service Category</span>
              <span>Submitted On</span>
              <span></span>
            </div>

            {PENDING_PROVIDERS.map((p) => (
              <div key={p.name} className="approvals-table__row">
                <span className="applicant">
                  <span
                    className="avatar-placeholder avatar-placeholder--sm"
                    aria-hidden="true"
                  />
                  {p.name}
                </span>
                <span>{p.category}</span>
                <span>{p.submitted}</span>
                <button type="button" className="btn-review">
                  Review
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

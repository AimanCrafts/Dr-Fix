import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  MapPin,
  Play,
  RotateCcw,
  Wrench,
} from "lucide-react";
import Header from "../../component/jsx/header.jsx";
import {
  listAvailableJobs,
  listMyJobs,
  acceptJob,
  startJob,
  completeJob,
} from "../api/bookings";
import { getCurrentTechnician } from "../api/auth";
import {
  getTechnicianSummary,
  updateTechnicianAvailability,
} from "../api/technician-dashboard-api";
import "../css/dashboard.css";

const STATUS_META = {
  accepted: {
    label: "Accepted",
    description: "This job is assigned to you.",
  },
  in_progress: {
    label: "In Progress",
    description: "Service is currently in progress.",
  },
  completed: {
    label: "Completed",
    description: "This service has been completed.",
  },
};

function formatMoney(value) {
  return `৳${Number(value || 0).toLocaleString()}`;
}

function TechnicianDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [summary, setSummary] = useState(null);
  const [incomingJobs, setIncomingJobs] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [busyAction, setBusyAction] = useState(null);
  const [notice, setNotice] = useState("");

  const loadSummary = async () => {
    try {
      const { data } = await getTechnicianSummary();
      setSummary(data);
      setIsOnline(Boolean(data.is_available));
    } catch {
      try {
        const { data } = await getCurrentTechnician();
        setIsOnline(Boolean(data.is_available));
      } catch {
        // Keep the current UI state if the profile request also fails.
      }
    }
  };

  const loadIncoming = async () => {
    try {
      const { data } = await listAvailableJobs();
      setIncomingJobs(Array.isArray(data) ? data : []);
    } catch {
      setIncomingJobs([]);
    }
  };

  const loadSchedule = async () => {
    try {
      const { data } = await listMyJobs();
      setMySchedule(Array.isArray(data) ? data : []);
    } catch {
      setMySchedule([]);
    }
  };

  useEffect(() => {
    loadSummary();
    loadSchedule();
    if (!isOnline) return undefined;

    loadIncoming();
    const interval = setInterval(() => {
      loadIncoming();
      loadSchedule();
    }, 10000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const toggleAvailability = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      const { data } = await updateTechnicianAvailability(next);
      setIsOnline(Boolean(data.is_available));
      setSummary((current) =>
        current
          ? { ...current, is_available: Boolean(data.is_available) }
          : current,
      );
      if (!next) setIncomingJobs([]);
      else await loadIncoming();
    } catch (err) {
      setIsOnline(!next);
      setNotice(
        err.response?.data?.message || "Could not update availability.",
      );
    }
  };

  const activeJobs = useMemo(
    () =>
      mySchedule.filter((job) =>
        ["accepted", "in_progress"].includes(job.status),
      ),
    [mySchedule],
  );

  const handleAccept = async (id) => {
    setBusyAction(`accept-${id}`);
    setNotice("");

    try {
      await acceptJob(id);
      setIncomingJobs((prev) => prev.filter((job) => job.id !== id));
      await loadSchedule();
    } catch (err) {
      if (err.response?.status === 409) {
        setNotice("This request was already accepted by another technician.");
        setIncomingJobs((prev) => prev.filter((job) => job.id !== id));
      } else {
        setNotice(err.response?.data?.message || "Could not accept this job.");
      }
    } finally {
      setBusyAction(null);
    }
  };

  const handleStatusAction = async (job) => {
    const action = job.status === "accepted" ? startJob : completeJob;
    const actionKey = `${job.status}-${job.id}`;
    setBusyAction(actionKey);
    setNotice("");

    try {
      await action(job.id);
      await loadSchedule();
    } catch (err) {
      setNotice(
        err.response?.data?.message || "Could not update this service.",
      );
    } finally {
      setBusyAction(null);
    }
  };

  return (
    <div className="tech-dashboard">
      <Header variant="technician" />

      <main className="tech-dashboard__main">
        <section className="tech-welcome">
          <div>
            <p className="tech-eyebrow">TECHNICIAN DASHBOARD</p>
            <h1>Manage your service jobs</h1>
            <p>
              Accept requests, start the work when you are ready, and complete
              the service when it is done.
            </p>
          </div>

          <label className="availability-control">
            <span
              className={`availability-dot ${isOnline ? "is-online" : ""}`}
            />
            <span>
              {isOnline ? "Available for jobs" : "Not accepting jobs"}
            </span>
            <input
              type="checkbox"
              checked={isOnline}
              onChange={toggleAvailability}
            />
            <span className="availability-control__track" aria-hidden="true" />
          </label>
        </section>

        <section className="stats-row">
          {[
            {
              label: "Today's Completed",
              value: summary ? summary.today_completed : "—",
              change: "Completed services",
            },
            {
              label: "Active Jobs",
              value: summary ? summary.active_jobs : "—",
              change: "Accepted or in progress",
            },
            {
              label: "Total Earnings",
              value: summary ? formatMoney(summary.total_earnings) : "—",
              change: "From completed jobs",
            },
            {
              label: "Rating",
              value: summary?.rating ?? "—",
              change: summary
                ? `${summary.review_count} reviews`
                : "Loading reviews",
            },
          ].map((stat) => (
            <div key={stat.label} className="stat-card">
              <p className="stat-card__label">{stat.label}</p>
              <p className="stat-card__value">{stat.value}</p>
              <p className="stat-card__change">{stat.change}</p>
            </div>
          ))}
        </section>

        {notice && (
          <div className="tech-notice" role="alert">
            {notice}
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        )}

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">NEW WORK</p>
              <h2>Incoming job requests</h2>
            </div>
            <span className="section-count">
              {incomingJobs.length} available
            </span>
          </div>

          {!isOnline ? (
            <div className="empty-panel">
              <Clock3 size={24} />
              <h3>You are offline</h3>
              <p>Turn on availability to receive new service requests.</p>
            </div>
          ) : incomingJobs.length === 0 ? (
            <div className="empty-panel">
              <CheckCircle2 size={24} />
              <h3>No new requests</h3>
              <p>
                There are no matching jobs right now. Keep your availability on.
              </p>
            </div>
          ) : (
            <div className="request-grid">
              {incomingJobs.map((job) => (
                <article key={job.id} className="request-card">
                  <div className="request-card__top">
                    <div className="service-icon">
                      <Wrench size={19} />
                    </div>
                    <span className="request-badge">New request</span>
                  </div>
                  <h3>{job.service_name}</h3>
                  <p className="request-card__customer">
                    {job.customer?.name || "Customer"}
                  </p>
                  <div className="request-card__details">
                    <span>
                      <MapPin size={15} /> {job.address}
                    </span>
                    <span>
                      <Clock3 size={15} /> {job.date_label}, {job.time_slot}
                    </span>
                  </div>
                  <div className="request-card__bottom">
                    <div>
                      <span className="detail-label">Service amount</span>
                      <strong>{formatMoney(job.price)}</strong>
                    </div>
                    <button
                      type="button"
                      className="primary-action"
                      disabled={busyAction === `accept-${job.id}`}
                      onClick={() => handleAccept(job.id)}
                    >
                      {busyAction === `accept-${job.id}`
                        ? "Accepting..."
                        : "Accept job"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-heading">
            <div>
              <p className="section-kicker">YOUR WORK</p>
              <h2>Active services</h2>
            </div>
            <span className="section-count">{activeJobs.length} active</span>
          </div>

          {activeJobs.length === 0 ? (
            <div className="empty-panel empty-panel--compact">
              <p>No active services. Accepted jobs will appear here.</p>
            </div>
          ) : (
            <div className="active-job-list">
              {activeJobs.map((job) => {
                const meta = STATUS_META[job.status];
                const isStarting = busyAction === `accepted-${job.id}`;
                const isCompleting = busyAction === `in_progress-${job.id}`;

                return (
                  <article key={job.id} className="active-job-card">
                    <div className="active-job-card__main">
                      <div className="active-job-card__icon">
                        {job.status === "accepted" ? (
                          <Clock3 size={20} />
                        ) : (
                          <Play size={20} />
                        )}
                      </div>
                      <div>
                        <div className="active-job-card__title-row">
                          <h3>{job.service_name}</h3>
                          <span
                            className={`status-pill status-pill--${job.status}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                        <p>{job.customer?.name || "Customer"}</p>
                        <span className="active-job-card__address">
                          <MapPin size={14} /> {job.address}
                        </span>
                      </div>
                    </div>

                    <div className="active-job-card__schedule">
                      <span>{job.date_label}</span>
                      <strong>{job.time_slot}</strong>
                    </div>

                    <div className="active-job-card__action">
                      <p>{meta.description}</p>
                      <button
                        type="button"
                        className="primary-action primary-action--wide"
                        disabled={isStarting || isCompleting}
                        onClick={() => handleStatusAction(job)}
                      >
                        {job.status === "accepted" && (
                          <>
                            <Play size={16} />{" "}
                            {isStarting ? "Starting..." : "Start service"}
                          </>
                        )}
                        {job.status === "in_progress" && (
                          <>
                            <CheckCircle2 size={16} />{" "}
                            {isCompleting
                              ? "Completing..."
                              : "Complete service"}
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="dashboard-section dashboard-section--last">
          <div className="section-heading">
            <div>
              <p className="section-kicker">HISTORY</p>
              <h2>Recently completed</h2>
            </div>
          </div>

          {mySchedule.filter((job) => job.status === "completed").slice(0, 5)
            .length === 0 ? (
            <div className="empty-panel empty-panel--compact">
              <p>Your completed services will appear here.</p>
            </div>
          ) : (
            <div className="completed-list">
              {mySchedule
                .filter((job) => job.status === "completed")
                .slice(0, 5)
                .map((job) => (
                  <div key={job.id} className="completed-row">
                    <div>
                      <strong>{job.service_name}</strong>
                      <span>
                        {job.customer?.name || "Customer"} · {job.address}
                      </span>
                    </div>
                    <div>
                      <strong>{formatMoney(job.price)}</strong>
                      <span>{job.date_label}</span>
                    </div>
                    <span className="status-pill status-pill--completed">
                      Completed
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default TechnicianDashboard;

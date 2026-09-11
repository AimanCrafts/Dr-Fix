import { useEffect, useState } from "react";
import Header from "../../component/jsx/header.jsx";
import {
  listAvailableJobs,
  listMyJobs,
  acceptJob,
  markOnTheWay,
  markArrived,
  startJob,
  completeJob,
} from "../api/bookings";
import "../css/dashboard.css";

/**
 * Technician Dashboard — Overview (technician/jsx/dashboard.jsx)
 * -------------------------------------------------------------------
 * "Incoming Job Request" and "Today's Schedule" are now wired to real
 * data (GET /technician/bookings/available and /technician/bookings/mine).
 *
 * What changed from the old mock version, and why:
 *  - The countdown timer is GONE. There is no per-technician reservation
 *    of a job — every approved technician whose service_category matches
 *    sees the exact same pending job at the same time. A timer implied a
 *    single technician had an exclusive window to respond, which was
 *    never true once multiple technicians can see the same request.
 *  - "Decline" is gone too — there was nothing to decline against
 *    (no reservation exists to release). A technician who isn't
 *    interested just... doesn't tap Accept. It stays visible to everyone
 *    else until someone does.
 *  - Multiple jobs can be incoming at once now (a list, not a single
 *    slot) — matches how it actually works: any number of customers in
 *    your category could be waiting at the same time.
 *  - Accept can fail with 409 if another technician's Accept reached the
 *    server microseconds earlier — the backend's DB update is the only
 *    thing that decides the race (see TechnicianBookingController). The
 *    UI here just shows a brief message and removes it from the list.
 *
 * MOCK_STATS and MOCK_RECENT_JOBS below are still mock — this pass only
 * covers the actual booking/acceptance loop, not earnings history or
 * ratings aggregation. Swapping those in later means adding a stats/
 * history endpoint and replacing these two constants.
 */

const MOCK_STATS = [
  { label: "Today's Earnings", value: "৳2,450", change: "+18% vs yesterday" },
  { label: "Jobs Completed Today", value: "5", change: "+1 vs yesterday" },
  { label: "Rating", value: "4.9", change: "Based on 128 reviews" },
  { label: "Acceptance Rate", value: "96%", change: "+2% vs last week" },
];

const MOCK_RECENT_JOBS = [
  {
    customer: "Sabbir Hossain",
    service: "AC Gas Refill",
    date: "May 24, 2025 · 11:15 AM",
    earned: 1200,
    rating: 5.0,
  },
  {
    customer: "Nusrat Jahan",
    service: "AC Repair",
    date: "May 23, 2025 · 2:30 PM",
    earned: 1500,
    rating: 4.8,
  },
  {
    customer: "Hasan Mahmud",
    service: "Electrical Fix",
    date: "May 22, 2025 · 5:45 PM",
    earned: 850,
    rating: 5.0,
  },
];

// Each stage's button label + which API call moves the job to the next
// stage. "accepted" is the entry stage (set by acceptJob, handled
// separately above) so it isn't listed here.
const STAGE_ACTIONS = {
  accepted: { label: "On My Way", action: markOnTheWay },
  on_the_way: { label: "I've Arrived", action: markArrived },
  arrived: { label: "Start Job", action: startJob },
  in_progress: { label: "Mark as Completed", action: completeJob },
};

const STAGE_TAG_LABEL = {
  accepted: "Accepted",
  on_the_way: "On The Way",
  arrived: "Arrived",
  in_progress: "In Progress",
  completed: "Completed",
};

function TechnicianDashboard() {
  const [isOnline, setIsOnline] = useState(true);
  const [incomingJobs, setIncomingJobs] = useState([]);
  const [mySchedule, setMySchedule] = useState([]);
  const [acceptingId, setAcceptingId] = useState(null);
  const [advancingId, setAdvancingId] = useState(null);
  const [notice, setNotice] = useState("");

  const loadIncoming = () => {
    listAvailableJobs()
      .then(({ data }) => setIncomingJobs(data))
      .catch(() => setIncomingJobs([]));
  };

  const loadSchedule = () => {
    listMyJobs()
      .then(({ data }) => setMySchedule(data))
      .catch(() => setMySchedule([]));
  };

  useEffect(() => {
    if (!isOnline) return undefined;

    loadIncoming();
    loadSchedule();

    // Simple polling instead of websockets/push — good enough for this
    // scope. Refreshes the incoming list every 10s so a job someone
    // else just accepted disappears, and new ones show up.
    const interval = setInterval(loadIncoming, 10000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const handleAccept = async (id) => {
    setAcceptingId(id);
    setNotice("");
    try {
      await acceptJob(id);
      setIncomingJobs((prev) => prev.filter((j) => j.id !== id));
      loadSchedule();
    } catch (err) {
      if (err.response?.status === 409) {
        setNotice("Too late — another technician already accepted this one.");
        setIncomingJobs((prev) => prev.filter((j) => j.id !== id));
      } else {
        setNotice("Couldn't accept this job. Please try again.");
      }
    } finally {
      setAcceptingId(null);
    }
  };

  const handleComplete = async (job) => {
    const stage = STAGE_ACTIONS[job.status];
    if (!stage) return;

    setAdvancingId(job.id);
    setNotice("");
    try {
      await stage.action(job.id);
      loadSchedule();
    } catch (err) {
      setNotice(
        err.response?.data?.message || "Couldn't update this job's status.",
      );
    } finally {
      setAdvancingId(null);
    }
  };

  return (
    <div className="tech-dashboard">
      <Header variant="technician" />

      <main className="tech-dashboard__main">
        {/* Availability toggle */}
        <section className="availability-row">
          <div className="availability-row__status">
            <span
              className={`status-dot ${isOnline ? "is-online" : "is-offline"}`}
            />
            <div>
              <h1>{isOnline ? "You're Online" : "You're Offline"}</h1>
              <p>
                {isOnline
                  ? "Ready to receive jobs"
                  : "Turn on to start receiving jobs"}
              </p>
            </div>
          </div>

          <label className="toggle-switch">
            <span>{isOnline ? "Go Offline" : "Go Online"}</span>
            <input
              type="checkbox"
              checked={isOnline}
              onChange={() => setIsOnline((prev) => !prev)}
            />
            <span className="toggle-switch__track" aria-hidden="true" />
          </label>
        </section>

        {/* Stats — still mock, see file docblock */}
        <section className="stats-row">
          {MOCK_STATS.map((stat) => (
            <div key={stat.label} className="stat-block">
              <p className="stat-block__value">{stat.value}</p>
              <p className="stat-block__label">{stat.label}</p>
              <p className="stat-block__change">{stat.change}</p>
            </div>
          ))}
        </section>

        {/* Incoming job requests — real data, can be more than one */}
        <section className="flat-section">
          <h2 className="flat-section__label">Incoming Job Requests</h2>

          {notice && <p className="job-request__notice">{notice}</p>}

          {!isOnline ? (
            <p className="empty-text">
              You're offline. Go online to see incoming job requests.
            </p>
          ) : incomingJobs.length === 0 ? (
            <p className="empty-text">
              No incoming requests right now. Stay online to receive jobs.
            </p>
          ) : (
            <div className="job-request-list">
              {incomingJobs.map((job) => (
                <div key={job.id} className="job-request">
                  <div className="job-request__main">
                    <h3>{job.service_name}</h3>
                    <p className="job-request__meta">
                      <span className="placeholder-icon" aria-hidden="true" />{" "}
                      {job.address}
                    </p>
                    <p className="job-request__distance">
                      {job.date_label}, {job.time_slot}
                    </p>
                  </div>

                  <div className="job-request__payout">
                    <p className="job-request__payout-label">Payout</p>
                    <p className="job-request__payout-value">
                      ৳{job.price.toLocaleString()}
                    </p>
                  </div>

                  <div className="job-request__actions">
                    <button
                      type="button"
                      className="btn-accept"
                      disabled={acceptingId === job.id}
                      onClick={() => handleAccept(job.id)}
                    >
                      {acceptingId === job.id ? "Accepting..." : "Accept"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My accepted jobs — real data */}
        <section className="flat-section">
          <h2 className="flat-section__label">Your Accepted Jobs</h2>
          {mySchedule.length === 0 ? (
            <p className="empty-text">No accepted jobs yet.</p>
          ) : (
            <div className="schedule-list">
              {mySchedule.map((job) => {
                const stage = STAGE_ACTIONS[job.status];

                return (
                  <div key={job.id} className="schedule-row">
                    <span className="schedule-row__time">{job.time_slot}</span>
                    <div className="schedule-row__info">
                      <p className="schedule-row__service">{job.service_name}</p>
                      <p className="schedule-row__location">{job.address}</p>
                    </div>
                    <span
                      className={`status-tag ${
                        job.status === "completed"
                          ? "status-tag--success"
                          : "status-tag--info"
                      }`}
                    >
                      {STAGE_TAG_LABEL[job.status] || job.status}
                    </span>
                    {stage && (
                      <button
                        type="button"
                        className="btn-complete"
                        disabled={advancingId === job.id}
                        onClick={() => handleComplete(job)}
                      >
                        {advancingId === job.id ? "Updating..." : stage.label}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent jobs — still mock, see file docblock */}
        <section className="flat-section">
          <div className="flat-section__header">
            <h2 className="flat-section__label">Recent Jobs</h2>
            <a href="/technician/job-requests">View All</a>
          </div>

          <div className="jobs-table">
            <div className="jobs-table__head">
              <span>Customer</span>
              <span>Service</span>
              <span>Date</span>
              <span>Earned</span>
              <span>Rating</span>
            </div>
            {MOCK_RECENT_JOBS.map((job) => (
              <div
                key={`${job.customer}-${job.date}`}
                className="jobs-table__row"
              >
                <span className="jobs-table__customer">
                  <span
                    className="placeholder-icon placeholder-icon--sm"
                    aria-hidden="true"
                  />
                  {job.customer}
                </span>
                <span>{job.service}</span>
                <span>{job.date}</span>
                <span className="jobs-table__earned">
                  ৳{job.earned.toLocaleString()}
                </span>
                <span>{job.rating.toFixed(1)} ★</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default TechnicianDashboard;

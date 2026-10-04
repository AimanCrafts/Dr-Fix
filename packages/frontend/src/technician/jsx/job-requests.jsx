import { useCallback, useEffect, useState } from "react";
import Header from "../../component/jsx/header.jsx";
import { acceptJob, listAvailableJobs, rejectJob } from "../api/bookings";
import { getCurrentTechnician } from "../api/auth";
import { updateTechnicianAvailability } from "../api/technician-dashboard-api";
import "../css/job-requests.css";

function JobRequests() {
  const [jobs, setJobs] = useState([]);
  const [online, setOnline] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [{ data: me }, { data: requests }] = await Promise.all([
        getCurrentTechnician(),
        listAvailableJobs(),
      ]);
      setOnline(Boolean(me.is_available));
      setJobs(requests);
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not load job requests.",
      );
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, [load]);

  const handleAvailability = async () => {
    const next = !online;
    setOnline(next);
    try {
      await updateTechnicianAvailability(next);
      if (!next) setJobs([]);
      else await load();
    } catch (error) {
      setOnline(!next);
      setMessage(
        error.response?.data?.message || "Could not update availability.",
      );
    }
  };

  const handleAccept = async (id) => {
    setBusyId(id);
    setMessage("");
    try {
      await acceptJob(id);
      setJobs((current) => current.filter((job) => job.id !== id));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "This job is no longer available.",
      );
      await load();
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id) => {
    setBusyId(id);
    setMessage("");
    try {
      await rejectJob(id);
      setJobs((current) => current.filter((job) => job.id !== id));
    } catch (error) {
      setMessage(
        error.response?.data?.message || "Could not reject this request.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="tech-page">
      <Header variant="technician" />
      <main className="tech-page__main">
        <div className="tech-page__topline">
          <div>
            <p className="tech-page__eyebrow">Technician workspace</p>
            <h1>Job Requests</h1>
            <p>Review new service requests that match your service category.</p>
          </div>
          <button
            className={`availability-button ${online ? "is-online" : ""}`}
            onClick={handleAvailability}
          >
            <span /> {online ? "Online" : "Offline"}
          </button>
        </div>

        {message && <div className="tech-message">{message}</div>}

        {!online ? (
          <div className="tech-empty">
            <h2>You are offline</h2>
            <p>Go online to receive incoming job requests.</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="tech-empty">
            <h2>No incoming requests</h2>
            <p>
              Stay online. New matching jobs will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="request-list">
            {jobs.map((job) => (
              <article className="request-card" key={job.id}>
                <div className="request-card__content">
                  <span className="request-card__category">
                    {job.service_category}
                  </span>
                  <h2>{job.service_name}</h2>
                  <p>
                    {job.customer?.name || "Customer"} ·{" "}
                    {job.customer?.phone || "Phone not provided"}
                  </p>
                  <p>{job.address}</p>
                  <p className="request-card__time">
                    {job.date_label} · {job.time_slot}
                  </p>
                  {job.instructions && (
                    <p className="request-card__instructions">
                      “{job.instructions}”
                    </p>
                  )}
                </div>
                <div className="request-card__side">
                  <strong>৳{Number(job.price || 0).toLocaleString()}</strong>
                  <span>Service payout</span>
                  <div className="request-card__actions">
                    <button
                      className="request-card__reject"
                      disabled={busyId === job.id}
                      onClick={() => handleReject(job.id)}
                    >
                      {busyId === job.id ? "Working..." : "Reject"}
                    </button>
                    <button
                      className="request-card__accept"
                      disabled={busyId === job.id}
                      onClick={() => handleAccept(job.id)}
                    >
                      {busyId === job.id ? "Working..." : "Accept"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default JobRequests;

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, MapPin, Play } from "lucide-react";
import Header from "../../component/jsx/header.jsx";
import { getTechnicianSchedule } from "../api/technician-dashboard-api";
import { completeJob, startJob } from "../api/bookings";
import "../css/schedule.css";

const statusMeta = {
  accepted: {
    label: "Accepted",
    action: "Start service",
    icon: Clock3,
  },
  in_progress: {
    label: "In Progress",
    action: "Complete service",
    icon: Play,
  },
};

function Schedule() {
  const [jobs, setJobs] = useState([]);
  const [busy, setBusy] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const { data } = await getTechnicianSchedule();
      setJobs(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.response?.data?.message || "Could not load schedule.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const advance = async (job) => {
    const action = job.status === "accepted" ? startJob : completeJob;
    if (!action) return;

    setBusy(job.id);
    setError("");

    try {
      await action(job.id);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || "Could not update the service.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="tech-page">
      <Header variant="technician" />
      <main className="tech-page__main">
        <p className="tech-page__eyebrow">YOUR WORKDAY</p>
        <h1>Schedule</h1>
        <p className="schedule-intro">
          Your accepted and in-progress services, ordered by booking time.
        </p>

        {error && <div className="tech-message">{error}</div>}

        {jobs.length === 0 ? (
          <div className="tech-empty">
            <CheckCircle2 size={26} />
            <h2>No active jobs</h2>
            <p>Accepted jobs will appear here when you have scheduled work.</p>
          </div>
        ) : (
          <div className="schedule-list-page">
            {jobs.map((job) => {
              const meta = statusMeta[job.status];
              const ActionIcon = meta?.icon || Clock3;

              return (
                <article className="schedule-card" key={job.id}>
                  <div className="schedule-card__time">
                    <strong>{job.time_slot}</strong>
                    <span>{job.date_label}</span>
                  </div>

                  <div>
                    <span className="schedule-card__status">
                      {meta?.label || "Active"}
                    </span>
                    <h2>{job.service_name}</h2>
                    <p>
                      {job.customer?.name || "Customer"} ·{" "}
                      {job.customer?.phone || "Phone not provided"}
                    </p>
                    <p>
                      <MapPin size={14} /> {job.address}
                    </p>
                  </div>

                  <div className="schedule-card__action">
                    {meta && (
                      <button
                        disabled={busy === job.id}
                        onClick={() => advance(job)}
                      >
                        <ActionIcon size={16} />
                        {busy === job.id ? "Updating..." : meta.action}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

export default Schedule;

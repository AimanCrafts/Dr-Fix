import { useEffect, useState } from "react";
import Header from "../../component/jsx/header.jsx";
import { getTechnicianEarnings } from "../api/technician-dashboard-api";
import "../css/earnings.css";
import "../css/commission.css";

function Earnings() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getTechnicianEarnings()
      .then(({ data: result }) => setData(result))
      .catch((e) =>
        setError(e.response?.data?.message || "Could not load earnings."),
      );
  }, []);

  return (
    <div className="tech-page">
      <Header variant="technician" />
      <main className="tech-page__main earnings-page">
        <h1>Earnings</h1>
        <p className="earnings-intro">
          What you keep from completed jobs, after the platform fee.
        </p>
        {error && <div className="tech-message">{error}</div>}
        {!data ? (
          <div className="tech-empty">
            <p>Loading earnings...</p>
          </div>
        ) : (
          <>
            <section className="earnings-stats">
              <div>
                <span>Today</span>
                <strong>৳{data.today.toLocaleString()}</strong>
              </div>
              <div>
                <span>This week</span>
                <strong>৳{data.this_week.toLocaleString()}</strong>
              </div>
              <div>
                <span>This month</span>
                <strong>৳{data.this_month.toLocaleString()}</strong>
              </div>
              <div>
                <span>All time</span>
                <strong>৳{data.total.toLocaleString()}</strong>
              </div>
            </section>
            <section className="fee-breakdown" aria-label="Earnings breakdown">
              <div>
                <span>Customer payments</span>
                <strong>৳{data.gross_total.toLocaleString()}</strong>
              </div>
              <div>
                <span>Platform fee</span>
                <strong>−৳{data.fee_total.toLocaleString()}</strong>
              </div>
              <div>
                <span>You keep</span>
                <strong>৳{data.total.toLocaleString()}</strong>
              </div>
            </section>
            <p className="fee-note fee-note--block">
              Customers pay the listed price. Dr.-Fix keeps{" "}
              {data.commission_rate}% of each completed job and the rest is your
              earning. For cash jobs, the fee is settled with Dr.-Fix
              separately.
            </p>

            <section className="earnings-table-wrap">
              <h2>Completed Jobs</h2>
              {data.jobs.length === 0 ? (
                <p className="earnings-empty">No completed jobs yet.</p>
              ) : (
                <div className="earnings-table">
                  {data.jobs.map((job) => (
                    <div className="earnings-row" key={job.id}>
                      <div>
                        <strong>{job.service_name}</strong>
                        <span>{job.customer?.name || "Customer"}</span>
                      </div>
                      <span>
                        {job.completed_at
                          ? new Date(job.completed_at).toLocaleDateString()
                          : job.date_label}
                      </span>
                      <div className="earning-amount">
                        <strong>
                          ৳
                          {Number(
                            job.commission?.earning ?? job.price,
                          ).toLocaleString()}
                        </strong>
                        <span className="fee-note">
                          ৳{Number(job.price).toLocaleString()} − ৳
                          {Number(job.commission?.fee ?? 0).toLocaleString()}{" "}
                          fee
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
export default Earnings;

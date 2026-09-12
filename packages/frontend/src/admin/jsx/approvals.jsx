import { useEffect, useState } from "react";
import Sidebar from "./sidebar";
import {
  listTechnicians,
  approveTechnician,
  rejectTechnician,
} from "../api/technicians";
import "../css/dashboard.css";
import "../css/approvals.css";

/**
 * Provider Approvals (admin/jsx/approvals.jsx)
 * -----------------------------------------------
 * Real data now — replaces the hardcoded PENDING_PROVIDERS mock that
 * used to live in dashboard.jsx. Wired to:
 *   GET  /api/admin/technicians?status=...
 *   POST /api/admin/technicians/{id}/approve
 *   POST /api/admin/technicians/{id}/reject
 * All behind the session-based 'admin.auth' middleware (see routes/api.php).
 *
 * NID file link opens Storage::disk('public')->url(...) — requires
 * `php artisan storage:link` to have been run once on the backend, or
 * the link will 404. See setup note shared with the user.
 */

const TABS = [
  { id: "pending", label: "Pending" },
  { id: "approved", label: "Approved" },
  { id: "rejected", label: "Rejected" },
  { id: "", label: "All" },
];

function StatusPill({ status }) {
  return <span className={`status-pill status-pill--${status}`}>{status}</span>;
}

function ApprovalsPage() {
  const [tab, setTab] = useState("pending");
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = async (status) => {
    setLoading(true);
    setError("");
    try {
      const data = await listTechnicians(status);
      setProviders(data);
    } catch (err) {
      setError(err.message || "Couldn't load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const handleApprove = async (id) => {
    setBusyId(id);
    try {
      await approveTechnician(id);
      await load(tab);
    } catch (err) {
      setError(err.message || "Approve failed.");
    } finally {
      setBusyId(null);
    }
  };

  const submitReject = async () => {
    setBusyId(rejectingId);
    try {
      await rejectTechnician(rejectingId, rejectReason);
      setRejectingId(null);
      setRejectReason("");
      await load(tab);
    } catch (err) {
      setError(err.message || "Reject failed.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="admin-dashboard">
      <Sidebar />

      <main className="admin-main">
        <div className="approvals-header">
          <h1>Provider Approvals</h1>
          <p>Review NID uploads and approve or reject provider applications.</p>
        </div>

        <div className="approvals-tabs">
          {TABS.map((t) => (
            <button
              key={t.id || "all"}
              type="button"
              className={`approvals-tab ${tab === t.id ? "is-active" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {error && <p className="approvals-error">{error}</p>}

        <div className="card approvals-card">
          {loading ? (
            <p className="approvals-empty">Loading...</p>
          ) : providers.length === 0 ? (
            <p className="approvals-empty">No applications here.</p>
          ) : (
            <div className="approvals-list">
              {providers.map((p) => (
                <div key={p.id} className="approval-row">
                  <div className="approval-row__main">
                    <span
                      className="avatar-placeholder avatar-placeholder--sm"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="approval-row__name">{p.name}</p>
                      <p className="approval-row__meta">
                        {p.email} · {p.phone || "no phone"}
                      </p>
                    </div>
                  </div>

                  <div className="approval-row__details">
                    <span>{p.service_category}</span>
                    <span>{p.years_of_experience} yrs exp.</span>
                    <span>{p.work_area}</span>
                  </div>

                  <div className="approval-row__nid">
                    {p.nid_url ? (
                      <a href={p.nid_url} target="_blank" rel="noreferrer">
                        View NID
                      </a>
                    ) : (
                      <span className="approval-row__no-nid">No file</span>
                    )}
                  </div>

                  <StatusPill status={p.approval_status} />

                  <div className="approval-row__actions">
                    {p.approval_status === "pending" ? (
                      <>
                        <button
                          type="button"
                          className="btn-approve"
                          disabled={busyId === p.id}
                          onClick={() => handleApprove(p.id)}
                        >
                          {busyId === p.id ? "..." : "Approve"}
                        </button>
                        <button
                          type="button"
                          className="btn-reject"
                          disabled={busyId === p.id}
                          onClick={() => setRejectingId(p.id)}
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className="approval-row__done">
                        {p.approval_status === "approved" ? "✓ Approved" : "✗ Rejected"}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {rejectingId !== null && (
        <div className="reject-modal__backdrop" onClick={() => setRejectingId(null)}>
          <div className="reject-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Reject application</h2>
            <p>Optional reason — this gets included in the email sent to the applicant.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. NID photo was unreadable, please re-upload"
              rows={4}
            />
            <div className="reject-modal__actions">
              <button type="button" onClick={() => setRejectingId(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="btn-reject"
                disabled={busyId === rejectingId}
                onClick={submitReject}
              >
                {busyId === rejectingId ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApprovalsPage;

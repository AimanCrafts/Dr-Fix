import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCurrentTechnician, logoutTechnician } from "../api/auth";
import "../css/application.css";

/**
 * Application Under Review (technician/jsx/application_under_review.jsx)
 * ---------------------------------------------------------------------
 * Shown to a provider who is logged in (has a valid JWT) but whose
 * approval_status is still "pending". They're NOT trapped here — they
 * can go back to the public homepage or log out.
 *
 * "Check Status" calls GET /api/technician/me (already built, behind
 * jwt.auth) and re-reads approval_status:
 *   - "approved" -> redirect to /technician/dashboard
 *   - "rejected" -> show a rejection message (no retry path built yet)
 *   - still "pending" -> show a small inline "still under review" note
 *
 * TODO (backend, not built yet): once an admin "Provider Approvals" page
 * exists, approving/rejecting an application should also send an email
 * (a new ApprovalMail, same pattern as OtpMail) so the technician doesn't
 * have to keep coming back here to check manually. The button below is
 * the interim solution until that email notification exists.
 */
function ApplicationUnderReview() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("pending"); // "pending" | "checking" | "still-pending" | "rejected" | "error"

  const handleCheckStatus = async () => {
    setStatus("checking");
    try {
      const { data } = await getCurrentTechnician();

      if (data.approval_status === "approved") {
        navigate("/technician/dashboard", { replace: true });
        return;
      }

      if (data.approval_status === "rejected") {
        setStatus("rejected");
        return;
      }

      setStatus("still-pending");
    } catch (err) {
      setStatus("error");
    }
  };

  const handleLogout = async () => {
    try {
      await logoutTechnician();
    } catch (err) {
      // Stateless JWT — even if this call fails (e.g. server down), it's
      // still safe to clear the local token below.
    }
    localStorage.removeItem("technician_token");
    localStorage.removeItem("technician_user");
    navigate("/technician/login", { replace: true });
  };

  return (
    <div className="review-page">
      <div className="review-card">
        <div className="review-icon-placeholder" aria-hidden="true">
          {/* ICON: clock/hourglass illustration — to be added later */}
        </div>

        <h1>Application Under Review</h1>
        <p className="review-subtext">
          Thanks for signing up as a Dr.-Fix provider. Our team is reviewing
          your details and ID — this usually takes 24-48 hours. We&apos;ll
          notify you by email once it&apos;s approved.
        </p>

        {status === "still-pending" && (
          <p className="review-note review-note--pending">
            Still under review. Please check back a bit later.
          </p>
        )}
        {status === "rejected" && (
          <p className="review-note review-note--rejected">
            Unfortunately, your application wasn&apos;t approved this time.
            Contact support if you think this is a mistake.
          </p>
        )}
        {status === "error" && (
          <p className="review-note review-note--rejected">
            Couldn&apos;t check your status right now. Please try again.
          </p>
        )}

        <button
          type="button"
          className="review-btn review-btn--primary"
          onClick={handleCheckStatus}
          disabled={status === "checking"}
        >
          {status === "checking" ? "Checking..." : "Check Status"}
        </button>

        <div className="review-links">
          <Link to="/">Back to Home</Link>
          <button
            type="button"
            className="review-links__logout"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default ApplicationUnderReview;
